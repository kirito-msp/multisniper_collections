// models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  chatId: { type: Number, required: true, unique: true },
  type: { type: String, enum: ['private', 'group', 'supergroup', 'channel'], required: true },
  title: String,       // e.g., username for DM or group title for groups
  messageCount: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
