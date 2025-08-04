const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: String,
  chatId: String,
  title: String,
  timestamp: Number,
  repeat: {
    type: String, // Examples: 'daily', 'weekly', '5m', '2h'
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reminder', reminderSchema);
