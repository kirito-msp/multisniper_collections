const express = require('express');
const mongoose = require('mongoose');
const { ethers, providers, Contract } = require('ethers');
const config = require('../config.json');
const tokenInfoABI = require('../abis/tokenInfo.json');
const { Telegraf } = require('telegraf');

// Import all contract models statically
const BscContract = require('../models/BscContract');
const EthContract = require('../models/EthContract');
const BaseContract = require('../models/BaseContract');
const AvaxContract = require('../models/AvaxContract');
const SonicContract = require('../models/SonicContract');

const BscVolume = require('../models/BscVolume');
const EthVolume = require('../models/EthVolume');
const BaseVolume = require('../models/BaseVolume');
const AvaxVolume = require('../models/AvaxVolume');
const SonicVolume = require('../models/SonicVolume');

const BscWallet = require('../models/BscWallet');
const EthWallet = require('../models/EthWallet');
const BaseWallet = require('../models/BaseWallet');
const AvaxWallet = require('../models/AvaxWallet');
const SonicWallet = require('../models/SonicWallet');

const { checkToken } = require('./tokenInfo');

// Mongoose chain models
const chainContractModel = {
  1: BscContract,
  2: EthContract,
  3: BaseContract,
  4: AvaxContract,
  5: SonicContract,
};

const chainVolumeModel = {
  1: BscVolume,
  2: EthVolume,
  3: BaseVolume,
  4: AvaxVolume,
  5: SonicVolume,
};

const chainWalletsModel = {
  1: BscWallet,
  2: EthWallet,
  3: BaseWallet,
  4: AvaxWallet,
  5: SonicWallet,
};

const teleGramBot = {
  1: '"YOUR TELEGRAM BOT TOKEN"',
  2: '"YOUR TELEGRAM BOT TOKEN"',
  3: '"YOUR TELEGRAM BOT TOKEN"',
  4: '"YOUR TELEGRAM BOT TOKEN"',
  5: '"YOUR TELEGRAM BOT TOKEN"',
};

const teleTopicID = {
  1: 58483,
  2: 58485,
  3: 58489,
  4: 58487,
  5: 58535,
};

const providerRpc = {
  1: config.bsc.wsUrl,
  2: config.ethereum.wsUrl,
  3: config.base.wsUrl,
  4: config.avax.wsUrl,
  // chain 5 (Sonic) not included, if needed just add it here
};

const ERC20_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
];

// If volumes or market caps are bigger than this, skip displaying them in the final report.
const BIG_VALUE_THRESHOLD = 1.0e15; // e.g. 1 quadrillion – adjust as you like

// If the string representation includes "e+NN" for large exponents, also skip.
function isValueTooLarge(num) {
  if (!num) return false;
  const strVal = String(num);
  // Check for scientific notation or numeric value above threshold
  if (strVal.includes('e+') || parseFloat(num) > BIG_VALUE_THRESHOLD) {
    return true;
  }
  return false;
}

// Tokens to exclude from the final aggregator
let excludeList = {
  '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c': true,
  '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56': true,
  '0x55d398326f99059fF775485246999027B3197955': true,
  '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d': true,
  '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3': true,
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': true,
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': true,
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': true,
  '0x6B175474E89094C44Da98b954EedeAC495271d0F': true,
  '0x4200000000000000000000000000000000000006': true,
  '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2': true,
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': true,
  '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb': true,
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7': true,
  '0xc7198437980c041c805A1EDcbA50c1Ce5db95118': true,
  '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7': true,
  '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E': true,
  '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70': true,
  '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38': true,
  '0x309C92261178fA0CF748A855e90Ae73FDb79EBc7': true,
  '0x29219dd400f2Bf60E5a23d13Be72B486D4038894': true,
  '0x625E7708f30cA75bfd92586e17077590C60eb4cD': true,
  '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB': true,
  '0x152b9d0FdC40C096757F570A51E494bd4b943E50': true,
  '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3': true,
  '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf': true,
  '0x865377367054516e17014CcdED1e7d814EDC9ce4': true,
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': true,
  '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497': true,
};

// Telegram message IDs for editing in subsequent runs
let msgIds = {
  bsc: 0,
  base: 0,
  eth: 0,
  avax: 0,
};

// Connect to Mongo
const mongoUri = `mongodb://${config.mongodb.user}:${encodeURIComponent(
  config.mongodb.password
)}@${config.mongodb.host}:${config.mongodb.port}/${
  config.mongodb.database
}?authSource=multiChainApi`;

mongoose
  .connect(mongoUri)
  .then(() => {
    // DB connected
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

/**
 * Aggregates recent trades from the last 5 minutes for a given chain.
 */
async function aggregateRecentTrades(chain) {
  try {
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
    const ContractVolume = chainVolumeModel[chain];
    if (!ContractVolume) return false;

    // All volume docs from last 5 min
    const docs = await ContractVolume.find({ timestamp: { $gt: fiveMinutesAgo } });
    const aggregatedTrades = {};

    for (const doc of docs) {
      for (const trade of doc.trades) {
        const token = trade.tokenAddress;
        // Skip tokens in excludeList
        if (excludeList[token]) continue;

        if (!aggregatedTrades[token]) {
          aggregatedTrades[token] = {
            tokenAddress: token,
            name: null,
            symbol: null,
            decimals: 0,
            supply: 0,
            mcap: 0,
            total: 0,
            buys: 0,
            buyVol: 0,
            sells: 0,
            sellVol: 0,
          };
        }
        // Aggregate trade info
        aggregatedTrades[token].total += trade.total;
        aggregatedTrades[token].buys += trade.buys;
        aggregatedTrades[token].buyVol += trade.buyVol;
        aggregatedTrades[token].sells += trade.sells;
        aggregatedTrades[token].sellVol += trade.sellVol;
      }
    }

    // Convert to array
    const tradesArray = Object.values(aggregatedTrades);
    if (!tradesArray.length) return false;

    // Sort by key metrics
    const topByTotal = [...tradesArray].sort((a, b) => b.total - a.total).slice(0, 3);
    const topByBuyVol = [...tradesArray].sort((a, b) => b.buyVol - a.buyVol).slice(0, 3);
    const topBySellVol = [...tradesArray].sort((a, b) => b.sellVol - a.sellVol).slice(0, 3);

    return { topByTotal, topByBuyVol, topBySellVol };
  } catch (e) {
    console.error('Error in aggregateRecentTrades:', e);
    return false;
  }
}

/**
 * Retrieve chain aggregates, enrich them with `checkToken`, post to Telegram.
 */
async function mainBsc() {
  const provider = new ethers.providers.WebSocketProvider(providerRpc[1]);
  const info = await aggregateRecentTrades(1);
  if (!info) return false;

  await enrichTrades(info.topByTotal, 1, provider);
  await enrichTrades(info.topByBuyVol, 1, provider);
  await enrichTrades(info.topBySellVol, 1, provider);

  const report = createTelegramReport(info, 'bsc', 'https://dexscreener.com/bsc/');
  if (report) postReport('bsc', report);
  return true;
}

async function mainEth() {
  const provider = new ethers.providers.WebSocketProvider(providerRpc[2]);
  const info = await aggregateRecentTrades(2);
  if (!info) return false;

  await enrichTrades(info.topByTotal, 2, provider);
  await enrichTrades(info.topByBuyVol, 2, provider);
  await enrichTrades(info.topBySellVol, 2, provider);

  const report = createTelegramReport(info, 'eth', 'https://dexscreener.com/ethereum/');
  if (report) postReport('eth', report);
  return true;
}

async function mainBase() {
  const provider = new ethers.providers.WebSocketProvider(providerRpc[3]);
  const info = await aggregateRecentTrades(3);
  if (!info) return false;

  await enrichTrades(info.topByTotal, 3, provider);
  await enrichTrades(info.topByBuyVol, 3, provider);
  await enrichTrades(info.topBySellVol, 3, provider);

  const report = createTelegramReport(info, 'base', 'https://dexscreener.com/base/');
  if (report) postReport('base', report);
  return true;
}

async function mainAvax() {
  const provider = new ethers.providers.WebSocketProvider(providerRpc[4]);
  const info = await aggregateRecentTrades(4);
  if (!info) return false;

  await enrichTrades(info.topByTotal, 4, provider);
  await enrichTrades(info.topByBuyVol, 4, provider);
  await enrichTrades(info.topBySellVol, 4, provider);

  const report = createTelegramReport(info, 'avax', 'https://dexscreener.com/avalanche/');
  if (report) postReport('avax', report);
  return true;
}

/**
 * Enriches the aggregated trades with live token data from checkToken().
 * Skips any tokens with insane numbers (mcap, volumes, etc.).
 */
async function enrichTrades(trades, chain, provider) {
  for (let i = 0; i < trades.length; i++) {
    const liveDataToken = await checkToken(trades[i].tokenAddress, chain, provider);
    if (liveDataToken !== false) {
      const mcap = liveDataToken?.info?.mcap || 0;
      const supply = liveDataToken.totalSupply || 0;
      // If the MC or volumes are too large, skip this token from final display
      if (
        isValueTooLarge(mcap) ||
        isValueTooLarge(trades[i].total) ||
        isValueTooLarge(trades[i].buyVol) ||
        isValueTooLarge(trades[i].sellVol)
      ) {
        // zero out so we skip it in final rendering
        trades[i].mcap = 0;
        trades[i].total = 0;
        trades[i].buyVol = 0;
        trades[i].sellVol = 0;
        trades[i].name = 'SKIP';
      } else {
        // Enrich normal data
        Object.assign(trades[i], {
          name: liveDataToken.name,
          symbol: liveDataToken.symbol,
          decimals: liveDataToken.decimals,
          supply,
          mcap,
        });
      }
    }
  }
}

/**
 * Creates a concise Telegram report with icons, skipping tokens with large values (mcap=0 or "SKIP").
 */
function createTelegramReport(info, chainKey, baseUrl) {
  const now = formatTime();
  // Filter out tokens that ended up with 'SKIP' or zero total
  const topByTotal = info.topByTotal.filter((t) => t.name !== 'SKIP' && t.total > 0);
  const topByBuyVol = info.topByBuyVol.filter((t) => t.name !== 'SKIP' && t.buyVol > 0);
  const topBySellVol = info.topBySellVol.filter((t) => t.name !== 'SKIP' && t.sellVol > 0);

  // If we have no tokens to display, return null
  if (!topByTotal.length && !topByBuyVol.length && !topBySellVol.length) {
    return null;
  }

  // Some chain icons for visual flavor
  const chainIcon = {
    bsc: '🟣 BSC',
    eth: '🟠 ETH',
    base: '🟢 BASE',
    avax: '⚪️ AVAX',
  };

  let report = `${chainIcon[chainKey] || chainKey} • 5m Trade Report\n\n`;

  // Only show each section if it has items
  if (topByTotal.length) {
    report += `📊 <b>Top 3 by Trading Volume:</b>\n`;
    topByTotal.forEach((t, idx) => {
      report += formatCompactLine(idx + 1, t, baseUrl);
    });
    report += '\n';
  }

  if (topByBuyVol.length) {
    report += `🛒 <b>Top 3 by Buy Volume:</b>\n`;
    topByBuyVol.forEach((t, idx) => {
      report += formatCompactLine(idx + 1, t, baseUrl, 'buy');
    });
    report += '\n';
  }

  if (topBySellVol.length) {
    report += `💸 <b>Top 3 by Sell Volume:</b>\n`;
    topBySellVol.forEach((t, idx) => {
      report += formatCompactLine(idx + 1, t, baseUrl, 'sell');
    });
    report += '\n';
  }

  report += `⏱ <i>Updated</i>: ${now}`;
  return report;
}

/**
 * Formats a single line for the Telegram message in a short, icon-based style.
 */
function formatCompactLine(index, token, baseUrl, section = 'total') {
  const mcapVal = Number(token.mcap).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const totalVal = Number(token.total).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const buyVal = Number(token.buyVol).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const sellVal = Number(token.sellVol).toLocaleString(undefined, { maximumFractionDigits: 0 });

  let line = `${index}. ${token.name} (<i>$${mcapVal} MC</i>)\n`;
  line += `└<a href="${baseUrl + token.tokenAddress}">🔗 DexScreener</a>\n`;

  switch (section) {
    case 'buy':
      line += `   🛍 BuyVol: $${buyVal} | 💰 TV: $${totalVal}\n`;
      break;
    case 'sell':
      line += `   💸 SellVol: $${sellVal} | 💰 TV: $${totalVal}\n`;
      break;
    default:
      // "total" or no specific
      line += `   💰 TotalVol: $${totalVal} | 🛒 B: $${buyVal} | 💸 S: $${sellVal}\n`;
      break;
  }

  return line;
}

/**
 * Posts or edits the final report message on Telegram.
 */
async function postReport(chain, message) {
  try {
    const grupDev = "YOUR TG GROUP OR CHANNEL ID TO SEND MESSAGES";
    // your main aggregator bot token
    const botMain = new Telegraf('"YOUR TELEGRAM BOT TOKEN"');
  
    if (msgIds[chain] > 0) {
      // Edit existing message
      botMain.telegram
        .editMessageText(grupDev, msgIds[chain], null, message, {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          message_thread_id: 81256,
        })
        .catch(() => {
          // if it fails, do nothing
        });
    } else {
      // Post new message
      botMain.telegram
        .sendMessage(grupDev, message, {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          message_thread_id: 81256,
        })
        .then((m) => {
          // store message ID so we can edit next time
          msgIds[chain] = m.message_id;
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
    }
  } catch (e) {
    console.log('postReport error:', e);
  }
}

/**
 * Returns current UTC date/time as "HH:MM:SS DD.MM.YYYY"
 */
function formatTime() {
  try {
    const date = new Date(); // current time
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${hours}:${minutes}:${seconds} ${day}.${month}.${year}`;
  } catch (e) {
    console.error(e);
    return '00:00:00 00.00.0000';
  }
}

/**
 * Main entry point: runs all chain updates sequentially, then repeats every 5 min.
 */
async function main() {
  await mainBsc();
  await mainEth();
  await mainBase();
  await mainAvax();
}

// Fire once
main();
// Repeat every 5 minutes
setInterval(main, 5 * 60 * 1000);
