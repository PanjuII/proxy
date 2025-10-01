import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET requests allowed' });
  }

  try {
    const { message, username } = req.query;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message parameter is required' 
      });
    }

    // ⚠️ REPLACE THIS WITH YOUR ACTUAL DISCORD WEBHOOK URL
    const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1420743327560630384/T_8tYm7D9X2Km8so2mySjyipIUhwNQ1MgZl8wiPzi0oYXoquaQZpfxtmHxIPycQGBhlz';

    const webhookData = {
      content: message,
      username: username || 'Delta User',
      embeds: [
        {
          title: 'Message from Delta',
          description: message,
          color: 5814783,
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Via Vercel Proxy'
          }
        }
      ]
    };

    console.log('Sending to Discord:', webhookData);

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
        message: 'Webhook delivered to Discord!',
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