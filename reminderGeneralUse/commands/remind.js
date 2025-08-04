const moment = require('moment-timezone');
const Reminder = require('../models/Reminder');
const User = require('../models/User');

// Escape utility
function escapeHTML(input = '') {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = (bot) => {

  // ========================
  // /remind
  // ========================
  bot.command('remind', async (ctx) => {
    try {
      const message = ctx.message.text;

      // Basic extraction of fields
      const titleMatch = message.match(/title\s*=\s*([^]+?)(?=\s*date=|$)/);
      const dateMatch = message.match(/date\s*=\s*([0-9]{2}\.[0-9]{2})/);
      const timeMatch = message.match(/time\s*=\s*([0-9]{2}:[0-9]{2})/);
      const repeatMatch = message.match(/repeat\s*=\s*(\S+)/);

      // If essential parameters are missing
      if (!titleMatch || !dateMatch || !timeMatch) {
        return ctx.reply(
          '❌ Format:\n' +
          '/remind title=<title> date=DD.MM time=HH:MM [repeat=daily|3d|2h]\n\n' +
          'Example:\n/remind title=Call mom date=18.04 time=16:30 repeat=daily'
        );
      }

      const rawTitle = titleMatch[1].trim();

      // Enforce title length limit (e.g., 400 chars)
      if (rawTitle.length > 400) {
        return ctx.reply('❌ Title is too long. Please limit it to 400 characters or fewer.');
      }

      // Sanitize user input
      const title = escapeHTML(rawTitle);

      // Parse date/time
      const [day, month] = dateMatch[1].split('.').map(Number);
      const [hour, minute] = timeMatch[1].split(':').map(Number);

      // Validate day/month/hour/minute
      if (day < 1 || day > 31 || month < 1 || month > 12 ||
          hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return ctx.reply('❌ Invalid date or time provided. Make sure it’s in range and try again.');
      }

      // Repeat parameter (optional)
      const validRepeats = new Set(['daily','3d','2h']);  // or whichever repeats you allow
      let repeat = repeatMatch ? repeatMatch[1].toLowerCase() : null;
      if (repeat && !validRepeats.has(repeat)) {
        // If user typed something invalid for repeat
        repeat = null;
      }

      // Find or create user
      let user = await User.findOne({ userId: ctx.from.id });
      if (!user) {
        user = await User.create({
          userId: ctx.from.id,
          timezone: 'UTC',
          createdAt: new Date()
        });
      }
      const timezone = user.timezone || 'UTC';

      // Compare target time against now
      const now = moment().tz(timezone);
      const target = moment.tz(
        `${day}.${month}.${now.year()} ${hour}:${minute}`,
        'DD.MM.YYYY HH:mm',
        timezone
      );

      // If user accidentally picks a date/time in the past
      if (target.isBefore(now)) {
        return ctx.reply(
          '⚠️ That time is already in the past. Please choose a future date/time.'
        );
      }

      // Save new reminder
      const reminder = new Reminder({
        userId: ctx.from.id,
        chatId: ctx.chat.id,
        title, // already escaped
        timestamp: target.unix(),
        repeat,
        createdAt: new Date()
      });

      await reminder.save();

      // Construct safe reply text
      let reply = `✅ Reminder set:\n<b>${title}</b>\n` +
                  `🕒 <b>${target.format('DD.MM.YYYY HH:mm')}</b> (${timezone})\n` +
                  `🆔 <code>${reminder._id}</code>`;
      if (repeat) {
        reply += `\n🔁 Repeats: <b>${repeat}</b>`;
      }
      if (timezone === 'UTC') {
        reply += `\n\n🕒 You are using UTC. Use /settimezone Region/City to change.`;
      }

      ctx.reply(reply, { parse_mode: 'HTML' });

    } catch (error) {
      console.error('Error in /remind command:', error);
      ctx.reply('❌ An unexpected error occurred. Please try again.');
    }
  });


  // ========================
  // /editreminder
  // ========================
  bot.command('editreminder', async (ctx) => {
    try {
      const message = ctx.message.text;
      const idMatch = message.match(/id\s*=\s*([a-f0-9]+)/i);

      if (!idMatch) {
        return ctx.reply('❌ Usage:\n/editreminder id=<id> [title=...] [date=DD.MM] [time=HH:MM] [repeat=...]');
      }

      const reminderId = idMatch[1];

      // Extract optional fields
      const titleMatch = message.match(/title\s*=\s*([^]+?)(?=\s*(date=|time=|repeat=|$))/);
      const dateMatch = message.match(/date\s*=\s*([0-9]{2}\.[0-9]{2})/);
      const timeMatch = message.match(/time\s*=\s*([0-9]{2}:[0-9]{2})/);
      const repeatMatch = message.match(/repeat\s*=\s*(\S+)/);

      // Fetch reminder & check permission
      const reminder = await Reminder.findById(reminderId);
      if (!reminder || reminder.userId !== ctx.from.id.toString()) {
        return ctx.reply('❌ Reminder not found or you do not have permission to edit it.');
      }

      // Update title if needed
      if (titleMatch) {
        const rawTitle = titleMatch[1].trim();
        if (rawTitle.length > 400) {
          return ctx.reply('❌ Title is too long. Please limit it to 400 characters or fewer.');
        }
        reminder.title = escapeHTML(rawTitle);
      }

      // Find user & determine timezone
      let user = await User.findOne({ userId: ctx.from.id });
      const timezone = user?.timezone || 'UTC';
      const now = moment().tz(timezone);

      // If user wants to edit date/time
      if (dateMatch || timeMatch) {
        let [day, month] = [now.date(), now.month() + 1];
        let [hour, minute] = [now.hour(), now.minute()];

        if (dateMatch) {
          const [d, m] = dateMatch[1].split('.').map(Number);
          // Validate
          if (d < 1 || d > 31 || m < 1 || m > 12) {
            return ctx.reply('❌ Invalid date. Make sure day/month is correct.');
          }
          day = d;
          month = m;
        }
        if (timeMatch) {
          const [h, min] = timeMatch[1].split(':').map(Number);
          // Validate
          if (h < 0 || h > 23 || min < 0 || min > 59) {
            return ctx.reply('❌ Invalid time. Hours must be 0-23, minutes 0-59.');
          }
          hour = h;
          minute = min;
        }

        // Build new moment
        let newTime = moment.tz(
          `${day}.${month}.${now.year()} ${hour}:${minute}`,
          'DD.MM.YYYY HH:mm',
          timezone
        );

        // If that time is in the past, consider next year (or maybe reject it)
        if (newTime.isBefore(now)) {
          newTime.add(1, 'year');
        }

        reminder.timestamp = newTime.unix();
      }

      // If user wants to change repeat
      if (repeatMatch) {
        const validRepeats = new Set(['daily','3d','2h']);
        let repeat = repeatMatch[1].toLowerCase();
        if (!validRepeats.has(repeat)) {
          repeat = null;
        }
        reminder.repeat = repeat;
      }

      // Save updates
      await reminder.save();

      // Build final response
      const formatted = moment.unix(reminder.timestamp).tz(timezone).format('DD.MM.YYYY HH:mm');
      let msg =
        `✏️ Reminder updated.\n` +
        `🆔 <code>${reminder._id}</code>\n` +
        `📝 <b>${reminder.title}</b>\n` +
        `🕒 <b>${formatted}</b> (${timezone})`;

      if (reminder.repeat) {
        msg += `\n🔁 Repeats: <b>${reminder.repeat}</b>`;
      }

      ctx.reply(msg, { parse_mode: 'HTML' });

    } catch (error) {
      console.error('Error in /editreminder command:', error);
      ctx.reply('❌ An unexpected error occurred. Please try again.');
    }
  });
};
