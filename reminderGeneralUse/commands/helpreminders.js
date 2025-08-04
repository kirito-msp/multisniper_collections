module.exports = (bot) => {
    bot.command('helpreminders', (ctx) => {
      const helpText = `
  🛎️ <b>Reminder Bot Commands</b>
  
  /remind <i>title=...</i> <i>date=DD.MM</i> <i>time=HH:MM</i>  
  📌 Set a reminder.  
  Example: <code>/remind title=Launch Party date=25.06 time=18:30</code>
  
  /showreminders  
  📋 List your active reminders
  
  /deletereminder <i>id</i>  
  🗑️ Delete one reminder by ID  
  Example: <code>/deletereminder 660faba1e9d3d5436b123456</code>
  
  /deleteallreminders  
  🔥 Delete all your reminders
  
  /helpreminders  
  📖 Show this help menu
  `;
  
      ctx.reply(helpText, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
    });
  };
  