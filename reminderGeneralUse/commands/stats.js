// commands/stats.js
const Chat = require('../models/Chat');

// Helper: get display name information from Telegram using the chat id.
async function getChatDisplay(chatId, ctx) {
  try {
    const chatInfo = await ctx.telegram.getChat(chatId);
    if (chatInfo.type === 'private') {
      // For private chats: combine first_name, last_name and append username if available.
      let name = chatInfo.first_name || '';
      if (chatInfo.last_name) name += ' ' + chatInfo.last_name;
      if (chatInfo.username) name += ` (@${chatInfo.username})`;
      return name.trim() || chatId;
    } else {
      // For groups: use title and append username if available.
      let name = chatInfo.title || chatId;
      if (chatInfo.username) name += ` (@${chatInfo.username})`;
      return name;
    }
  } catch (err) {
    console.error(`Error retrieving chat info for ${chatId}:`, err);
    return chatId;
  }
}

module.exports = (bot) => {
  bot.command('stats', async (ctx) => {
    // Retrieve the admin ID from process.env and restrict this command.
    const ADMIN_ID = parseInt(process.env.ADMIN, 10);
    if (ctx.from.id !== ADMIN_ID) {
      return;
    }
    
    try {
      // Retrieve overall stats.
      const totalUsers = await Chat.countDocuments({ type: 'private' });
      const totalGroups = await Chat.countDocuments({ type: { $in: ['group', 'supergroup'] } });
      const aggregate = await Chat.aggregate([
        { $group: { _id: null, totalMessages: { $sum: '$messageCount' } } }
      ]);
      const totalMessages = aggregate[0] ? aggregate[0].totalMessages : 0;
      
      // Retrieve top 10 records.
      const topUsersDocs = await Chat.find({ type: 'private' }).sort({ messageCount: -1 }).limit(10);
      const topGroupsDocs = await Chat.find({ type: { $in: ['group', 'supergroup'] } }).sort({ messageCount: -1 }).limit(10);
      
      // Get detailed display info from Telegram.
      const topUsers = await Promise.all(topUsersDocs.map(doc => getChatDisplay(doc.chatId || doc._id, ctx)));
      const topGroups = await Promise.all(topGroupsDocs.map(doc => getChatDisplay(doc.chatId || doc._id, ctx)));
      
      // Build formatted reply message.
      let replyMessage = `📊 *Bot Statistics:*\n\n`;
      replyMessage += `👤 *Total Users (DM):* ${totalUsers.toLocaleString()}\n`;
      replyMessage += `👥 *Total Groups:* ${totalGroups.toLocaleString()}\n`;
      replyMessage += `💬 *Total Messages Sent:* ${totalMessages.toLocaleString()}\n\n`;
      
      replyMessage += `*Top 10 Users:*\n`;
      topUsersDocs.forEach((user, index) => {
        replyMessage += `*${index + 1}.* 👤 *${topUsers[index]}*\n   _Messages: ${user.messageCount.toLocaleString()}_\n\n`;
      });
      
      replyMessage += `*Top 10 Groups:*\n`;
      topGroupsDocs.forEach((group, index) => {
        replyMessage += `*${index + 1}.* 👥 *${topGroups[index]}*\n   _Messages: ${group.messageCount.toLocaleString()}_\n\n`;
      });
      
      return ctx.replyWithMarkdown(replyMessage);
    } catch (err) {
      console.error('Error fetching stats:', err);
      return ctx.reply('❌ Error fetching stats');
    }
  });
};
