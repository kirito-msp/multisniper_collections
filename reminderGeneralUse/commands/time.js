const moment = require('moment-timezone');

module.exports = (bot) => {
  bot.command('time', async (ctx) => {
    const timezone = process.env.TIMEZONE || 'UTC';
    const now = moment().tz(timezone);
    
    const formatted = now.format('dddd, MMMM Do YYYY, HH:mm:ss z');
    await ctx.reply(`🕒 Current time is:\n<code>${formatted}</code>`, {
      parse_mode: 'HTML'
    });
  });
};
