module.exports = (bot) => {
    bot.command('start', (ctx) => {
      const message = `
  <b>🤖 Telegram Reminder & Crypto Alerts Bot (BETA)</b>
  
  Manage your reminders and monitor crypto events right from Telegram.
  🔸 For use in groups or directly in dm!
  
  ━━━━━━━━━━━━━━━━━━━━
  <b>🕐 Reminder Commands</b>
  • <code>/remind title=text date=DD.MM time=HH:MM repeat=value</code>
    ▫️ Create a reminder (it can be recurring)
  • <code>/editreminder id=value title=text date=DD.MM time=HH:MM repeat=value</code>
    ▫️ Modify an existing reminder
  • <code>/showreminders</code>
    ▫️ See your upcoming reminders with a countdown
  • <code>/deletereminder id</code> or <code>/deleteallreminders</code>
    ▫️ Remove one reminder (by its id) or all reminders
  
  ━━━━━━━━━━━━━━━━━━━━
  <b>🔁 Supported Repeat Values</b>
  ▫️ Use the words daily, weekly, or monthly
  ▫️ Or set intervals with numbers and time units like 5m, 2h, 3d
  
  ━━━━━━━━━━━━━━━━━━━━
  <b>📡 Crypto Watch & Alerts Commands</b>
  
  • <code>/watch wallet address=walletAddress [optional: name=walletName]</code>
    ▫️ Start watching a wallet address and get alerts about every buy/sell on BSC, ETH, BASE, AVAX (Wallet Tracker)
  
  • <code>/watch token key=KeyWord [optional: chain=BSC|ETH|BASE|AVAX]</code>
  ▫️ Get alerts about any new token created that includes your keyword in the name or symbol. Optional you can use chain=BSC or other allowed chains to limit to only tokens created on that specific chain.
  
  • <code>/watch token contract=tokenContract filter=listed|pair</code>
  ▫️ Get alerts when the token gets listed on dex or if you use the "pair" filter it will alert when a new pair is created for the tracked token.
  
  • <code>/watch token wallet=walletAddress [optional: chain=BSC|ETH|BASE|AVAX]</code>
  ▫️ Get alerts when the traget wallet address creates a new token. Optional you can use chain=BSC or other allowed chains to limit to only tokens created on that specific chain.
  
  • <code>/wlist</code>
    ▫️ Display all the wallets and tokens you are currently watching
  • <code>/unwatch wallet address=walletAddress</code>
    ▫️ Stop watching a wallet by its address
  • <code>/unwatch wallet name=walletName</code>
    ▫️ Stop watching a wallet by its name
  • <code>/unwatch token contract=tokenContract</code>
    ▫️ Stop watching a token by its contract address
  • <code>/unwatch all</code>
    ▫️ Remove all watched items from this chat
  
  ━━━━━━━━━━━━━━━━━━━━
  <b>🌍 Timezone Commands</b>
  • <code>/settimezone Region/City</code>
    ▫️ Set your timezone so reminder times are correct. Example: /settimezone Europe/Bucharest
  • <code>/timezones filterValue</code>
    ▫️ List available timezones. For instance: /timezones america
  
  ━━━━━━━━━━━━━━━━━━━━
  <b>📌 Example Commands</b>
  • <code>/remind title=ETH unlock date=01.05 time=14:00 repeat=weekly</code>
  • <code>/watch token name=ai</code>
  • <code>/watch token contract=0x170d...34444 filter=listed chain=bsc</code>
  • <code>/watch token contract=0x170d...34444 filter=pair</code>
  • <code>/watch token contract=0x0056...75d9E filter=wallet</code>
  • <code>/unwatch all</code>
  
  ━━━━━━━━━━━━━━━━━━━━
  <b>💡 Tip:</b> Always set your timezone with /settimezone for accurate reminder times.
  <b>🧠 Reminder:</b> Use /help anytime to see this menu.
  <b>👤 Contact & Feedback:</b> DM @x3raphim or join https://t.me/multisniperbots.
  
      `;
      ctx.reply(message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
    });
  };
  