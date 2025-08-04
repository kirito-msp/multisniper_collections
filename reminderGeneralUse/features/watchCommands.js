// features/watchCommands.js
const { Markup } = require('telegraf');

// In-memory watch list (replace with DB in future)
const watchWallets = new Set();
const watchTokens = [];

function registerWatchCommands(bot) {
  // /watchwallet <address>
  bot.command('watchwallet', (ctx) => {
    const parts = ctx.message.text.split(' ');
    const wallet = parts[1];

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return ctx.reply('❌ Invalid wallet address. Usage: /watchwallet 0x123...');
    }

    watchWallets.add(wallet.toLowerCase());
    ctx.reply(`✅ Wallet <code>${wallet}</code> added to watch list.`, { parse_mode: 'HTML' });
  });

  // /watchtoken <symbol> <mcap>
  bot.command('watchtoken', (ctx) => {
    const parts = ctx.message.text.split(' ');
    const symbol = parts[1];
    const mcap = parseInt(parts[2]);

    if (!symbol || isNaN(mcap)) {
      return ctx.reply('❌ Usage: /watchtoken PEPE 1000000');
    }

    watchTokens.push({ symbol: symbol.toUpperCase(), minMcap: mcap });
    ctx.reply(`✅ Watching <b>${symbol.toUpperCase()}</b> for mcap ≥ <b>$${mcap.toLocaleString()}</b>.`, { parse_mode: 'HTML' });
  });

  // /showwatches
  bot.command('showwatches', (ctx) => {
    let message = '<b>Watched Wallets</b>\n';
    if (watchWallets.size === 0) message += '— None\n';
    else watchWallets.forEach(w => message += `• ${w}\n`);

    message += '\n<b>Watched Tokens</b>\n';
    if (watchTokens.length === 0) message += '— None';
    else watchTokens.forEach(t => message += `• ${t.symbol} ≥ $${t.minMcap.toLocaleString()}\n`);

    ctx.reply(message, { parse_mode: 'HTML' });
  });
}

module.exports = {
  registerWatchCommands,
  watchWallets,
  watchTokens
};