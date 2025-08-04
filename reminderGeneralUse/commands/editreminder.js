const moment = require('moment-timezone');
const Reminder = require('../models/Reminder');
const User = require('../models/User');

module.exports = (bot) => {
  async function isAdmin(ctx) {
    try {
      const member = await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id);
      return ['creator', 'administrator'].includes(member.status);
    } catch (e) {
      return false;
    }
  }

  bot.command('editreminder', async (ctx) => {
    const message = ctx.message.text;

    const idMatch = message.match(/id\s*=\s*([a-f0-9]+)/i);
    const titleMatch = message.match(/title\s*=\s*([^]+?)(?=\s*date=|time=|repeat=|$)/);
    const dateMatch = message.match(/date\s*=\s*([0-9]{2}\.[0-9]{2})/);
    const timeMatch = message.match(/time\s*=\s*([0-9]{2}:[0-9]{2})/);
    const repeatMatch = message.match(/repeat\s*=\s*(\S+)/);

    if (!idMatch) {
      return ctx.reply('❌ Format:\n/editreminder id=<id> [title=...] [date=DD.MM] [time=HH:MM] [repeat=...]');
    }

    const id = idMatch[1];
    const reminder = await Reminder.findById(id);

    if (!reminder) {
      return ctx.reply('❌ Reminder not found.');
    }

    const isOwner = reminder.userId === ctx.from.id.toString();
    const isGroupAdmin = ctx.chat.type.endsWith('group') && await isAdmin(ctx);

    if (!isOwner && !isGroupAdmin) {
      return ctx.reply('❌ You can only edit your own reminders (or be a group admin).');
    }

    const user = await User.findOne({ userId: ctx.from.id });
    const timezone = user?.timezone || 'UTC';
    const now = moment().tz(timezone);

    if (titleMatch) reminder.title = titleMatch[1].trim();

    if (dateMatch || timeMatch) {
      const [day, month] = dateMatch
        ? dateMatch[1].split('.').map(Number)
        : moment.unix(reminder.timestamp).tz(timezone).format('DD.MM').split('.').map(Number);

      const [hour, minute] = timeMatch
        ? timeMatch[1].split(':').map(Number)
        : moment.unix(reminder.timestamp).tz(timezone).format('HH:mm').split(':').map(Number);

      let target = moment.tz(`${day}.${month}.${now.year()} ${hour}:${minute}`, 'DD.MM.YYYY HH:mm', timezone);
      if (target.isBefore(now)) target.add(1, 'year');

      reminder.timestamp = target.unix();
    }

    if (repeatMatch) {
      reminder.repeat = repeatMatch[1].toLowerCase();
    }

    await reminder.save();

    const formatted = moment.unix(reminder.timestamp).tz(timezone).format('DD.MM.YYYY HH:mm');

    let msg = `✏️ <b>Reminder Updated</b>\n\n`;
    msg += `📝 <b>${reminder.title}</b>\n`;
    msg += `🕒 <b>${formatted}</b> (${timezone})\n`;
    if (reminder.repeat) msg += `🔁 <b>Repeats:</b> ${reminder.repeat}\n`;
    if (timezone === 'UTC') {
      msg += `\n🌍 You are using UTC. Use <code>/settimezone</code> to customize.`;
    }

    ctx.reply(msg, { parse_mode: 'HTML' });
  });
};
