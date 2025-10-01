import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET requests allowed' });
  }

  try {
    const { message, username, jobid, placeid, gamename, playercount, animals } = req.query;

    const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1420743327560630384/T_8tYm7D9X2Km8so2mySjyipIUhwNQ1MgZl8wiPzi0oYXoquaQZpfxtmHxIPycQGBhlz";

    // Create multiple join links
    const robloxProtocolLink = `roblox://placeId=${placeid}&gameInstanceId=${jobid}`;
    const webLink = `https://roblox.com/games/start?placeId=${placeid}&gameInstanceId=${jobid}`;
    const mobileLink = `https://www.roblox.com/games/start?placeId=${placeid}&gameInstanceId=${jobid}`;

    const embed = {
      title: gamename || 'Roblox Server',
      color: 5814783, // Purple color
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: '🔗 Join Links',
          value: `**[Desktop App](${robloxProtocolLink})** • **[Web Browser](${webLink})** • **[Mobile](${mobileLink})**`,
          inline: false
        },
        {
          name: '🆔 Server ID',
          value: `\`${jobid}\``,
          inline: true
        },
        {
          name: '🎮 Place ID',
          value: `\`${placeid}\``,
          inline: true
        }
      ],
      footer: {
        text: 'Click the links above to join the server'
      }
    };

    // Add player count if available
    if (playercount) {
      embed.fields.push({
        name: '👥 Players',
        value: playercount,
        inline: true
      });
    }

    // Add animals data if available
    if (animals && animals !== "No%20animals%20found") {
      // Decode the animals data
      const decodedAnimals = decodeURIComponent(animals);
      embed.fields.push({
        name: '🐾 Animals Found',
        value: decodedAnimals.length > 1024 ? decodedAnimals.substring(0, 1020) + "..." : decodedAnimals,
        inline: false
      });
    }

    // Add custom message if provided
    if (message && message !== "Server%20info%20from%20Delta") {
      embed.fields.push({
        name: '💬 Note',
        value: message,
        inline: false
      });
    }

    const webhookData = {
      username: username || 'Server Scanner',
      embeds: [embed]
    };

    // If animals were found, add them to the content too for better visibility
    if (animals && animals !== "No%20animals%20found") {
      webhookData.content = `**🎮 Server Info + Animal Scan**\nFound animals in the world!`;
    }

    // Send to Discord
    const discordResponse = await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (discordResponse.status === 204) {
      return res.status(200).json({
        success: true,
        message: 'Server info and animal scan sent to Discord!',
        jobid: jobid,
        animals_found: animals ? true : false,
        links: {
          desktop: robloxProtocolLink,
          web: webLink,
          mobile: mobileLink
        }
      });
    } else {
      const errorText = await discordResponse.text();
      return res.status(500).json({
        success: false,
        error: `Discord error: ${discordResponse.status}`,
        details: errorText
      });
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error: ' + error.message
    });
  }
}
