const mongoose = require('mongoose');
const config = require('../config.json');
const axios = require('axios');
const { ethers, providers, Contract } = require('ethers');
const { Telegraf, Markup } = require('telegraf');
 const botMain = new Telegraf("YOUR TELEGRAM BOT TOKEN");
// Import all contract models statically
const BscContract = require('../models/BscContract');
const EthContract = require('../models/EthContract');
const BaseContract = require('../models/BaseContract');
const AvaxContract = require('../models/AvaxContract');
const SonicContract = require('../models/SonicContract');
const Recurence = require('../models/Recurence');
const { checkToken } = require('./tokenInfo');
// Connect to MongoDB
const mongoUri = `mongodb://${config.mongodb.user}:${encodeURIComponent(config.mongodb.password)}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}?authSource=multiChainApi`;
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));




  const providerRpc = {
      1: config.bsc.wsUrl,
      2: config.ethereum.wsUrl,
      3: config.base.wsUrl,
      4: config.avax.wsUrl,
  };


// --------------------
// Get trending data locally using aggregation across chains
async function getTrendingFromLocal() {
  try {
    // Use a 600-second (10-minute) window
    const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600;
    
    const trending = await AvaxContract.aggregate([
      { $match: { timestamp: { $gte: tenMinutesAgo } } },
      { 
        $unionWith: {
          coll: "bsccontracts",
          pipeline: [
            { $match: { timestamp: { $gte: tenMinutesAgo } } },
            { $addFields: { chain: "bsc" } }
          ]
        }
      },
      { 
        $unionWith: {
          coll: "ethcontracts",
          pipeline: [
            { $match: { timestamp: { $gte: tenMinutesAgo } } },
            { $addFields: { chain: "eth" } }
          ]
        }
      },
      { 
        $unionWith: {
          coll: "basecontracts",
          pipeline: [
            { $match: { timestamp: { $gte: tenMinutesAgo } } },
            { $addFields: { chain: "base" } }
          ]
        }
      },
      { 
        $unionWith: {
          coll: "soniccontracts",
          pipeline: [
            { $match: { timestamp: { $gte: tenMinutesAgo } } },
            { $addFields: { chain: "sonic" } }
          ]
        }
      },
      // For documents coming from AvaxContract, add chain info if needed:
      { $addFields: {
          chain: { $ifNull: ["$chain", "avax"] }
      }},
      // Normalize the "name" field (lowercase and trimmed)
      { $addFields: {
          normalizedName: { $toLower: { $trim: { input: "$name" } } }
      }},
      { $group: {
          _id: "$normalizedName",
          count: { $sum: 1 },
          contracts: { $push: { 
              address: "$contractAddress", 
              chain: "$chain", 
              name: "$name",
              symbol: "$symbol"
            } 
          }
      }},
      // Only include groups with 2 or more documents
      { $match: { count: { $gte: 2 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Map the array into an object keyed by the normalized name
    const localTrending = {};
    trending.forEach(trend => {
      localTrending[trend._id] = { count: trend.count, contracts: trend.contracts };
    });   
   
    return localTrending;
  } catch (err) {
    console.error("Error during getTrendingFromLocal:", err);
    return {};
  }
}

// --------------------
// Get trending data from your external API
async function getTrendingFromRemote() {
  try {
    const url = "http://127.0.0.1:3535/api?module=trend&apikey=G9DQYZ6BPSUMMW6BEBI21A3NZMCWX9TDZM";
    const response = await axios.get(url);
    if (response.status === 200 && response.data && response.data.success === true) {
      const remoteData = response.data.data;
      for (const key in remoteData) {
        if (typeof remoteData[key] === "object" && remoteData[key].count !== undefined) {
          // Convert each remote contract object to a standardized object:
          remoteData[key].contracts = remoteData[key].contracts.map(contract => ({
            address: contract.address.toLowerCase(),
            chain: contract.chain ? contract.chain.toLowerCase() : "bsc",
            name: contract.name,
            symbol: contract.symbol
          }));
        }
      }
      return remoteData;
    }
    return {};
  } catch (err) {
    console.error("Error fetching trending from remote API:", err);
    return {};
  }
}

// --------------------
// Combine both sources and return the combined trending data as an array
async function combineTrendingData() {
  const localTrending = await getTrendingFromLocal();
  const remoteTrending = await getTrendingFromRemote();
  
  const combined = {};
  
  // Add local trending data
  for (const key in localTrending) {
    combined[key] = {
      count: localTrending[key].count,
      contracts: localTrending[key].contracts  
    };
  }
  
  // Merge remote trending data
  for (const key in remoteTrending) {
    let remoteCount, remoteContracts;
    if (typeof remoteTrending[key] === "object" && remoteTrending[key].count !== undefined) {
      remoteCount = remoteTrending[key].count;
      remoteContracts = remoteTrending[key].contracts;
    } else {
      remoteCount = remoteTrending[key];
      remoteContracts = [];
    }
    
    if (combined[key] !== undefined) {
      combined[key].count += remoteCount;
      
      // Use a map keyed by "address|chain" to merge contract details including name and symbol
      const contractMap = new Map();
      // Add local contracts
      combined[key].contracts.forEach(doc => {
        const keyID = doc.address.toLowerCase() + "|" + (doc.chain ? doc.chain.toLowerCase() : "bsc");
        contractMap.set(keyID, {
          address: doc.address.toLowerCase(),
          chain: doc.chain ? doc.chain.toLowerCase() : "bsc",
          name: doc.name || key, // fallback to trend name if not provided
          symbol: doc.symbol || ""
        });
      });
      // Add remote contracts (or update if already exists)
      remoteContracts.forEach(contract => {
        const keyID = contract.address.toLowerCase() + "|" + (contract.chain ? contract.chain.toLowerCase() : "bsc");
        if (!contractMap.has(keyID)) {
          contractMap.set(keyID, {
            address: contract.address.toLowerCase(),
            chain: contract.chain ? contract.chain.toLowerCase() : "bsc",
            name: contract.name || key,
            symbol: contract.symbol || ""
          });
        }
      });
      combined[key].contracts = Array.from(contractMap.values());
    } else {
      combined[key] = {
        count: remoteCount,
        contracts: remoteContracts.map(contract => ({
          address: contract.address.toLowerCase(),
          chain: contract.chain ? contract.chain.toLowerCase() : "bsc",
          name: contract.name,
          symbol: contract.symbol
        }))
      };
    }
  }
  
  const combinedArray = Object.keys(combined).map(name => ({
    name,
    count: combined[name].count,
    contractAddresses: combined[name].contracts // array of objects { address, chain, name, symbol }
  }));
  
  return combinedArray;
}

// --------------------
// Update or create trending records in MongoDB
async function updateTrendingRecords(combinedTrending) {
    const now = Math.floor(Date.now() / 1000);
    
    for (const trend of combinedTrending) {
      if (trend.count >= 5) {
        // Retrieve an existing record (using trend.name as _id)
        let existingRecord = await Recurence.findById(trend.name);
        
        // If a record exists and is older than 1 hour, delete it and treat as new.
        if (existingRecord && (now - existingRecord.timestamp > 3600)) {
          await Recurence.findByIdAndDelete(trend.name);
          console.log(`Deleted old record for "${trend.name}" (older than 1 hour)`);
          existingRecord = null;
        }
        
        // Prepare the new contracts array with name and symbol preserved
        const newContracts = trend.contractAddresses.map(item => ({
          address: item.address.toLowerCase(),
          chain: item.chain.toLowerCase(),
          name: item.name,
          symbol: item.symbol
        }));
        
        let updatedRecord;
        if (!existingRecord) {
          // Create a new record: use unique contracts count based on newContracts
          const newRecord = {
            _id: trend.name,
            name: trend.name,
            count: newContracts.length, // count equals number of unique new contracts
            contracts: newContracts,
            timestamp: now
          };
          updatedRecord = await Recurence.findByIdAndUpdate(trend.name, newRecord, { upsert: true, new: true });
          console.log(`Created new trending record for "${trend.name}" with count ${newRecord.count}`);
        } else {
          // Merge with an existing recent record: merge contracts uniquely
          const contractMap = new Map();
          // Add existing contracts to the map
          existingRecord.contracts.forEach(c => {
            const keyID = c.address.toLowerCase() + "|" + c.chain.toLowerCase();
            contractMap.set(keyID, {
              address: c.address.toLowerCase(),
              chain: c.chain.toLowerCase(),
              name: c.name,
              symbol: c.symbol
            });
          });
          // Add new contracts (duplicates will be overwritten)
          newContracts.forEach(c => {
            const keyID = c.address.toLowerCase() + "|" + c.chain.toLowerCase();
            contractMap.set(keyID, c);
          });
          const mergedContracts = Array.from(contractMap.values());
          // Updated count is the number of unique contracts
          const updatedCount = mergedContracts.length;
          
          updatedRecord = await Recurence.findByIdAndUpdate(trend.name, {
            count: updatedCount,
            contracts: mergedContracts,
            timestamp: now
          }, { new: true });
          
          // Log alert thresholds: using the unique contract count
          const previousCount = existingRecord.count;
          for (let threshold = 5; threshold <= 50; threshold += 5) {
            if (previousCount < threshold && updatedCount >= threshold) {
              console.log(`ALERT: Trend "${trend.name}" crossed threshold ${threshold}. New count: ${updatedCount}`);
              break;
            }
          }
          console.log(`Updated trending record for "${trend.name}" with new count ${updatedCount}`);
        }
        
        // Retrieve the full current record from MongoDB (including old data)
        const currentTrend = await Recurence.findById(trend.name);
        // Call alertTrend to log the full details for this trend
        alertTrend(currentTrend);
      }
    }
    
    // Optionally return all records if needed
    const allRecords = await Recurence.find({});
    return allRecords;
  }
  
// --------------------
// Main function: combine trending data and update trending records in MongoDB
async function processTrendingData() {
  try {
    const combinedTrending = await combineTrendingData();
    await updateTrendingRecords(combinedTrending);
  } catch (err) {
    console.error("Error processing trending data:", err);
  }
}

async function alertTrend(trendRecord) {
    try{

        // Helper function to add a delay
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
        // Compute dominating chain from all contracts
        let chainFrequency = {};
        for (const contract of trendRecord.contracts) {
        // Convert to lowercase for consistency
        const chainLower = contract.chain.toLowerCase();
        chainFrequency[chainLower] = (chainFrequency[chainLower] || 0) + 1;
        }
        let dominatingChain = "bsc";
        let maxChainCount = 0;
        for (const chain in chainFrequency) {
        if (chainFrequency[chain] > maxChainCount) {
            maxChainCount = chainFrequency[chain];
            dominatingChain = chain;
        }
        }
    
        // Compute dominating symbol from all contracts
        let symbolFrequency = {};
        for (const contract of trendRecord.contracts) {
        const symbol = contract.symbol ? contract.symbol.toLowerCase() : "";
        symbolFrequency[symbol] = (symbolFrequency[symbol] || 0) + 1;
        }
        let dominatingSymbol = null;
        let maxSymbolCount = 0;
        for (const symbol in symbolFrequency) {
        if (symbolFrequency[symbol] > maxSymbolCount) {
            maxSymbolCount = symbolFrequency[symbol];
            dominatingSymbol = symbol;
        }
        }
        if(trendRecord.name.toLowerCase().includes("claim rewards on ethblaze.org") || trendRecord.name.toLowerCase().includes("ethblaze.org")){
            return
        }
        
        let trend = {
        name: trendRecord.name,
        dominatingSymbol: dominatingSymbol, // Updated with computed dominating symbol
        totalCount: trendRecord.count,
        dominatingChain: dominatingChain, // Updated with computed dominating chain
        topMc: [],
        messageId: trendRecord.messageId,
        trendId: trendRecord._id
        };
    
        let tokensMc = {};
    
        // Limit the checkToken calls to max 100 contracts to reduce processing time
        const contractsToCheck = trendRecord.contracts.slice(0, 100);
    
        for (const contract of contractsToCheck) {
        // Map chain to a numeric index for providerRpc lookup
        let chainIndex = 1;
        let chainScanner = "https://bscscan.com/token/"
        let url = "https://dexscreener.com/bsc/"
        if (contract.chain === "eth") {
            chainIndex = 2;
            chainScanner = "https://etherescan.io/token/"
            url = "https://dexscreener.com/ethereum/"
        } else if (contract.chain === "base") {
            chainIndex = 3;
            chainScanner = "https://basescan.org/token/"
            url = "https://dexscreener.com/base/"
        } else if (contract.chain === "avax") {
            chainIndex = 4;
            chainScanner = "https://snowscan.xyz/token/"
            url = "https://dexscreener.com/avalanche/"
        } else if (contract.chain === "sonic") {
            chainIndex = 5;
            chainScanner = "https://146.routescan.io/token/"
            url = "https://dexscreener.com/sonic/"
        }

        // Add a small delay (10 ms) before calling checkToken
        await delay(10);
        const provider = new ethers.providers.WebSocketProvider(providerRpc[chainIndex]);
        const liveInfo = await checkToken(contract.address, chainIndex, provider);
        if (liveInfo && liveInfo !== false) {
            if (liveInfo.listed === true && liveInfo?.info?.mcap > 50000) {
            // Store unique contract info in tokensMc
            if (!tokensMc[contract.address]) {
                tokensMc[contract.address] = {
                contract: contract.address,
                name: liveInfo.name,
                symbol: liveInfo.symbol,
                mcap: liveInfo?.info?.mcap || 0,
                caLink: chainScanner+contract.address,
                dexScreener: url+contract.address
                };
            }
            }
        }
        }
    
        if (Object.keys(tokensMc).length > 0) {
        // Sort tokens by mcap descending and take the top 3
        let topTokens = Object.values(tokensMc)
            .sort((a, b) => b.mcap - a.mcap)
            .slice(0, 3);
        trend.topMc = topTokens;
        }
        let newMessage = "🔇New Trend Detected! \n└Dominating Name: <code>"+trend.name+"</code>\n└Dominating Symbol: <code>"+trend.dominatingSymbol+"</code>\n└Dominating Chain: <code>"+trend.dominatingChain+"</code>\n└Total Deploys: <code>"+trend.totalCount+"</code>"
        if (Object.keys(trend.topMc).length > 0) {
            newMessage += "\n└Top 3 by Mcap:\n"
            for (const [key] of Object.entries(trend.topMc)) {
                newMessage += "<a href = '"+trend.topMc[key].caLink+"'>" +trend.topMc[key].contract.slice(0, 4) +"..."+ trend.topMc[key].contract.slice(-4)+ "</a> (Mcap: $<a href = '"+trend.topMc[key].dexScreener+"'>" +parseFloat(trend.topMc[key].mcap).toLocaleString()+ "</a>)\n"
            }
        }
        newMessage += "\n\n<a href ='https://x.com/search?q=($"+trend.name+" OR "+trend.dominatingSymbol+")&src=typed_query'>Search X.com</a>"
        //console.log("Final Trend Info:", JSON.stringify(trend, null, 2));
        postToTg(newMessage,trend.messageId,trend.trendId)
        
    }catch(e){
        console.log(e)
    }
  }  


async function postToTg(newMessage,messageId,trendId){
            try{
                const grupDev = "YOUR TG GROUP OR CHANNEL ID TO SEND MESSAGES";
                const topicId = 147307
                if(messageId > 0){ 
                    botMain.telegram.editMessageText(
                        grupDev,
                        messageId, 
                        null, 
                        newMessage,
                        { parse_mode: 'HTML',
                          disable_web_page_preview: true,
                          message_thread_id: topicId
                        } 
                    ).then(() => {
                        // Message edited successfully
                    }).catch((error) => {
                        // Handle edit error if needed
                    });
                } else {
                    botMain.telegram.sendMessage(grupDev, newMessage, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        message_thread_id: topicId         
                    }).then((m) => {
                        updateMessageId(trendId, m);
                    }).catch((error) => {
                        // Handle send error if needed
                    });
                }
            
            } catch(e) { }
}


async function updateMessageId(docId, m) {
    try {
      await Recurence.updateOne(
        { _id: docId },
        { $set: { messageId: m.message_id } }
      );
    } catch (error) {
      console.error("Error updating document:", error);
    }
}

processTrendingData();

setInterval(() => {
    processTrendingData();
  }, 10 * 60 * 1000);



