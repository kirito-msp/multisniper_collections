const { enqueueMessage } = require('./messageQueue');

// Function to send notifications
async function sendTradeNotification(user, message) {
  try {
    if (user.chatId) {
      // If user is in a group or private chat
      await enqueueMessage(user.chatId, message, { parse_mode: 'HTML', disable_web_page_preview: true });
    }
  } catch (error) {
    console.error('Error sending trade notification:', error.message);
  }
}

module.exports = { sendTradeNotification };
