const Reminder = require('../models/Reminder');
const User = require('../models/User');
const moment = require('moment-timezone');

module.exports = (bot) => {
  bot.command('showreminders', async (ctx) => {
    try {
      // Choose query based on chat type
      let query;
      if (ctx.chat.type === 'private') {
        // In DM, show only the user's own reminders
        query = { userId: ctx.from.id };
      } else {
        // In a group/channel, show all reminders set in that chat
        query = { chatId: ctx.chat.id };
      }
      
      const reminders = await Reminder.find(query).sort({ timestamp: 1 });

      if (!reminders.length) {
        return ctx.reply('📭 No active reminders found.');
      }

      // Determine the timezone.
      // In private chats we check the user's saved timezone; in group/channel we use process.env.TIMEZONE (or default 'UTC')
      let timezone = process.env.TIMEZONE || 'UTC';
      if (ctx.chat.type === 'private') {
        const user = await User.findOne({ userId: ctx.from.id });
        if (user?.timezone) {
          timezone = user.timezone;
        }
      }
      
      const now = moment().tz(timezone);
      // Set the title based on context
      let message = ctx.chat.type === 'private'
        ? '📅 <b>Your Reminders</b>\n\n'
        : '📅 <b>Group Reminders</b>\n\n';

      // Build the message per reminder
      for (const reminder of reminders) {
        const time = moment.unix(reminder.timestamp).tz(timezone);
        const timeStr = time.format('DD.MM.YYYY HH:mm');

        // Calculate the remaining duration, or show "Past due"
        let inStr = '';
        const diff = time.diff(now);
        if (diff <= 0) {
          inStr = '└ ⚠️ <i>Past due</i>';
        } else {
          const duration = moment.duration(diff);
          const parts = [];
          if (duration.days()) parts.push(`${duration.days()}d`);
          if (duration.hours()) parts.push(`${duration.hours()}h`);
          if (duration.minutes()) parts.push(`${duration.minutes()}m`);
          if (!parts.length) parts.push('less than a minute');
          inStr = `└ ${parts.join(' ')}`;
        }
        
        // In a group, include which user created the reminder.
        if (ctx.chat.type === 'private') {
          message += `🆔 <code>${reminder._id}</code>\n📝 ${reminder.title}\n🕒 ${timeStr}\n${inStr}`;
        } else {
          message += `🆔 <code>${reminder._id}</code>\n📝 ${reminder.title}\n🕒 ${timeStr}\n${inStr}`;
        }
        if (reminder.repeat) {
          message += `\n🔁 <i>Repeats: ${reminder.repeat}</i>`;
        }
        message += '\n\n';
      }

      ctx.reply(message.trim(), { parse_mode: 'HTML' });
    } catch (err) {
      console.error('Error fetching reminders:', err.message);
      ctx.reply('❌ Failed to fetch your reminders.');
    }
  });
};
