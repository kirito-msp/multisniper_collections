const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

// Function to send a message to a specific chat ID
async function sendTelegramMessage(chatId, message) {
  try {
    await bot.telegram.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    
   // console.log(`Message sent to chat ${chatId}: ${message}`);
  } catch (error) {
    console.error(`Error sending message to ${chatId}:`, error.message);
  }
}

module.exports = { sendTelegramMessage };
