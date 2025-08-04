# 📲 Telegram Reminder & Crypto Alerts Bot

This is a full-featured Telegram bot built with [Telegraf.js](https://telegraf.js.org/) and MongoDB. It allows:

- 🔔 **Reminders** with date & time support  
- 🧠 **Token/Wallet monitoring** (alerts on deploys, similar names, market cap milestones)
- 📡 **Crypto alerts** directly to Telegram — group or private
- 🛠️ Built-in admin & permission control
- 📀 Uses MongoDB for persistent storage

---

## 🚀 Features

### ⏰ Reminder System
Set reminders for future events, and the bot will notify you right on time.

Commands:
```
/remind title=<title> date=<DD.MM> time=<HH:MM>
/showreminders
/deletereminder <id>
/deleteallreminders
```

Example:
```
/remind title=ETH unlock date=15.05 time=12:00
```

---

### 🧩 Crypto Watch & Alerts

Track wallets or tokens:

- Alert when a **tracked wallet** deploys a new token
- Alert when a new token has a **similar name/symbol**
- Alert when a **token crosses a market cap** threshold

Commands:
```
/watch wallet <address>
/watch token <symbol> <contract> <minMcap> [chain]
/watch list

/unwatch wallet <address>
/unwatch token <contract>
/unwatch all

```


Examples:
```
/watch wallet 0xabc...
/watch token PEPE 0x123... 500000 ETH
```
/watch wallet 0xabc123...
/watch token PEPE 0x123456... 500000 ETH
/unwatch wallet 0xabc123...
/unwatch all

/timezones america
/timezones utc
/timezones
---

## 🔧 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env` file

```env
BOT_TOKEN=your_bot_token
DOMAIN=https://yourdomain.com
PORT=443
NODE_ENV=production
```

### 3. Configure MongoDB in `config.json`

```json
{
  "mongodb": {
    "user": "yourUser",
    "password": "yourPassword",
    "host": "127.0.0.1",
    "port": 27017,
    "database": "reminderDB"
  }
}
```

---

## ▶️ Running the Bot

### 🔁 Development (Polling)
```bash
node index.js
```

### 🟢 Production (Webhook + PM2)
```bash
pm2 start ecosystem.config.js
```

---

## 📦 File Structure

```
/commands        → Telegram command handlers
/services        → Background jobs and alert watchers
/features        → Internal shared logic
/models          → Mongoose schemas
/utils           → Token checker utilities
index.js         → Bot entry point
.env             → Bot token and config
config.json      → MongoDB config
```

---

## 📣 Telegram Behavior

✅ Works in **private chat** or **any group**  
🔒 Only users with permissions (or admins) can delete reminders  
💬 All alerts and reminders are sent to the relevant chat

---

## 💡 Ideas to Extend

- Telegram inline keyboard UX  
- Alerts on liquidity pool changes  
- Token blacklist alerts  
- Scheduler dashboard  
- NFT contract tracking  
- Price notifications

---

## 🛠️ Powered by
- Telegraf.js
- MongoDB + Mongoose
- Moment-Timezone
- Axios

---

## 👨‍💻 Built with love by [You]
