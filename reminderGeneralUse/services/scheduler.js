const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const moment = require('moment-timezone');
const { enqueueMessage } = require('./messageQueue'); 

// Parse repeat intervals like 5m, 2h, 3d
function parseRepeatInterval(interval) {
  const map = {
    min: 'minutes',
    mins: 'minutes',
    minute: 'minutes',
    minutes: 'minutes',
    m: 'minutes',
    h: 'hours',
    hr: 'hours',
    hrs: 'hours',
    hour: 'hours',
    hours: 'hours',
    d: 'days',
    day: 'days',
    days: 'days'
  };

  const match = interval.match(/^(\d+)\s*(\w+)$/i);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  return map[unit] ? { amount: value, unit: map[unit] } : null;
}


function loadScheduledReminders(bot) {
  cron.schedule('* * * * *', async () => {
    try {
      const now = moment().unix();
      const dueReminders = await Reminder.find({ timestamp: { $lte: now } });

      for (const reminder of dueReminders) {
        if (!reminder.chatId) {
          console.warn(`[Scheduler Warning] Skipping reminder with missing chatId:`, reminder._id);
          await Reminder.findByIdAndDelete(reminder._id);
          continue;
        }

        // Get timezone
        let timezone = process.env.TIMEZONE || 'UTC';
        const user = reminder.userId ? await User.findOne({ userId: reminder.userId }) : null;
        if (user?.timezone) timezone = user.timezone;

        const formattedTime = moment.unix(reminder.timestamp).tz(timezone).format('DD.MM.YYYY HH:mm');
        const message = `⏰ <b>Reminder</b>\n\n📝 <b>${reminder.title}</b>\n🕒 ${formattedTime} (${timezone})`;

        await enqueueMessage(reminder.chatId, message, { parse_mode: 'HTML', disable_web_page_preview: true });

        // === Repeat Logic ===
        if (reminder.repeat) {
          const base = moment.unix(reminder.timestamp).tz(timezone); // base time = last timestamp

          if (['daily', 'weekly', 'monthly'].includes(reminder.repeat)) {
            const unitMap = {
              daily: 'days',
              weekly: 'weeks',
              monthly: 'months'
            };
            base.add(1, unitMap[reminder.repeat]);
            reminder.timestamp = base.unix();
            await reminder.save();
            continue;
          }

          const parsed = parseRepeatInterval(reminder.repeat);
          if (parsed) {
            base.add(parsed.amount, parsed.unit);
            reminder.timestamp = base.unix();
            await reminder.save();
            continue;
          }

          // Invalid repeat value
          console.warn(`[Scheduler Warning] Invalid repeat value "${reminder.repeat}". Deleting.`);
          await Reminder.findByIdAndDelete(reminder._id);
        } else {
          // Non-repeating reminder → delete after triggering
          await Reminder.findByIdAndDelete(reminder._id);
        }
      }
    } catch (err) {
      console.error('[Scheduler Error]', err.message);
    }
  });

  console.log('✅ Reminder scheduler loaded and running every minute');
}

module.exports = {
  loadScheduledReminders
};
