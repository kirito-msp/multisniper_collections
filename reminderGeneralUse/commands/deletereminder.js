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

  bot.command('deletereminder', async (ctx) => {
    const parts = ctx.message.text.split(' ');
    const reminderId = parts[1];

    if (!reminderId) {
      return ctx.reply('❌ Please provide a reminder ID.\nExample: /deletereminder <reminder_id>');
    }

    try {
      const reminder = await Reminder.findById(reminderId);
      if (!reminder) {
        return ctx.reply('⚠️ Reminder not found.');
      }

      const isOwner = reminder.userId === ctx.from.id.toString();
      const isGroupAdmin = ctx.chat.type.endsWith('group') && await isAdmin(ctx);

      if (!isOwner && !isGroupAdmin) {
        return ctx.reply('❌ You can only delete your own reminders (or be a group admin).');
      }

      await Reminder.findByIdAndDelete(reminderId);

      ctx.reply(`✅ Reminder <code>${reminderId}</code> deleted.`, { parse_mode: 'HTML' });
    } catch (err) {
      console.error('Error deleting reminder:', err.message);
      ctx.reply('🚫 Invalid ID format or something went wrong.');
    }
  });
};
