// index.js (Main entry point)
require('dotenv').config();
const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { loadScheduledReminders } = require('./services/scheduler');
const { initializeCryptoWatchers } = require('./services/cryptoAlerts');

const config = require('./config.json');

const mongoUri = `mongodb://${config.mongodb.user}:${encodeURIComponent(config.mongodb.password)}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}?authSource=multiChainApi`;

mongoose.connect(mongoUri).then(() => {
  console.log('✅ MongoDB connected successfully.');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

const bot = new Telegraf(process.env.BOT_TOKEN);

// Load command handlers
fs.readdirSync(path.join(__dirname, 'commands')).forEach(file => {
  require(`./commands/${file}`)(bot);
});

// Load optional features (watch/mcap alerts)
const { registerWatchCommands } = require('./features/watchCommands');
registerWatchCommands(bot);

// Load scheduled jobs
loadScheduledReminders(bot);

// Start crypto alert watchers
initializeCryptoWatchers(bot);

// Start bot with webhook or polling
if (process.env.NODE_ENV === 'production') {
  const secretPath = `/telegraf/${process.env.SECRET_PATH}`;
  const port = Number(process.env.PORT || 3000);

  // Native HTTP server to handle webhook
  const server = http.createServer(bot.webhookCallback(secretPath));

  server.listen(port, () => {
    console.log(`🚀 Webhook server listening on port ${port}`);
    console.log(`🔗 Webhook path: ${secretPath}`);
  });

  // Register webhook with Telegram
  bot.telegram.setWebhook(`${process.env.DOMAIN}${secretPath}`).then(() => {
    console.log(`✅ Telegram webhook set at ${process.env.DOMAIN}${secretPath}`);
  }).catch(err => {
    console.error('❌ Failed to set Telegram webhook:', err.message);
  });

} else {
  bot.launch();
  console.log('🤖 Bot running in polling mode (dev)');
}

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
