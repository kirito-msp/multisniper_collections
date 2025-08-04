const moment = require('moment-timezone');

module.exports = (bot) => {
  bot.command('timezones', async (ctx) => {
    const query = ctx.message.text.split(' ')[1]?.toLowerCase() || '';
    const zones = moment.tz.names();

    const filtered = zones.filter(z => z.toLowerCase().includes(query));

    if (!filtered.length) {
      return ctx.reply('❌ No matching timezones found.');
    }

    const chunks = [];
    for (let i = 0; i < filtered.length; i += 40) {
      chunks.push(filtered.slice(i, i + 40));
    }

    for (const chunk of chunks) {
      await ctx.replyWithHTML(`<b>Timezones${query ? ` matching "${query}"` : ''}:</b>\n\n<code>${chunk.join('\n')}</code>`);
    }
  });
};
