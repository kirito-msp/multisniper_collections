require('dotenv').config();           
const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const ethers = require('ethers');
const config = require('./config.json');

// ====== MODELS ======
const BscContract = require('./models/BscContract');
const EthContract = require('./models/EthContract');
const BaseContract = require('./models/BaseContract');
const AvaxContract = require('./models/AvaxContract');

const BscVolume = require('./models/BscVolume');
const EthVolume = require('./models/EthVolume');
const BaseVolume = require('./models/BaseVolume');
const AvaxVolume = require('./models/AvaxVolume');

const Recurence = require('./models/Recurence');
const FreshWallets = require('./models/FreshWallets');

const { checkToken } = require('./tokenInfo');

// ====== BOT ======
const bot = new Telegraf(process.env.BOT_TOKEN);
const CHAT_ID = process.env.CHAT_ID;

//console.log('Using CHAT_ID:', CHAT_ID);
//console.log('Mongo URI:', config.mongodb.host, config.mongodb.port, config.mongodb.database);

const mongoUri = `mongodb://${config.mongodb.user}:${encodeURIComponent(config.mongodb.password)}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}?authSource=multiChainApi`;

mongoose.connect(mongoUri).then(() => {
  console.log('MongoDB connected successfully.');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// ====== SCORING ======
function calculateMetaScore({
  contractDoc,
  volumeDoc,
  freshWalletCount,
  recurrenceDoc
}) {
  let score = 0;

  // 1) Basic presence & influencer calls
  if (contractDoc) {
    score += 1;
    if (contractDoc.influencers_calls && contractDoc.influencers_calls.length > 0) {
      score += 5 * contractDoc.influencers_calls.length;
    }

    // Market cap
    if (
        contractDoc.statistics?.initialMc &&
        volumeDoc?.liveMcap && // inject this from live check
        volumeDoc.liveMcap > contractDoc.statistics.initialMc
      ) {
        const initial = contractDoc.statistics.initialMc;
        const current = volumeDoc.liveMcap;
        const diff = current - initial;
      
        // Score growth
        score += Math.min(Math.floor(diff / 100000), 50);
      
        // Optional bonus for % growth
        const gainPct = diff / initial;
        if (gainPct >= 2) score += 5;      // 2x gain
        if (gainPct >= 5) score += 10;     // 5x gain
      }

    // Social
    const { telegram, twitter } = contractDoc.socials || {};
    if (telegram && telegram !== 'none') score += 5;
    if (twitter && twitter !== 'none') score += 5;
  }

  // 2) Volume weighting
  if (volumeDoc) {
    const totalVolume = volumeDoc.buyVol + volumeDoc.sellVol;
    score += Math.min(Math.floor(totalVolume / 1000), 30);

    if (volumeDoc.buys > volumeDoc.sells) {
      score += 5;
    }
  }

  // 3) Fresh wallets
  if (freshWalletCount && freshWalletCount > 0) {
    score += Math.min(freshWalletCount * 2, 20);
  }

  // 4) Recurrence 
  if (recurrenceDoc && recurrenceDoc.count) {
    score += recurrenceDoc.count * 2;
  }

  return score;
}

// ====== SCOREBOARD BUILDER ======
async function buildMetaScoreBoard() {
    //console.log('=== buildMetaScoreBoard START ===');
  
    // 1) Filter with additional checks
    const filter = {
      'launched.status': true,
      'statistics.marketcap': { $gte: 50000 },
      'statistics.five_min.mcap': { $gt: 0 },
      'trading.buy': true,
      pairs: {
        $elemMatch: {
          balToken0: { $gt: "1" },
          balToken1: { $gt: "1" }
        }
      }
    };
  
    const options = {
      sort: { 'statistics.marketcap': -1 },
      limit: 200,
      lean: true
    };
  
    //console.log('Fetching tokens from each chain with filter:', JSON.stringify(filter, null, 2));
    const [bscTokens, ethTokens, baseTokens, avaxTokens] = await Promise.all([
      BscContract.find(filter, null, options),
      EthContract.find(filter, null, options),
      BaseContract.find(filter, null, options),
      AvaxContract.find(filter, null, options)
    ]);
  
    
    /* console.log(`BSC tokens found: ${bscTokens.length}`);
    console.log(`ETH tokens found: ${ethTokens.length}`);
    console.log(`BASE tokens found: ${baseTokens.length}`);
    console.log(`AVAX tokens found: ${avaxTokens.length}`); */
  
    const allTokens = [
      ...bscTokens.map(t => ({ ...t, chainName: 'BSC' })),
      ...ethTokens.map(t => ({ ...t, chainName: 'ETH' })),
      ...baseTokens.map(t => ({ ...t, chainName: 'BASE' })),
      ...avaxTokens.map(t => ({ ...t, chainName: 'AVAX' }))
    ];
  
    if (!allTokens.length) return [];
  
    // 2) Chain address arrays and name/symbol collection
    const addressMap = { BSC: [], ETH: [], BASE: [], AVAX: [] };
    const allNamesSet = new Set();
    const allSymbolsSet = new Set();
  
    for (const token of allTokens) {
      addressMap[token.chainName].push(token.contractAddress);
      if (token.name) allNamesSet.add(token.name.trim());
      if (token.symbol) allSymbolsSet.add(token.symbol.trim());
    }
  
    // 3) Volume aggregation
    const volumeMap = { BSC: {}, ETH: {}, BASE: {}, AVAX: {} };
  
    async function fetchLatestVolumeForChainViaAggregation(chainName, addresses) {
        if (!addresses.length) return;
        let volumeModel = {
          BSC: BscVolume,
          ETH: EthVolume,
          BASE: BaseVolume,
          AVAX: AvaxVolume
        }[chainName];
      
        const cutoff = Math.floor(Date.now() / 1000) - 1 * 3600; // last 1h
      
        const docs = await volumeModel.aggregate([
          { $match: { 
            timestamp: { $gte: cutoff }, 
            'trades.tokenAddress': { $in: addresses } 
          }},
          { $sort: { timestamp: -1 } },
          { $unwind: '$trades' },
          { $match: { 
            'trades.tokenAddress': { $in: addresses } 
          }},
          {
            $group: {
              _id: '$trades.tokenAddress',
              tradeInfo: { $first: '$trades' }
            }
          }
        ]).allowDiskUse(true);
      
        //console.log(`Recent aggregation for ${chainName}: ${docs.length}/${addresses.length} matched within 48h`);
      
        for (const item of docs) {
          volumeMap[chainName][item._id] = item.tradeInfo;
        }
      }
      
  
    await Promise.all([
      fetchLatestVolumeForChainViaAggregation('BSC', addressMap.BSC),
      fetchLatestVolumeForChainViaAggregation('ETH', addressMap.ETH),
      fetchLatestVolumeForChainViaAggregation('BASE', addressMap.BASE),
      fetchLatestVolumeForChainViaAggregation('AVAX', addressMap.AVAX)
    ]);
  
    // 4) Fresh Wallets
    const freshWalletMap = { BSC: {}, ETH: {}, BASE: {}, AVAX: {} };
    function getChainId(chainName) {
      return { BSC: 1, ETH: 2, BASE: 3, AVAX: 4 }[chainName] || 0;
    }
  
    async function fetchFreshWalletsForChain(chainName, addresses) {
      if (!addresses.length) return;
      const freshDocs = await FreshWallets.find({
        chain: getChainId(chainName),
        contractAddress: { $in: addresses }
      }).lean();
  
      for (const fw of freshDocs) {
        freshWalletMap[chainName][fw.contractAddress] = fw.count;
      }
    }
  
    await Promise.all([
      fetchFreshWalletsForChain('BSC', addressMap.BSC),
      fetchFreshWalletsForChain('ETH', addressMap.ETH),
      fetchFreshWalletsForChain('BASE', addressMap.BASE),
      fetchFreshWalletsForChain('AVAX', addressMap.AVAX)
    ]);
  
    // 5) Recurrence
    const combinedArray = Array.from(new Set([...allNamesSet, ...allSymbolsSet])).map(x => x.toLowerCase());
    const recDocs = await Recurence.find({ name: { $in: combinedArray } }).lean();
    const recurrenceMap = Object.fromEntries(recDocs.map(r => [r.name.toLowerCase(), r]));
  
    // 6) Build scoreboard
    const scoreboard = [];

    for (const tokenDoc of allTokens) {
      const { contractAddress, name, symbol, chainName } = tokenDoc;
    
      const volumeDoc = volumeMap[chainName][contractAddress];
      if (!volumeDoc || volumeDoc.buyVol < 10) continue;
    
      // === Final live validation BEFORE scoring ===
      let liveData;
      try {
        
        liveData = await checkToken(contractAddress, chainName);
        if (!liveData || !liveData.pairInfo || !liveData.info) continue;
    
        const liquidity = parseFloat(liveData.pairInfo.balCurrency) || 0;
        if (liquidity < 0.5) {
          //console.log(`[SKIP] Low liquidity < 0.5 for ${name} ${contractAddress} ${chainName}`);
          continue;
        }
    
        if (!liveData.trading?.buyEnabled || !liveData.trading?.sellEnabled) {
          //console.log(`[SKIP] Trading disabled for ${name}  ${contractAddress} ${chainName}`);
          continue;
        }
    
        const allowedCurrencies = ['BNB', 'WBNB', 'ETH', 'WETH', 'AVAX', 'WAVAX'];
        if (!allowedCurrencies.includes(liveData.currencySymbol?.toUpperCase())) {
          //console.log(`[SKIP] ${name} paired with ${liveData.currencySymbol}, not allowed.  ${contractAddress} ${chainName}`);
          continue;
        }
       
      } catch (err) {
        //console.log(`[SKIP] Live checkToken failed for ${contractAddress} on ${chainName}:`, err.message);
        continue;
      }
    
      const freshWalletCount = freshWalletMap[chainName][contractAddress] || 0;
      const nameKey = name?.trim().toLowerCase() || '';
      const symbolKey = symbol?.trim().toLowerCase() || '';
      const recurrenceDoc = recurrenceMap[nameKey] || recurrenceMap[symbolKey] || null;
    
      const score = calculateMetaScore({
        contractDoc: tokenDoc,
        volumeDoc,
        freshWalletCount,
        recurrenceDoc
      });
    
      scoreboard.push({
        chain: chainName,
        contractAddress,
        name: liveData.name || name,
        symbol: liveData.symbol || symbol,
        marketcap: liveData.info?.mcap || tokenDoc.statistics?.marketcap || 0,
        initialMc: tokenDoc.statistics?.initialMc || 0,
        score,
        currencySymbol: liveData.currencySymbol,
        balCurrency: liveData.pairInfo?.balCurrency,
        balToken: liveData.pairInfo?.balToken,
        totalSupply: liveData.totalSupply
      });
    }

 
    scoreboard.sort((a, b) => b.score - a.score);
    return scoreboard;
  }
  
// ====== POST TO TELEGRAM ======
async function postScoreBoardToTelegram() {
   // console.log('=== postScoreBoardToTelegram START ===');
    try {
      const scoreboard = await buildMetaScoreBoard();
  
      if (!scoreboard.length) {
       // await bot.telegram.sendMessage(CHAT_ID, '❌ No tokens found to score!');
        return;
      }
  
      const top10 = scoreboard.slice(0, 10);
      let messageText = `🔥 <b>10 Minutes Meta-Score Board</b> 🔥\n\n`;
  
      for (let i = 0; i < top10.length; i++) {
        const token = top10[i];
        let dexscrnUrl = token.chain.toLowerCase();
        if (dexscrnUrl === 'eth') dexscrnUrl = 'ethereum';
        if (dexscrnUrl === 'avax') dexscrnUrl = 'avalanche';
  
        const url = `https://dexscreener.com/${dexscrnUrl}/${token.contractAddress}`;
        const mcap = token.marketcap ? `$${Math.floor(token.marketcap).toLocaleString()}` : 'N/A';
  
        // === Extract from checkToken side ===
        const liq = parseFloat(token.balCurrency || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
        const currency = token.currencySymbol || '?';
  
        let poolPct = 0;
        if (token.balToken && token.totalSupply) {
          const balToken = parseFloat(token.balToken);
          const totalSupply = parseFloat(token.totalSupply.toString().replace(/,/g, ''));
          poolPct = totalSupply > 0 ? ((balToken / totalSupply) * 100).toFixed(2) : '0.00';
        }
  
        const pooledDisplay = `${liq} ${currency} (${poolPct}%)`;
  
        // === Format post ===
        let line = `🔹 <b>${i + 1}) [${token.chain}]</b> <a href="${url}">${token.name}</a> (${token.symbol})\n`;
        line += `📊 <b>Score:</b> ${token.score}\n`;
        line += `💰 <b>MCap:</b> ${mcap}\n`;
  
        if (token.initialMc && token.marketcap && token.initialMc > 0) {
          const growth = Math.floor(((token.marketcap - token.initialMc) / token.initialMc) * 100);
          line += `📈 <b>Growth from Launch:</b> ${growth > 0 ? '+' : ''}${growth.toLocaleString()}%\n`;
        }
  
        line += `💧 <b>Pooled:</b> ${pooledDisplay}\n\n`;
  
        messageText += line;
      }
  
      messageText += `🚀 <i>Click a name to view the live chart on DexScreener.</i>`;
  
      await bot.telegram.sendMessage(CHAT_ID, messageText, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        message_thread_id: 305865       
    }).catch((error) => {
        // Handle send error if needed
    });
  
     // console.log('✅ Scoreboard posted to Telegram.');
    } catch (err) {
      console.error('❌ Error posting scoreboard:', err);
    }
  }
  //305865

// ====== SCHEDULE TASK ======
setInterval(() => {
  console.log('=== setInterval triggered ===');
  postScoreBoardToTelegram();
}, 10 * 60 * 1000);

// Run once on startup
postScoreBoardToTelegram();

// Start bot
bot.launch().then(() => {
  console.log('Bot started. Listening for updates...');
}).catch(e => {
  console.error('Error launching bot', e);
});


// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
