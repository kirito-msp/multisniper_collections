const Reminder = require('../models/Reminder');

module.exports = (bot) => {
  async function isAdmin(ctx) {
    try {
      const member = await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id);
      return ['creator', 'administrator'].includes(member.status);
    } catch (e) {
      return false;
    }
  }

  bot.command('deleteallreminders', async (ctx) => {
    try {
      let filter = { userId: ctx.from.id };

      if (ctx.chat.type.endsWith('group') && await isAdmin(ctx)) {
        filter = { chatId: ctx.chat.id };
      }

      const result = await Reminder.deleteMany(filter);
      ctx.reply(`🗑️ Deleted ${result.deletedCount} reminders.`);
    } catch (err) {
      console.error('Error deleting all reminders:', err.message);
      ctx.reply('❌ Failed to delete reminders.');
    }
  });
};
