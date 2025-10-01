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
    const { message, username, jobid, placeid, gamename, playercount } = req.query;

    const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1420743327560630384/T_8tYm7D9X2Km8so2mySjyipIUhwNQ1MgZl8wiPzi0oYXoquaQZpfxtmHxIPycQGBhlz";

    if (!DISCORD_WEBHOOK) {
      return res.status(500).json({ 
        success: false, 
        error: 'Discord webhook not configured' 
      });
    }

    // Create multiple join links
    const robloxProtocolLink = `https://fern.wtf/joiner?placeId=${placeid}&gameInstanceId=${jobid}`;
    const webLink = `https://roblox.com/games/start?placeId=${placeid}&gameInstanceId=${jobid}`;
    const mobileLink = `https://www.roblox.com/games/start?placeId=${placeid}&gameInstanceId=${jobid}`;

    const embed = {
      title: gamename || 'Roblox Server',
      color: 3447003, // Blue color
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

    // Add custom message if provided
    if (message && message !== "Server%20info%20from%20Delta") {
      embed.fields.push({
        name: '💬 Note',
        value: message,
        inline: false
      });
    }

    const webhookData = {
      username: username || 'Server Join Links',
      embeds: [embed],
      content: `**Click the links below to join the server!** 🎮`
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
        message: 'Join links sent to Discord!',
        jobid: jobid,
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

