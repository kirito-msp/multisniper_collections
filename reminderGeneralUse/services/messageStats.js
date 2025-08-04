// services/messageStats.js
const Chat = require('../models/Chat');

async function recordMessageSent(chatId, chatType = null, chatTitle = '') {
  try {
    // Use provided chatType if available; otherwise use a heuristic (positive IDs for users, negative for groups)
    let type = chatType || (chatId > 0 ? 'private' : 'group');
    await Chat.findOneAndUpdate(
      { chatId },
      {
        $inc: { messageCount: 1 },
        $set: { type, lastActive: new Date(), ...(chatTitle && { title: chatTitle }) }
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error(`Error updating chat stats for ${chatId}:`, err);
  }
}

module.exports = { recordMessageSent };
