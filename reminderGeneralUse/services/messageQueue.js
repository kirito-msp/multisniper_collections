// services/messageQueue.js
// Note: Ensure you have access to your bot instance here.
// You might need to import or pass 'bot' appropriately.
const { recordMessageSent } = require('./messageStats');
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);
// In-memory queue and helper variables
let queue = [];
let isSending = false;
let lastSendTimeByChat = new Map();

// Update enqueueMessage signature to also pass chatType and chatTitle if available
function enqueueMessage(chatId, text, options = {}, chatType = '', chatTitle = '') {
  return new Promise((resolve, reject) => {
    queue.push({ chatId, text, options, chatType, chatTitle, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  if (isSending) return;
  isSending = true;
  while (queue.length > 0) {
    const task = queue[0];  // Peek the next message
    const { chatId, text, options, chatType, chatTitle, resolve, reject } = task;
    const now = Date.now();
    const lastTime = lastSendTimeByChat.get(chatId) || 0;
    const timeSinceLast = now - lastTime;
    if (timeSinceLast < 1000) {
      // Wait for 1 second between messages to the same chat
      await new Promise(r => setTimeout(r, 1000 - timeSinceLast));
    }
    try {
      // Send the message
      await bot.telegram.sendMessage(chatId, text, options);
      lastSendTimeByChat.set(chatId, Date.now());
      
      // Record the message send in stats
      recordMessageSent(chatId, chatType, chatTitle);
      
      queue.shift(); // Remove the task from the queue
      resolve();
    } catch (err) {
      if (err.code === 429 && err.parameters?.retry_after) {
        console.warn(`Rate limit hit, pausing for ${err.parameters.retry_after} seconds`);
        await new Promise(r => setTimeout(r, err.parameters.retry_after * 1000));
        // Do not shift task so it will be retried
      } else {
        console.error(`Failed to send message to ${chatId}:`, err);
        queue.shift(); // Remove the task to avoid blocking the queue
        reject(err);
      }
    }
    // Global throttle delay (e.g., ~50ms) to reduce bursts
    await new Promise(r => setTimeout(r, 50));
  }
  isSending = false;
}

module.exports = { enqueueMessage };
