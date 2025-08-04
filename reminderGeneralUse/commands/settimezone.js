// commands/settimezone.js
const moment = require('moment-timezone');

const User = require('../models/User');

module.exports = (bot) => {
  bot.command('settimezone', async (ctx) => {
    const tz = ctx.message.text.split(' ')[1];

    if (!tz || !moment.tz.zone(tz)) {
      return ctx.reply('❌ Invalid timezone. Example: /settimezone Europe/Berlin');
    }

    await User.findOneAndUpdate(
      { userId: ctx.from.id },
      { timezone: tz },
      { upsert: true }
    );

    return ctx.reply(`✅ Your timezone has been set to ${tz}`);
  });
};
