const mongoose = require('mongoose');
const config = require('../config.json');
const { Telegraf } = require('telegraf');
const axios = require('axios');
const WebSocket = require('ws');

const BscContract = require('../models/BscContract');
const EthContract = require('../models/EthContract');
const BaseContract = require('../models/BaseContract');
const AvaxContract = require('../models/AvaxContract');

const chainContractModel = {
  1: BscContract,
  2: EthContract,
  3: BaseContract,
  4: AvaxContract
};
// Create a WebSocket client
const ws = new WebSocket('ws://127.0.0.1:6161');

// Import your FreshWallets model
const FreshWallets = require('../models/FreshWallets');

// Connect to MongoDB
const mongoUri = `mongodb://${config.mongodb.user}:${encodeURIComponent(config.mongodb.password)}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}?authSource=multiChainApi`;
mongoose.connect(mongoUri)
  .then(() => {
    // MongoDB connected
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

//
// Global statistics tracker for messages sent per minute for each chain
//
let messageStats = {
  bsc: 0,
  ethereum: 0,
  base: 0,
  avax: 0
};

// Reset and log stats every minute.
setInterval(() => {
  console.log("Messages sent in the last minute:", messageStats);
  messageStats = { bsc: 0, ethereum: 0, base: 0, avax: 0 };
}, 60000);

//
// ----------------------------
// Telegram Queue Implementation
// ----------------------------
//
class TelegramQueue {
  /**
   * @param {Telegraf} bot - The Telegraf bot instance.
   * @param {number} interval - Delay between messages in ms (default 10ms).
   */
  constructor(bot, interval = 10) {
    this.bot = bot;
    this.interval = interval;
    this.queue = [];
    this.processing = false;
  }

  /**
   * Enqueue a message. If a message for the same token (contractKey) already exists,
   * update it with the new content and update its timestamp.
   * The timestamp indicates when the message was last updated.
   * @param {Object} message - { contractKey, chatId, text, options, network }
   */
  enqueue(message) {
    if (message.contractKey) {
      let found = false;
      for (let i = 0; i < this.queue.length; i++) {
        if (this.queue[i].contractKey === message.contractKey) {
          // Update existing message with new data and current timestamp.
          this.queue[i] = { ...message, timestamp: Date.now() };
          found = true;
          break;
        }
      }
      if (!found) {
        this.queue.push({ ...message, timestamp: Date.now() });
      }
    } else {
      this.queue.push({ ...message, timestamp: Date.now() });
    }
    if (!this.processing) {
      this.processNextMessage();
    }
  }

  /**
   * Process the next message in the queue.
   * Check if the message has been stable (not updated) for at least 1 second.
   * If not, reinsert it and delay sending.
   */
  async processNextMessage() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    this.processing = true;
    const message = this.queue.shift();
    const age = Date.now() - message.timestamp;
    if (age < 1000) {
      // Message was updated recently; reinsert at the front and delay until it is older than 1 second.
      this.queue.unshift(message);
      setTimeout(() => this.processNextMessage(), (1000 - age) + this.interval);
      return;
    }
    try {
      await this.bot.telegram.sendMessage(message.chatId, message.text, message.options);
      if (message.network && messageStats.hasOwnProperty(message.network)) {
        messageStats[message.network]++;
      }
      setTimeout(() => this.processNextMessage(), this.interval);
    } catch (err) {
      // If the error is a 429 (Too Many Requests), use the retry_after value.
      if (err.response && err.response.status === 429) {
        const retryAfter = err.response.headers && err.response.headers['retry-after']
          ? parseInt(err.response.headers['retry-after'], 10)
          : 1;
        this.queue.unshift(message);
        setTimeout(() => this.processNextMessage(), retryAfter * 1000);
      } else {
        setTimeout(() => this.processNextMessage(), this.interval);
      }
    }
  }
}

//
// ----------------------------
// Instantiate Telegram Bot and Queue
// ----------------------------
const grupDev = "YOUR TG GROUP OR CHANNEL ID TO SEND MESSAGES";
const botMain = new Telegraf("YOUR TELEGRAM BOT TOKEN");
const telegramQueue = new TelegramQueue(botMain, 10); // 10ms delay between messages

//
// ----------------------------
// Exclusion list & Chain Configs
// ----------------------------
const excluded = new Set(["BNB", "WBNB", "ETH", "WETH", "USDC", "USDT", "USDe", "cWETH"]);

const chainConfigs = {
  bsc: {
    chain: 1,
    chainScanner: "bscscan.com",
    currency: "BNB",
    url: "https://dexscreener.com/bsc/",
    cielo: "https://app.bubblemaps.io/bsc/token/",
    topicId: 195395,
    chatIdSecond: -1002511257639,
    topicSecond: 1037085
  },
  ethereum: {
    chain: 2,
    chainScanner: "etherescan.io",
    currency: "ETH",
    url: "https://dexscreener.com/ethereum/",
    cielo: "https://app.bubblemaps.io/eth/token/",
    topicId: 195400,
    chatIdSecond: -1002511257639,
    topicSecond: 1037050
  },
  base: {
    chain: 3,
    chainScanner: "basescan.org",
    currency: "ETH",
    url: "https://dexscreener.com/base/",
    cielo: "https://app.bubblemaps.io/base/token/",
    topicId: 195407,
    chatIdSecond: -1002511257639,
    topicSecond: 1037036
  },
  avax: {
    chain: 4,
    chainScanner: "snowscan.xyz",
    currency: "AVAX",
    url: "https://dexscreener.com/avalanche/",
    cielo: "https://app.bubblemaps.io/avax/token/",
    topicId: 195413,
    chatIdSecond: -1002511257639,
    topicSecond: 1037073
  },
  sonic: {
    chain: 5,
    chainScanner: "146.routescan.io",
    currency: "SONIC",
    url: "https://dexscreener.com/sonic/",
    cielo: "https://app.bubblemaps.io/sonic/token/",
    topicId: undefined,
    chatIdSecond: -1002511257639,
    topicSecond: 12187
  }
};

//
// Debounce storage to avoid rapid messages for the same token.
//
const debounceTimers = new Map();
const pendingMessages = new Map();

//
// ----------------------------
// WebSocket Event Handlers
// ----------------------------
ws.on('open', () => {});
ws.on('message', async (data) => {
  try {
    const jsonString = data.toString();
    let message;
    try {
      message = JSON.parse(jsonString);
    } catch (e) {
      return;
    }
    if (message.message && message.message.type === 'blockDataTrades') {
      const trades = message.message.data;
      const chain = message.message.chain;
      let tradesOfCall = {};
      for (const wallet in trades) {
        const trade = trades[wallet];
        if (trade.type === 'Swap') {
          const { in: inToken } = trade;
          const tokenData = Object.values(inToken)[0];
          const inAddresses = Object.keys(inToken);
          if (!excluded.has(tokenData.token) && tokenData.nounce < 100 && parseInt(tokenData.usdValue) > 5 && parseInt(tokenData.mcap) < 101000) {
            if (!tradesOfCall[inAddresses[0]]) {
              tradesOfCall[inAddresses[0]] = {
                name: tokenData.token,
                symbol: tokenData.token,
                contractAddress: inAddresses[0],
                usdValue: parseInt(tokenData.usdValue),
                mcap: tokenData.mcap,
                count: 1
              };
            } else {
              tradesOfCall[inAddresses[0]].count++;
              tradesOfCall[inAddresses[0]].usdValue += parseInt(tokenData.usdValue);
              if (tradesOfCall[inAddresses[0]].mcap < tokenData.mcap) {
                tradesOfCall[inAddresses[0]].mcap = tokenData.mcap;
              }
            }
          }
        }
      }
      if (Object.keys(tradesOfCall).length > 0) {
        for (const token in tradesOfCall) {
          await postToTg(chain, tradesOfCall[token]);
        }
      }
    }
  } catch (e) {}
});
ws.on('error', (error) => {});
ws.on('close', () => {});

//
// ----------------------------
// Function: Post to Telegram
// ----------------------------
async function postToTg(inChain, data) {
  try {
    const configChain = chainConfigs[inChain] || chainConfigs["bsc"];
    const chain = configChain.chain;
    const insertData = await insertOrUpdate(data.contractAddress, chain, data.usdValue, data.mcap);
    if (insertData === false) return;
    if (insertData.count > 4) return;
    let is4Meme = false;

    if (chain === 1 && data.contractAddress.slice(-4) === "4444") {
      is4Meme = true;
    }
    let isZora = false;
    if (chain === 3 && data.isPlatform == "zora") {
      isZora = true;
    }
    let isIndB = 0
    let db = await getNewContracts(chain, data.contractAddress)
    let initialMc = 0
    let ath = 0
    if(db != false){
       
        if(db[0]?.launched?.timestamp > 0){
            isIndB = db[0]?.launched?.timestamp
        }
        if(db[0]?.statistics?.marketcap > 0){
            initialMc = db[0]?.statistics?.initialMc
        }

        if(db[0]?.statistics?.ath > 0){
            ath = db[0]?.statistics?.ath
        }
    }

    let newMessage = `💰New Fresh Wallet Buy for ${data.name} (${data.symbol})\n└Ca: <code>${data.contractAddress}</code>`;
    if (is4Meme) {
      newMessage = `🌟New Fresh Wallet Buy for ${data.name} (${data.symbol})\n└Is four.meme!\n└Ca: <code>${data.contractAddress}</code>`;
    }

    if (isZora) {
      newMessage = `🤖New Fresh Wallet Buy for ${data.name} (${data.symbol})\n└Is zora.co!\n└Ca: <code>${data.contractAddress}</code>`;
    }

    if(isIndB > 0){
        newMessage += `\n\n${formatTimeSince(isIndB)}`; 
    }
    newMessage += `\n\n💫Fresh Wallets Buys: <code>${insertData.count}</code>\n└Total Amount: <code>$${parseFloat(insertData.value).toLocaleString()}</code>\n└Average per Buy: <code>$${parseFloat((insertData.value / insertData.count).toFixed(0)).toLocaleString()}</code>`;
    newMessage += `\n\n📝Statistics:\n└Mcap: <code>$${parseFloat(data.mcap).toLocaleString()}</code> `;
    if(initialMc > 0){
        newMessage += `(Initial: <code>$${parseFloat(initialMc).toLocaleString()}</code>)`
    }
    if(ath > 0){
        newMessage += `\n└Ath: <code>$${parseFloat(ath).toLocaleString()}</code>`
    }
    newMessage += `\n\n<a href="${configChain.url + data.contractAddress}">DexScreener</a> | <a href ='https://x.com/search?q=($${data.symbol} OR ${data.contractAddress})&src=typed_query'>Search X.com</a> | <a href ='https://app.cielo.finance/profile/${data.contractAddress}/pnl/tokens'>Cielo</a> | <a href ='${configChain.cielo + data.contractAddress}'>BubleMaps</a>\n`;
    const contractKey = data.contractAddress;
    try{
      let alertIcon = "💰"
  
      let iconSet = {
        1:"1️⃣",
        2:"2️⃣",
        3:"3️⃣",
        4:"4️⃣",
        5:"5️⃣",
        6:"6️⃣",
        7:"7️⃣",
        8:"8️⃣",
        9:"9️⃣",
        10:"🔟",
        11:"✳️"
      }
      if(insertData.count < 11){
        alertIcon = iconSet[insertData.count]
      }else{
        alertIcon = iconSet[11]
      }
      if (isZora) {
        newMessage = alertIcon + newMessage.split("🤖")[1]
      }else{
        newMessage = alertIcon + newMessage.split("💰")[1]
      }

      let chatIdRotator = configChain.chatIdSecond
      let topicIdRotator = configChain.topicSecond
      if (isZora){
        topicIdRotator = 12421
      }
      if (!is4Meme && insertData.count < 21) {
        let rotator = {
          chatId: chatIdRotator,
          topicId: topicIdRotator,
          text: newMessage     
        }
    
        sendNotification(rotator)
      }
    
    }catch(e){
      console.log(e)
    }
    if (insertData.log === false) return;
    if (debounceTimers.has(contractKey)) {
      clearTimeout(debounceTimers.get(contractKey));
    }
    pendingMessages.set(contractKey, {
      contractKey: contractKey,
      chatId: grupDev,
      text: newMessage,
      options: {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        message_thread_id: configChain.topicSecond
      },
      network: inChain
    });
    const timeout = setTimeout(() => {
      const msg = pendingMessages.get(contractKey);
      if (msg) {
        telegramQueue.enqueue(msg);
      }
      debounceTimers.delete(contractKey);
      pendingMessages.delete(contractKey);
    }, 3000);
    debounceTimers.set(contractKey, timeout);
  } catch (e) {}
}

//
// ----------------------------
// Function: Insert or Update Wallet Record
// ----------------------------
async function insertOrUpdate(contract, chain, amount, mcap) {
  try {
    const id = `${contract}_${chain}`;
    const existing = await FreshWallets.findOne({ _id: id });
    let updatedRecord;
    let shouldLog = false
    if (!existing) {
      updatedRecord = await FreshWallets.create({
        _id: id,
        contractAddress: contract,
        chain: chain,
        initialMc: mcap,
        ath: mcap,
        count: 1,
        value: amount
      });
      shouldLog = true
    } else {
      if (existing.count >= 15) {
        return false;
      }
      const newCount = existing.count + 1;
      const updateData = {
        $inc: { count: 1, value: amount }
      };
      let setData = {};
      if (existing.initialMc === 0) {
        setData.initialMc = mcap;
      }
      if (existing.ath < mcap) {
        setData.ath = mcap;
      }
      if (Object.keys(setData).length > 0) {
        updateData.$set = setData;
      }
      updatedRecord = await FreshWallets.findOneAndUpdate({ _id: id }, updateData, { new: true });
      if (newCount % 5 === 0) {
        shouldLog = true
      }else{
        shouldLog = false
      }
    }   
    const result = updatedRecord.toObject();
    result.log = shouldLog;
    return result;
  } catch (e) {
    return false;
  }
}


async function getNewContracts(chain, contract) {
    try {
      // Use a case-insensitive regular expression to search the contractAddress field.
      const db = await chainContractModel[chain].find({ 
        contractAddress: { $regex: `^${contract}$`, $options: 'i' } 
      });
      if (!db || db.length === 0) {
        return false;
      } else {
        return db;
      }
    } catch (err) {
      console.error('Error fetching new contracts:', err);
      return false;
    }
  }
  
  function formatTimeSince(timestamp) {
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    const diff = Math.abs(now - timestamp);      // absolute difference in seconds
  
    const days = Math.floor(diff / (3600 * 24));
    const hours = Math.floor((diff % (3600 * 24)) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
  
    // If the current time is greater than the timestamp, it was launched ago;
    // otherwise, it's in the future.
    const suffix = now >= timestamp ? 'ago' : 'in';
  
    return `🕚 Launched ${suffix}: ${days.toLocaleString()} days, ${hours.toLocaleString()} hours, ${minutes.toLocaleString()} minutes, ${seconds.toLocaleString()} seconds.`;
  }

  async function sendNotification(data) {
    try {
      const resp = await axios.post('http://127.0.0.1:7777/send', {
        chatId: data.chatId,  
        topicId: data.topicId,
        text: data.text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
  
      //console.log('Telegram API result:', resp.data);
    } catch (err) {
      console.error('Error sending test message:', err.response?.data || err.message);
      console.log(data.text)
    }
  }


  