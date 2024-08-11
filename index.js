const { Client, Intents } = require('discord.js-selfbot-v13');
const { Catbox } = require('node-catbox');
const express = require('express');
const fs = require('fs');

// Initialize Express
const app = express();
const PORT = 3000; // You can change this to any port you prefer

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const client = new Client(
   // checkUpdate: false,
    //intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
);

const catbox = new Catbox();
const CHANNEL_ID = process.env['C']; // Replace with your target channel ID
const FILE_PATH = 'videos.txt';

// Helper function to filter and upload attachments
async function handleAttachment(attachment) {
    const fileTypes = ['.png', '.jpg', '.jpeg', '.mp4', '.webm'];
    const url = attachment.url;
    
    if (fileTypes.some(type => url.endsWith(type))) {
        try {
            const response = await catbox.uploadURL({ url });
            console.log(`Uploaded: ${response}`);
            fs.appendFileSync(FILE_PATH, `${response}\n`);
        } catch (err) {
            console.error(`Failed to upload ${url}: ${err}`);
        }
    }
}

// Function to fetch all messages and process attachments
async function fetchAndProcessMessages() {
    const channel = await client.channels.fetch(process.env['C']);
    let lastMessageId;

    while (true) {
        const options = { limit: 100 };
        if (lastMessageId) {
            options.before = lastMessageId;
        }

        const messages = await channel.messages.fetch(options);
        if (messages.size === 0) break;

        for (const message of messages.values()) {
            for (const attachment of message.attachments.values()) {
                await handleAttachment(attachment);
            }
        }

        lastMessageId = messages.last().id;
    }
}

// Function to check for new messages every hour
async function checkForNewMessages() {
    const channel = await client.channels.fetch(process.env['C']);
    const messages = await channel.messages.fetch({ limit: 100 }); // Adjust limit as needed

    for (const message of messages.values()) {
        for (const attachment of message.attachments.values()) {
            await handleAttachment(attachment);
        }
    }
}

// Login and start the bot
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    
    // Fetch all old messages and process them
    await fetchAndProcessMessages();

    // Set an interval to check for new messages every hour (3600000 ms)
    setInterval(checkForNewMessages, 3600000);
});

// Replace with your Discord token
client.login(process.env['TOKEN']);
