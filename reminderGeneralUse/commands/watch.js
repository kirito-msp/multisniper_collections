const Watch = require('../models/Watch');

// Utility to safely escape user input for HTML
function escapeHTML(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = (bot) => {
  // --------------------------------------------------
  // /watch command - supports token and wallet subcommands only
  // --------------------------------------------------
  bot.command('watch', async (ctx) => {
    try {
      const messageText = ctx.message.text;
      // Remove the command itself (/watch) and get the rest of the arguments
      const args = messageText.split(' ').slice(1);
      const subcommand = args[0]?.toLowerCase();

      // Only support 'token' and 'wallet'
      if (!subcommand || (subcommand !== 'token' && subcommand !== 'wallet')) {
        return ctx.reply(
          'Usage:\n' +
          '• /watch token key=<keyword> [chain=<BSC|ETH|BASE|AVAX>]\n' +
          '• /watch token contract=<token_contract> filter=<listed|pair>\n' +
          '• /watch token wallet=<walletAddress> [chain=<BSC|ETH|BASE|AVAX>]\n' +
          '• /watch wallet address=<WalletAddress> [name=<walletName>]'
        );
      }

      // --------------------------------------------------
      // /watch token ...
      // --------------------------------------------------
      if (subcommand === 'token') {
        // Parse parameters in key=value format (all parameters must be provided in key=value pairs)
        let params = {};
        for (let i = 1; i < args.length; i++) {
          if (!args[i].includes('=')) {
            return ctx.reply("Invalid parameter format. Please use key=value pairs.");
          }
          const [key, ...rest] = args[i].split('=');
          const value = rest.join('=').trim();
          params[key.toLowerCase()] = value;
        }

        // Determine which variant of /watch token is being used
        if (params.key) {
          // Variant: /watch token key=<keyword> [chain=<BSC|ETH|BASE|AVAX>]
          let name = params.key.trim();
          if (!name) {
            return ctx.reply("Keyword cannot be empty.");
          }
          // Enforce a maximum of 20 characters
          if (name.length > 20) {
            name = name.substring(0, 20);
          }
          name = escapeHTML(name);
          // Process chain parameter (if provided, normalize to lowercase)
          let chain = "all";
          if (params.chain) {
            const chainVal = params.chain.toLowerCase();
            const allowedChains = new Set(['bsc', 'eth', 'base', 'avax']);
            if (!allowedChains.has(chainVal)) {
              return ctx.reply("Invalid chain provided. Allowed values: BSC, ETH, BASE, AVAX.");
            }
            chain = chainVal;
          }
          // Check if the token with the same key is already watched in this chat
          const existing = await Watch.findOne({
            type: 'token',
            name: name.toLowerCase(), // stored keyword is compared in lowercase
            chatId: ctx.chat.id
          });
          if (existing) {
            return ctx.reply(`Token with key "${name}" is already being watched.`);
          }
          // Create the watch record. (The backend field remains "name" for backward compatibility.)
          await Watch.create({
            userId: ctx.from.id,
            chatId: ctx.chat.id,
            type: 'token',
            name,
            chain
          });
          return ctx.reply(`🔔 Token with key "${name}" is now being watched on chain: ${chain.toUpperCase()}`);
        } else if (params.contract) {
          // Variant: /watch token contract=<token_contract> filter=<listed|pair>
          const contract = params.contract.trim();
          if (!/^0x[a-fA-F0-9]{40}$/.test(contract)) {
            return ctx.reply("Please provide a valid token contract address (0x followed by 40 hex characters).");
          }
          if (!params.filter) {
            return ctx.reply("Missing filter parameter. Use filter=listed or filter=pair.");
          }
          const filterValue = params.filter.toLowerCase();
          if (filterValue !== 'listed' && filterValue !== 'pair') {
            return ctx.reply("Invalid filter. Allowed values are listed or pair.");
          }
          // Check for duplicate watch
          const existing = await Watch.findOne({
            type: 'token',
            contractAddress: contract.toLowerCase(),
            filter: filterValue,
            chatId: ctx.chat.id
          });
          if (existing) {
            return ctx.reply(`Token contract ${contract} is already being watched with filter "${filterValue}".`);
          }
          await Watch.create({
            userId: ctx.from.id,
            chatId: ctx.chat.id,
            type: 'token',
            contractAddress: contract.toLowerCase(),
            filter: filterValue
          });
          return ctx.reply(`🔔 Token contract ${contract} is now being watched with filter "${filterValue}".`);
        } else if (params.wallet) {
          // Variant: /watch token wallet=<walletAddress> [chain=<BSC|ETH|BASE|AVAX>]
          // Save the wallet as a token watch by storing the wallet address in contractAddress and setting filter to "wallet".
          const walletAddress = params.wallet.trim();
          if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return ctx.reply("Please provide a valid wallet address (0x followed by 40 hex characters).");
          }
          let chain = "all";
          if (params.chain) {
            const chainVal = params.chain.toLowerCase();
            const allowedChains = new Set(['bsc', 'eth', 'base', 'avax']);
            if (!allowedChains.has(chainVal)) {
              return ctx.reply("Invalid chain provided. Allowed values: BSC, ETH, BASE, AVAX.");
            }
            chain = chainVal;
          } else {
            // If chain is not provided, default to "all"
            chain = "all";
          }

          // New logic: if chain equals "all", check for any existing record for this wallet regardless of chain.
          if (chain === 'all') {
            const existing = await Watch.findOne({
              type: 'token',
              contractAddress: walletAddress.toLowerCase(),
              filter: 'wallet',
              chatId: ctx.chat.id
            });
            if (existing) {
              if (existing.chain === 'all') {
                return ctx.reply(`Token wallet ${walletAddress} on chain ALL is already being watched.`);
              } else {
                // Update existing record to set chain to "all"
                await Watch.updateOne({ _id: existing._id }, { chain: 'all' });
                return ctx.reply(`🔔 Updated token wallet ${walletAddress} to be watched on ALL chains.`);
              }
            }
          } else {
            // Otherwise, check duplicate with the same chain.
            const existing = await Watch.findOne({
              type: 'token',
              contractAddress: walletAddress.toLowerCase(),
              filter: 'wallet',
              chain,
              chatId: ctx.chat.id
            });
            if (existing) {
              return ctx.reply(`Token wallet ${walletAddress} on chain ${chain.toUpperCase()} is already being watched.`);
            }
          }
          // If no record found (or updated), create a new watch record.
          await Watch.create({
            userId: ctx.from.id,
            chatId: ctx.chat.id,
            type: 'token',
            contractAddress: walletAddress.toLowerCase(),
            filter: 'wallet',
            chain
          });
          return ctx.reply(`🔔 Now watching tokens for wallet ${walletAddress} on chain: ${chain.toUpperCase()}`);
        } else {
          // None of the expected parameters were provided
          return ctx.reply(
            'Usage for /watch token:\n' +
            '• /watch token key=<keyword> [chain=<BSC|ETH|BASE|AVAX>]\n' +
            '• /watch token contract=<token_contract> filter=<listed|pair>\n' +
            '• /watch token wallet=<walletAddress> [chain=<BSC|ETH|BASE|AVAX>]'
          );
        }
      }

      // --------------------------------------------------
      // /watch wallet ...
      // --------------------------------------------------
      if (subcommand === 'wallet') {
        // Expected format: /watch wallet address=<WalletAddress> [name=<walletName>]
        let params = {};
        for (let i = 1; i < args.length; i++) {
          if (!args[i].includes('=')) {
            return ctx.reply("Invalid parameter format. Please use key=value pairs.");
          }
          const [key, ...rest] = args[i].split('=');
          const value = rest.join('=').trim();
          params[key.toLowerCase()] = value;
        }
        if (!params.address) {
          return ctx.reply("Usage: /watch wallet address=<WalletAddress> [name=<walletName>]");
        }
        const address = params.address.trim();
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
          return ctx.reply("Please provide a valid EVM wallet address (0x followed by 40 hex characters).");
        }
        // Check if the wallet is already being watched in this chat
        const existing = await Watch.findOne({
          type: 'wallet',
          address: address.toLowerCase(),
          chatId: ctx.chat.id
        });
        if (existing) {
          return ctx.reply(`Wallet <code>${address}</code> is already being watched.`, { parse_mode: 'HTML' });
        }
        let name = params.name ? params.name.trim() : ('wallet-' + Math.random().toString(36).substr(2, 8));
        if (name.length > 20) {
          name = name.substring(0, 20);
        }
        name = escapeHTML(name);
        await Watch.create({
          userId: ctx.from.id,
          chatId: ctx.chat.id,
          address: address.toLowerCase(),
          type: 'wallet',
          name
        });
        return ctx.reply(
          `🔔 Wallet <code>${address}</code> is now being watched under the name <b>${name}</b>.`,
          { parse_mode: 'HTML' }
        );
      }
    } catch (error) {
      console.error('Error in /watch command:', error);
      ctx.reply('❌ An unexpected error occurred. Please try again.');
    }
  });

  // --------------------------------------------------
  // /wlist command - list all watched items
  // --------------------------------------------------
  bot.command('wlist', async (ctx) => {
    try {
      const watches = await Watch.find({ chatId: ctx.chat.id });
      if (!watches.length) {
        return ctx.reply('No items are being watched in this chat.');
      }
     
      let message = '👁 <b>Watched Items</b>:\n';
      for (const w of watches) {
        if (w.type === 'wallet') {
          const nameDisplay = w.name ? escapeHTML(w.name) : 'NotNamed';
          message += `💁🏼‍♀️ All trades on <b>${nameDisplay}</b>\n`;
          message += `💳 <code>${w.address}</code>\n\n`;
        } else if (w.type === 'token') {          
          if (w.contractAddress && w.filter === 'wallet') {
            message += `📄 New contracts from: \n💳 <code>${w.contractAddress}</code>\n`;
            message += `🔗 Chain: <code>${w.chain}</code>\n\n`;
          } else if (w.contractAddress) {
            message += `📄 Monitor contract: <code>${w.contractAddress}</code>\n`;
            message += `🔸 Filter: <code>${w.filter}</code>\n\n`;
          } else if (w.name) {
            message += `💁 Token Key: <b>${escapeHTML(w.name)}</b>\n`;
            message += `🔗 Chain: <code>${w.chain}</code>\n\n`;
          }
        }
      }

      return ctx.reply(message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Error in /wlist command:', error);
      ctx.reply('❌ An unexpected error occurred. Please try again.');
    }
  });

  // --------------------------------------------------
  // /unwatch command - supports wallet (address or name), token (by contract) or all
  // --------------------------------------------------
  bot.command('unwatch', async (ctx) => {
    try {
      const messageText = ctx.message.text;
      const args = messageText.split(' ').slice(1);
      const subcommand = args[0]?.toLowerCase();

      if (!subcommand || !['wallet', 'token', 'all'].includes(subcommand)) {
        return ctx.reply(
          'Usage:\n' +
          '/unwatch wallet address=<address>\n' +
          '/unwatch wallet name=<walletName>\n' +
          '/unwatch token contract=<token_contract>\n' +
          '/unwatch all'
        );
      }

      // Unwatch all items for this chat
      if (subcommand === 'all') {
        const result = await Watch.deleteMany({ chatId: ctx.chat.id });
        if (result.deletedCount === 0) {
          return ctx.reply('There are no watched items to remove.');
        }
        return ctx.reply(`❌ Cleared ${result.deletedCount} watched item(s) from this chat.`);
      }

      // --------------------------------------------------
      // /unwatch wallet: expects address=<...> OR name=<...>
      // --------------------------------------------------
      if (subcommand === 'wallet') {
        if (!args[1] || !args[1].includes('=')) {
          return ctx.reply('Usage: /unwatch wallet address=<address> OR /unwatch wallet name=<walletName>');
        }
        const [key, ...rest] = args[1].split('=');
        const value = rest.join('=').trim();
        if (key.toLowerCase() === 'address') {
          const address = value;
          if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return ctx.reply('Please provide a valid wallet address.');
          }
          const result = await Watch.deleteOne({
            type: 'wallet',
            address: address.toLowerCase(),
            chatId: ctx.chat.id
          });
          if (result.deletedCount === 0) {
            return ctx.reply(`No watched wallet found for ${address}`);
          }
          return ctx.reply(`❌ Wallet <code>${address}</code> has been unwatched.`, { parse_mode: 'HTML' });
        } else if (key.toLowerCase() === 'name') {
          // Perform a case-insensitive match for wallet name
          const nameParam = value.toLowerCase();
          const result = await Watch.deleteOne({
            type: 'wallet',
            chatId: ctx.chat.id,
            name: { $regex: new RegExp('^' + nameParam + '$', 'i') }
          });
          if (result.deletedCount === 0) {
            return ctx.reply(`No watched wallet found with name "${value}"`);
          }
          return ctx.reply(`❌ Wallet with name "${value}" has been unwatched.`);
        } else {
          return ctx.reply('Invalid parameter. Use address=<address> or name=<walletName>.');
        }
      }

      // --------------------------------------------------
      // /unwatch token: expects contract=<token_contract>
      // --------------------------------------------------
      if (subcommand === 'token') {
        if (!args[1] || !args[1].includes('=')) {
          return ctx.reply('Usage: /unwatch token contract=<token_contract>');
        }
        const [key, ...rest] = args[1].split('=');
        const value = rest.join('=').trim();
        if (key.toLowerCase() !== 'contract') {
          return ctx.reply('Usage: /unwatch token contract=<token_contract>');
        }
        const contract = value;
        if (!/^0x[a-fA-F0-9]{40}$/.test(contract)) {
          return ctx.reply('Please provide a valid token contract address.');
        }
        const result = await Watch.deleteOne({
          type: 'token',
          contractAddress: contract.toLowerCase(),
          chatId: ctx.chat.id
        });
        if (result.deletedCount === 0) {
          return ctx.reply(`No watched token found for ${contract}`);
        }
        return ctx.reply(`❌ Token <code>${contract}</code> has been unwatched.`, { parse_mode: 'HTML' });
      }
    } catch (error) {
      console.error('Error in /unwatch command:', error);
      ctx.reply('❌ An unexpected error occurred. Please try again.');
    }
  });
};
