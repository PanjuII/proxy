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
    const { message, username, jobid, placeid, gamename, playercount, animals, customlink } = req.query;

    const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1420743327560630384/T_8tYm7D9X2Km8so2mySjyipIUhwNQ1MgZl8wiPzi0oYXoquaQZpfxtmHxIPycQGBhlz";

    // Use custom link if provided, otherwise generate default links
    let joinLinks = "";
    if (customlink && customlink !== "None") {
      const decodedLink = decodeURIComponent(customlink);
      joinLinks = `**[Custom Server Link](${decodedLink})**`;
    } else {
      const robloxProtocolLink = `roblox://placeId=${placeid}&gameInstanceId=${jobid}`;
      const webLink = `https://roblox.com/games/start?placeId=${placeid}&gameInstanceId=${jobid}`;
      const mobileLink = `https://www.roblox.com/games/start?placeId=${placeid}&gameInstanceId=${jobid}`;
      joinLinks = `**[Desktop App](${robloxProtocolLink})** • **[Web Browser](${webLink})** • **[Mobile](${mobileLink})**`;
    }

    const embed = {
      title: gamename || 'Roblox Private Server',
      color: 10181046, // Purple color for private servers
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: '🔗 Join Links',
          value: joinLinks,
          inline: false
        },
        {
          name: '🛡️ Server Type',
          value: '**Private Server** ✅',
          inline: true
        },
        {
          name: '🆔 Server ID',
          value: `\`${jobid}\``,
          inline: true
        }
      ],
      footer: {
        text: customlink ? 'Using custom server link' : 'Using auto-generated links'
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
      username: username || 'Private Server Scanner',
      embeds: [embed],
      content: `**🛡️ Private Server Detected!**\n${customlink ? 'Using custom server link provided' : 'Join using the links below!'}`
    };

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
        message: 'Private server info sent to Discord!',
        server_type: 'private',
        used_custom_link: !!customlink && customlink !== "None",
        jobid: jobid
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
