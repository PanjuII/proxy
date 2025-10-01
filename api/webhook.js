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

    // Use DISCORD_WEBHOOK_URL from environment variables
    const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1420743327560630384/T_8tYm7D9X2Km8so2mySjyipIUhwNQ1MgZl8wiPzi0oYXoquaQZpfxtmHxIPycQGBhlz";

    if (!DISCORD_WEBHOOK) {
      return res.status(500).json({ 
        success: false, 
        error: 'Discord webhook not configured' 
      });
    }

    // Create embed based on available data
    const embed = {
      title: 'Roblox Server Information',
      color: 5814783,
      timestamp: new Date().toISOString(),
      fields: []
    };

    // Add JobId if provided
    if (jobid) {
      embed.fields.push({
        name: '🔗 Job ID',
        value: `\`${jobid}\``,
        inline: true
      });
      
      // Add server link
      embed.fields.push({
        name: '🌐 Server Link',
        value: `[Join Server](https://roblox.com/games/start?placeId=${placeid || '0'}&gameInstanceId=${jobid})`,
        value: `roblox://placeId=${placeid || '0'}&gameInstanceId=${jobid}`,
        inline: true
      });
    }

    // Add Place ID if provided
    if (placeid) {
      embed.fields.push({
        name: '🎮 Place ID',
        value: `\`${placeid}\``,
        inline: true
      });
    }

    // Add Game Name if provided
    if (gamename) {
      embed.fields.push({
        name: '🎯 Game',
        value: gamename,
        inline: true
      });
    }

    // Add Player Count if provided
    if (playercount) {
      embed.fields.push({
        name: '👥 Players',
        value: playercount,
        inline: true
      });
    }

    // Add custom message if provided
    if (message) {
      embed.fields.push({
        name: '💬 Message',
        value: message,
        inline: false
      });
    }

    const webhookData = {
      username: username || 'Delta Server Tracker',
      embeds: [embed]
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
        message: 'Server info sent to Discord!',
        jobid: jobid || 'None',
        timestamp: new Date().toISOString()
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
