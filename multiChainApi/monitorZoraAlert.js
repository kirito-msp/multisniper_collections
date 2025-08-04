// --- WebSocket Trade Listener & Mongo/Telegram Updater ---

const WebSocket = require('ws');
const { ethers } = require("ethers");
const { Telegraf } = require('telegraf');
require("dotenv").config();
const mongoose = require('mongoose');
const config = require('./config.json');
const botMain = new Telegraf(process.env.BOT_TOKEN);
const BaseContract = require('./models/BaseContract');
// Connect to MongoDB
const mongoUri = `mongodb://${config.mongodb.user}:${encodeURIComponent(config.mongodb.password)}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}?authSource=multiChainApi`;
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Create a WebSocket client to receive trade data
const ws = new WebSocket('ws://127.0.0.1:6161');

ws.on('open', () => {
  console.log('Connected to WebSocket server');
});

ws.on('message', async (data) => {
    try {
      const { message } = JSON.parse(data.toString());
      if (message?.type !== 'blockDataTrades' || message.chain !== 'base') return;
  
      const trades = message.data;
      const contracts = {};
  
      for (const wallet in trades) {
        const trade = trades[wallet];
        if (trade.type !== 'Swap') continue;
      
        const inTokenAddrs  = Object.keys(trade.in);
        const outTokenAddrs = Object.keys(trade.out);
  
        // Combine both lists (you can filter here if you still want the '4444' rule)
        const addressesToCheck = [...inTokenAddrs, ...outTokenAddrs];
  
        // Bulk‐fetch all matching contracts in one go:
        const foundContracts = await BaseContract
          .find({
            contractAddress: { $in: addressesToCheck },
            isPlatform: 'zora'
          })
          .collation({ locale: 'en', strength: 2 })
          .exec();
  
        // Now update each found contract
        for (const contract of foundContracts) {
          const addr = contract.contractAddress.toLowerCase();
  
          // determine if this address was incoming or outgoing
          const isIn  = inTokenAddrs .some(a => a.toLowerCase() === addr);
          const isOut = outTokenAddrs.some(a => a.toLowerCase() === addr);
  
          // pick the right mcap
          let mcapValue;
          if (isIn)  mcapValue = trade.in [contract.contractAddress].mcap;
          if (isOut) mcapValue = trade.out[contract.contractAddress].mcap;
          if (!mcapValue) continue;  // safety
  
          // update stats
          const mcapNum = parseFloat(mcapValue);
          contract.statistics.marketcap = mcapNum;
          // bump ATH if needed
          if (parseFloat(contract.statistics.ath) < mcapNum) {
            contract.statistics.ath = Math.floor(mcapNum).toString();
            contracts[contract.contractAddress] = contract;
          }         
        }
      }
  
 
      if (Object.keys(contracts).length > 0) {
      //  console.log(contracts);
        updateMcap(contracts)
      }  
      // …then do whatever you do with `contracts` (save them, alert, etc.)
  
    } catch (error) {
      console.error('Error processing message:', error.message);
    }
  });
  

ws.on('error', (error) => {
  console.error('WebSocket error:', error.message);
});

ws.on('close', () => {
  console.log('WebSocket connection closed');
});

// --- Common Utility Functions ---

// Delay helper (ms)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Count similar social links in MongoDB (for building alerts)
async function getCountSocials(website, twitter, telegram) {
  const result = { website: 0, twitter: 0, telegram: 0 };
  try {
    if (website && website.toLowerCase() !== "none") {
      result.website = await contractModel.countDocuments({
        "socials.web": { $regex: `^${website}$`, $options: "i" }
      });
    }
    if (twitter && twitter.toLowerCase() !== "none") {
      result.twitter = await contractModel.countDocuments({
        "socials.twitter": { $regex: `^${twitter}$`, $options: "i" }
      });
    }
    if (telegram && telegram.toLowerCase() !== "none") {
      result.telegram = await contractModel.countDocuments({
        "socials.telegram": { $regex: `^${telegram}$`, $options: "i" }
      });
    }
  } catch (err) {
    console.error("Error in getCountSocials:", err);
  }
  return result;
}

// --- Database Update and Alert Functions ---

// This function checks the new market cap from WebSocket data for each contract
// It updates the MongoDB entry if the contract exists and if the new mcap is
// higher than 250,000 and more than twice the stored mcap, then sends a Telegram alert.
async function updateMcap(contracts) {
    if (Object.keys(contracts).length === 0) return;
    
    for (const contractAddr in contracts) {
      try {
        const record = await BaseContract.findOne({
          contractAddress: { $regex: `^${contractAddr}$`, $options: 'i' }
        });
        if (!record) continue;
        
        const storedMcap = parseFloat(record.statistics.marketcap) || 0;
        const newMcap = parseFloat(contracts[contractAddr].statistics.marketcap || 0);  
        // Calculate the condition
        const condition = newMcap > 39999 && (storedMcap * 2 < newMcap);
        console.log(contractAddr, storedMcap , newMcap, condition)
        if (condition) {
            console.log(
                `${condition} (storedMcap: ${storedMcap.toLocaleString()} > 30,000, newMcap: ${newMcap.toLocaleString()})`
              );
          // Update MongoDB record with new market cap
          await BaseContract.updateOne(
            { _id: record._id },
            { $set: { 'statistics.marketcap': newMcap } }
          );
          
          // Construct a minimal tokenInfo object for sending the alert
          const tokenInfo = {
            listed: true,
            info: { mcap: newMcap },
            dexName: 'UniSwapV3',  // Indicates that the update came from WS trade data
            token: record.contractAddress
          };
          
          await sendAlertToTg(record, tokenInfo);
        }

      } catch (err) {
        console.error(`Error updating mcap for contract ${contractAddr}:`, err.message);
      }
    }
  }
  

// --- Telegram Alert Functions ---

// Unified function to send Telegram messages with built-in retry logic for rate limits
async function sendTgMessage(text, options) {
  try {
    return await botMain.telegram.sendMessage("YOUR TG GROUP OR CHANNEL ID TO SEND MESSAGES", text, options);
  } catch (error) {
    if (error.response && error.response.parameters && error.response.parameters.retry_after) {
      const retryAfter = error.response.parameters.retry_after;
      const delayTime = (retryAfter + 0.5) * 1000;
      console.log(`Rate limit hit on sendMessage. Waiting for ${delayTime}ms before retrying.`);
      await delay(delayTime);
      return sendTgMessage(text, options); // Retry recursively
    } else {
      console.error("Error sending Telegram message:", error);
      throw error;
    }
  }
}

// Constructs and sends an alert message to Telegram based on contract and token info
async function sendAlertToTg(record, tokenInfo) {
    console.log(record, tokenInfo)
   try {   
    const safeTokenSymbol = record.symbol.replace(/[^a-zA-Z0-9]/g, " ");
    const safeTokenName = record.name.replace(/[^a-zA-Z0-9]/g, " ");
    
    let newMessage ="🔹"
    newMessage += `${safeTokenName} (${safeTokenSymbol})\n`
    + `└Unique Hash: #${record.hashCode}\n`
    + `└Ca: <code>${record.contractAddress}</code>\n`
    + `└Supply: <code>${record?.totalSupply}</code>(<code>${record?.decimals}</code>)\n`
    + `└Dev: <code>${record.contractCreator}</code>\n`
    + `\n📝Statistics:\n`
    + `└Launched: <code>UniSwapV3</code>\n`
    + `└Mcap: <code>$${parseFloat(tokenInfo?.info?.mcap).toLocaleString()}</code>\n`
    + `\n<a href ='https://zora.co/coin/${record.contractAddress}'>Zora</a> | <a href ='https://dexscreener.com/base/${record.contractAddress}'>DexScreener</a> | <a href ='https://x.com/search?q=($${record?.symbol}+OR+${record.contractAddress})&src=typed_query'>Search X.com</a> | <a href ='https://app.cielo.finance/profile/${record.contractCreator}/pnl/tokens'>Cielo</a> | <a href ='https://app.bubblemaps.io/base/token/${record.contractAddress}'>BubbleMaps</a>\n`
    + `\n⚒️Creation time: ${await formatTime(record.timestamp)}`;
    
    // Inline keyboard with quick-buy options
    sendTgMessage(newMessage, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        message_thread_id: 143308              
      }).catch((error) => {
        console.error('Error sending reply message:', error);
      });

    console.log(`Alert sent for contract ${record.contractAddress}`);
  } catch (error) {
    console.error(`Error sending alert for contract ${record.contractAddress}:`, error.message);
  }
}

async function formatTime(timestamp) {
    try {
      const date = new Date(timestamp * 1000);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      const seconds = date.getUTCSeconds().toString().padStart(2, '0');
      const day = date.getUTCDate().toString().padStart(2, '0');
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${hours}:${minutes}:${seconds} ${day}.${month}.${year}`;
    } catch (e) {
      console.log(e);
      return '00:00:00 00.00.0000';
    }
  }