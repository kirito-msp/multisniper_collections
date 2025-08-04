const express = require('express');
const mongoose = require('mongoose');
const { ethers, providers, Contract } = require('ethers');
const config = require('../config.json');
const tokenInfoABI = require('../abis/tokenInfo.json');
const app = express();
const port = 3123;
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

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
const { getSocialsToken } = require('./getSocials');

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
  // Note: chain=5 (Sonic) not in config.json? Adjust if needed.
};

// Consolidate chain-specific info for easier lookups
const chainConfigs = {
  1: {
    scanner: 'bscscan.com',
    currency: 'BNB',
    url: 'https://dexscreener.com/bsc/',
    cielo: 'https://app.bubblemaps.io/bsc/token/',
    apiChain: 'bsc',
  },
  2: {
    scanner: 'etherscan.io',
    currency: 'ETH',
    url: 'https://dexscreener.com/ethereum/',
    cielo: 'https://app.bubblemaps.io/eth/token/',
    apiChain: 'ethereum',
  },
  3: {
    scanner: 'basescan.org',
    currency: 'ETH',
    url: 'https://dexscreener.com/base/',
    cielo: 'https://app.bubblemaps.io/base/token/',
    apiChain: 'base',
  },
  4: {
    scanner: 'snowscan.xyz',
    currency: 'AVAX',
    url: 'https://dexscreener.com/avalanche/',
    cielo: 'https://app.bubblemaps.io/avax/token/',
    apiChain: 'avalanche',
  },
  5: {
    scanner: '146.routescan.io',
    currency: 'SONIC',
    url: 'https://dexscreener.com/sonic/',
    cielo: 'https://app.bubblemaps.io/sonic/token/',
    apiChain: 'sonic',
  },
};

const ERC20_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
];

const mongoUri = `mongodb://${config.mongodb.user}:${encodeURIComponent(
  config.mongodb.password
)}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}?authSource=multiChainApi`;

mongoose
  .connect(mongoUri)
  .then(() => {
    // console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    // console.error('MongoDB connection error:', err);
  });

/* ------------------------------------------------------------------
   Debounce Queue Implementation
   ------------------------------------------------------------------ */
// Object to hold pending updates per contract (keyed by contractAddress)
const pendingUpdates = {};
// Debounce delay in milliseconds (adjust as needed)
const updateDelay = 1000;

/**
 * Schedules a Telegram update for a given contract.
 * If multiple updates for the same contract come in rapidly,
 * only the last one will be sent after the debounce delay.
 */
function scheduleTelegramUpdate(chain, data) {
  const key = data.contractAddress;
  if (pendingUpdates[key]) {
    clearTimeout(pendingUpdates[key].timer);
  }
  pendingUpdates[key] = {
    chain,
    data,
    timer: setTimeout(() => {
      postToTg(pendingUpdates[key].chain, pendingUpdates[key].data);
      delete pendingUpdates[key];
    }, updateDelay),
  };
}

/* ------------------------------------------------------------------
   Express Routes
   ------------------------------------------------------------------ */
   app.use(express.json({ limit: '50mb' }));

/**
 * POST /data
 * Receives contract data and schedules a Telegram update.
 */
app.post('/data', (req, res) => {
  scheduleTelegramUpdate(req.body.chain, req.body.data);
  res.status(200).send('Data received!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

/**
 * Fetch new contracts from multiple chain DB models (example usage).
 * Currently logs BSC new contracts and then calls `process.exit(0)`.
 */
async function getNewContracts() {
  try {
    const bscNewContracts = await BscContract.find({ updatePost: true });
    const ethNewContracts = await EthContract.find({ updatePost: true });
    const baseNewContracts = await BaseContract.find({ updatePost: true });
    const avaxNewContracts = await AvaxContract.find({ updatePost: true });
    const sonicNewContracts = await SonicContract.find({ updatePost: true });

    for (const [key] of Object.entries(bscNewContracts)) {
      console.log(bscNewContracts[key]);
      process.exit(0); // Possibly for debugging – remove if not needed
    }
  } catch (err) {
    console.error('Error fetching new contracts:', err);
  }
}

/**
 * Main function to post contract data to Telegram.
 */
async function postToTg(chain, data) {
  try {
    // Retrieve chain config from pre-defined object
    const cfg = chainConfigs[chain];
    if (!cfg) return; // No chain config found

    const { scanner, currency, url, cielo, apiChain } = cfg;

    // Initialize provider & contract
    const provider = new ethers.providers.WebSocketProvider(providerRpc[chain]);
    const tokenCa = new Contract(data.contractAddress, ERC20_ABI, provider);

    let balanceInCa = 0.0;
    try {
      if (data.totalSupply && data.totalSupply !== '0') {
        // Balance of token in its own CA (possible clog?)
        const rawBalance = await tokenCa.balanceOf(data.contractAddress);
        const tokenSupply = await tokenCa.totalSupply();
        balanceInCa = parseFloat(rawBalance / 10 ** data.decimals).toFixed(0);
        const totalSupFloat = parseFloat(tokenSupply / 10 ** data.decimals).toFixed(0);

        balanceInCa = parseFloat((balanceInCa / totalSupFloat) * 100).toFixed(2);
      }
    } catch (e) {
      // Possibly token is not standard or no valid totalSupply
    }

    let devFunds = 0;
    try {
      devFunds = parseFloat((await provider.getBalance(data.contractCreator)) / 10 ** 18).toFixed(3);
    } catch (e) {
      // Could not get dev balance
    }

    let newMessage = '';
    if (data.isRug === true) {
      newMessage += '🚨 RUGGED!\n';
    }

    const infoDb = await getSimilarAndDevTokens(chain, data.contractCreator, data.hashCode);

    newMessage += `<a href='https://${scanner}/tx/${data.txHash}'>${data.name}</a> (${data.symbol})\n`
      + `└Unique Hash: #${data.hashCode} (Similar: <code>${infoDb.similar}</code> | Rugs: <code>${infoDb.rug}</code>)\n`
      + `└Clog: <code>${balanceInCa}</code>%\n`
      + `└Ca: <code>${data.contractAddress}</code>\n`
      + `└Supply: <code>${data.totalSupply}</code>(<code>${data.decimals}</code>)\n`
      + `└Dev: <code>${data.contractCreator}</code>\n`
      + `└Dev Funds: <code>${devFunds}</code> ${currency} (PrevTokens: <code>${infoDb.totalDev}</code> | Rugs: <code>${infoDb.totalDevRug}</code>)`;

    let hasData = false;
    if (data.launched.status === true) {
      const liveDataToken = await checkToken(data.contractAddress, chain, provider);
      hasData = liveDataToken;
      if (liveDataToken !== false) {
        const buyEnabled = liveDataToken.trading.buyEnabled ? '✅' : '🚫';
        const sellEnabled = liveDataToken.trading.sellEnabled ? '✅' : '🚫';
        const blockDataContracts = {};
        blockDataContracts[data.contractAddress] = liveDataToken
        const watchData = { chain, type: "blockDataCaUpdates", data: blockDataContracts };
        sendDataToWebSocketClients(watchData);
        newMessage += `\n\n📝Statistics:\n`
          + `└Launched: <code>${liveDataToken.dexName}</code>\n`
          + `└Mcap: <code>$${parseFloat(liveDataToken.info.mcap).toLocaleString()}</code> ( Initial: <code>$${parseFloat(data.statistics.initialMc).toLocaleString()}</code>)\n`
          + `└Ath: <code>$${parseFloat(data.statistics.ath).toLocaleString()}</code>\n`
          + `└Pool: <code>${parseFloat(liveDataToken.pairInfo.balToken).toLocaleString()}</code> ${liveDataToken.symbol} / <code>${parseFloat(liveDataToken.pairInfo.balCurrency).toLocaleString()}</code> ${liveDataToken.currencySymbol}\n`
          + `└Burned: <code>${liveDataToken.burned}</code>\n`
          + `└Taxes: B <code>${liveDataToken.buyTax}</code>% | S <code>${liveDataToken.sellTax}</code>% | T <code>${liveDataToken.transferTax}</code>%\n`
          + `└Gas fee: B <code>$${parseFloat(liveDataToken.gasFeeTx.buyGas).toFixed(4)}</code> | S <code>$${parseFloat(liveDataToken.gasFeeTx.sellGas).toFixed(4)}</code>\n`
          + `└Trading: B ${buyEnabled} | S ${sellEnabled}\n`
          + `\n❄️Fresh wallets: <code>${parseFloat(data.statistics.block1supply.freshWallets).toLocaleString()}</code>\n`;

        // If any of the time-based stats exist, show them
        const { five_min, thirty_min, sixty_min, six_hours, twelve_hours, twenty_four_hours } = data.statistics;

        if (five_min.mcap > 0) {
          newMessage += `\n📈Monitor:\n`
            + `└5 min: Mcap <code>$${parseFloat(five_min.mcap).toLocaleString()}</code> | Ath <code>$${parseFloat(five_min.ath).toLocaleString()}</code> | Growth <code>${parseFloat(five_min.growth).toLocaleString()}%</code>\n`;
        }
        if (thirty_min.mcap > 0) {
          newMessage += `└30 min: Mcap <code>$${parseFloat(thirty_min.mcap).toLocaleString()}</code> | Ath <code>$${parseFloat(thirty_min.ath).toLocaleString()}</code> | Growth <code>${parseFloat(thirty_min.growth).toLocaleString()}%</code>\n`;
        }
        if (sixty_min.mcap > 0) {
          newMessage += `└60 min: Mcap <code>$${parseFloat(sixty_min.mcap).toLocaleString()}</code> | Ath <code>$${parseFloat(sixty_min.ath).toLocaleString()}</code> | Growth <code>${parseFloat(sixty_min.growth).toLocaleString()}%</code>\n`;
        }
        if (six_hours.mcap > 0) {
          newMessage += `└6 Hours: Mcap <code>$${parseFloat(six_hours.mcap).toLocaleString()}</code> | Ath <code>$${parseFloat(six_hours.ath).toLocaleString()}</code> | Growth <code>${parseFloat(six_hours.growth).toLocaleString()}%</code>\n`;
        }
        if (twelve_hours.mcap > 0) {
          newMessage += `└12 Hours: Mcap <code>$${parseFloat(twelve_hours.mcap).toLocaleString()}</code> | Ath <code>$${parseFloat(twelve_hours.ath).toLocaleString()}</code> | Growth <code>${parseFloat(twelve_hours.growth).toLocaleString()}%</code>\n`;
        }
        if (twenty_four_hours.mcap > 0) {
          newMessage += `└24 Hours: Mcap <code>$${parseFloat(twenty_four_hours.mcap).toLocaleString()}</code> | Ath <code>$${parseFloat(twenty_four_hours.ath).toLocaleString()}</code> | Growth <code>${parseFloat(twenty_four_hours.growth).toLocaleString()}%</code>\n`;
        }

        // Check and display social links if they exist or can be retrieved
        let hasOne = false;
        if (
          (five_min.mcap > 0 ||
            thirty_min.mcap > 0 ||
            sixty_min.mcap > 0 ||
            six_hours.mcap > 0) &&
          data.socials.web === 'none' &&
          data.socials.telegram === 'none' &&
          data.socials.twitter === 'none'
        ) {
          const socials = await getSocialsToken(liveDataToken.pairAddress, apiChain);
          if (socials != null) {
            const ContractModel = chainContractModel[chain];
            const existingContract = await ContractModel.findOne({ contractAddress: data.contractAddress });

            if (socials.websiteLink?.includes('http')) {
              if (!hasOne) {
                hasOne = true;
                newMessage += '\n📱Socials:\n';
              }
              newMessage += `<a href='${socials.websiteLink}'>Website</a>`;
              existingContract.socials.web = socials.websiteLink;
            }
            if (socials.telegramLink?.includes('http')) {
              if (!hasOne) {
                hasOne = true;
                newMessage += '\n📱Socials:\n';
              } else {
                newMessage += ' | ';
              }
              newMessage += `<a href='${socials.telegramLink}'>Telegram</a>`;
              existingContract.socials.telegram = socials.telegramLink;
            }
            if (socials.twitterLink?.includes('http')) {
              let hasTwitter = false;
              if (!hasOne) {
                hasOne = true;
                hasTwitter = true;
                newMessage += '\n📱Socials:\n';
              } else {
                newMessage += ' | ';
                hasTwitter = true;
              }
              newMessage += `<a href='${socials.twitterLink}'>Twitter(X)</a>`;
              existingContract.socials.twitter = socials.twitterLink;

              if (hasTwitter && socials.twitterInfo?.followers !== undefined) {
                newMessage += `\nInfo(X): 🕚 ${timeAgo(socials.twitterInfo.created)} | Verified: ${socials.twitterInfo.verified} | Followers: ${parseFloat(socials.twitterInfo.followers).toLocaleString()}`;
                existingContract.socials.twitter_info.created = socials.twitterInfo.created;
                existingContract.socials.twitter_info.verified = socials.twitterInfo.verified;
                existingContract.socials.twitter_info.followers = socials.twitterInfo.followers;
              }
            }
            await existingContract.save();
          }
        } else {
          // Already have some socials stored in the DB
          let wroteLine = false;
          if (data.socials.web?.includes('http')) {
            if (!hasOne) {
              hasOne = true;
              newMessage += '\n📱Socials:\n';
              wroteLine = true;
            }
            newMessage += wroteLine ? `<a href='${data.socials.web}'>Website</a>` : ` | <a href='${data.socials.web}'>Website</a>`;
          }
          if (data.socials.telegram?.includes('http')) {
            if (!hasOne) {
              hasOne = true;
              newMessage += '\n📱Socials:\n';
            } else {
              newMessage += ' | ';
            }
            newMessage += `<a href='${data.socials.telegram}'>Telegram</a>`;
          }
          if (data.socials.twitter?.includes('http')) {
            let hasTwitter = false;
            if (!hasOne) {
              hasOne = true;
              hasTwitter = true;
              newMessage += '\n📱Socials:\n';
            } else {
              hasTwitter = true;
              newMessage += ' | ';
            }
            newMessage += `<a href='${data.socials.twitter}'>Twitter(X)</a>`;

            if (hasTwitter && data.socials.twitter_info.created !== 'none') {
              newMessage += `\nInfo(X): 🕚 ${timeAgo(data.socials.twitter_info.created)} | Verified: ${data.socials.twitter_info.verified} | Followers: ${parseFloat(data.socials.twitter_info.followers).toLocaleString()}`;
            }
          }
        }
      }
    }

    newMessage += `\n\n<a href ='${url}${data.contractAddress}'>DexScreener</a> | <a href ='https://x.com/search?q=($${data.symbol}+OR+${data.contractAddress})&src=typed_query'>Search X.com</a> | <a href ='https://app.cielo.finance/profile/${data.contractAddress}/pnl/tokens'>Cielo</a> | <a href ='${cielo}${data.contractAddress}'>BubbleMaps</a>\n`;
    newMessage += `\n\n⚒️Creation time: ${await formatTime(data.timestamp)}`;

    if (hasData !== false) {
      newMessage += `\n📈Launch time: ${await formatTime(data.timestamp)}`;
      let timeBetween = data.launched.timestamp - data.timestamp;
      if (timeBetween < 1) {
        newMessage += `\n🕚Launched in: 0 days, 0 hours, 0 minutes, 0 seconds.`;
      } else {
        const days = Math.floor(timeBetween / (24 * 3600));
        const remainderAfterDays = timeBetween % (24 * 3600);
        const hours = Math.floor(remainderAfterDays / 3600);
        const remainderAfterHours = remainderAfterDays % 3600;
        const minutes = Math.floor(remainderAfterHours / 60);
        const seconds = remainderAfterHours % 60;
        newMessage += `\n🕚Launched in: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds.`;
      }

      if (data.isRug === true) {
        timeBetween = Math.floor(new Date().getTime() / 1000) - data.launched.timestamp;
        const days = Math.floor(timeBetween / (24 * 3600));
        const remainderAfterDays = timeBetween % (24 * 3600);
        const hours = Math.floor(remainderAfterDays / 3600);
        const remainderAfterHours = remainderAfterDays % 3600;
        const minutes = Math.floor(remainderAfterHours / 60);
        const seconds = remainderAfterHours % 60;
        newMessage += `\n🚨Rugged in: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds.`;
      }
    }

    // Send or edit message on Telegram
    try {
      const grupDev = "YOUR TG GROUP OR CHANNEL ID TO SEND MESSAGES";
      const botMain = new Telegraf(teleGramBot[chain]);
      if (data.messageId > 0) {
        // Edit existing message
        botMain.telegram
          .editMessageText(grupDev, data.messageId, null, newMessage, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            message_thread_id: teleTopicID[chain],
          })
          .catch(() => {
            // Ignore if editing fails
          });
      } else {
        // Send new message
        botMain.telegram
          .sendMessage(grupDev, newMessage, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            message_thread_id: teleTopicID[chain],
          })
          .then((m) => {
            updateMessageId(data._id, m, chain);
          })
          .catch(() => {
            // Ignore if sending fails
          });
      }
    } catch (e) {
      // If Telegram fails entirely
      console.log('Telegram error:', e);
    }
  } catch (e) {
    console.log('postToTg error:', e);
  }
}

/**
 * Formats timestamp (in seconds) to a UTC date string "HH:MM:SS DD.MM.YYYY"
 */
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

/**
 * Returns a "time ago" or "in X time" string for a provided date string.
 */
function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  let secondsDifference = (now.getTime() - date.getTime()) / 1000;
  const isFuture = secondsDifference < 0;

  // Take absolute value for calculations
  secondsDifference = Math.abs(secondsDifference);

  let timeString;
  if (secondsDifference < 60) {
    timeString = `${Math.floor(secondsDifference)} seconds`;
  } else if (secondsDifference < 3600) {
    timeString = `${Math.floor(secondsDifference / 60)} minutes`;
  } else if (secondsDifference < 86400) {
    timeString = `${Math.floor(secondsDifference / 3600)} hours`;
  } else if (secondsDifference < 2592000) {
    timeString = `${Math.floor(secondsDifference / 86400)} days`;
  } else if (secondsDifference < 31104000) {
    timeString = `${Math.floor(secondsDifference / 2592000)} months`;
  } else {
    timeString = `${Math.floor(secondsDifference / 31104000)} years`;
  }

  return isFuture ? `in ${timeString}` : `${timeString} ago`;
}

/**
 * Fetches the count of contracts with matching hashCode,
 * how many are rug, how many dev has deployed, etc.
 */
async function getSimilarAndDevTokens(chain, dev, hash) {
  try {
    const ContractModel = chainContractModel[chain];

    const similar = await ContractModel.countDocuments({ hashCode: hash });
    const rug = await ContractModel.countDocuments({ hashCode: hash, isRug: true });
    const totalDev = await ContractModel.countDocuments({ contractCreator: dev });
    const totalDevRug = await ContractModel.countDocuments({ contractCreator: dev, isRug: true });

    return {
      similar: parseFloat(similar - 1).toLocaleString(),
      rug: parseFloat(rug).toLocaleString(),
      totalDev: parseFloat(totalDev - 1).toLocaleString(),
      totalDevRug: parseFloat(totalDevRug).toLocaleString(),
    };
  } catch (e) {
    console.error(e);
    return {
      similar: 0,
      rug: 0,
      totalDev: 0,
      totalDevRug: 0,
    };
  }
}

/**
 * Example function to get first-block history for a token; usage not fully clear.
 * (Note: this references data.owner and wallets[] which are not defined in scope.)
 */
async function getFirstBlockHistory(provider, chain, tokenAddress, dev, pairAddress, blockNumber, supply) {
  let liqTime = 0;
  let initialClog = false;
  let clogSupply = ethers.BigNumber.from(0);
  let caBalance = ethers.BigNumber.from(0);
  let totalTransfers = 0;
  let freshWallets = 0;
  let supplyOwned = 0;

  const ERC20_ABI = [
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'function balanceOf(address account) external view returns (uint256)',
  ];
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const transferEvents = await contract.queryFilter(
    contract.filters.Transfer(),
    blockNumber,
    blockNumber + 1
  );

  for (const event of transferEvents) {
    if (event.args) {
      const from = event.args.from;
      const to = event.args.to;

      // Get the transaction hash from the event
      const transactionHash = event.transactionHash;
      const transaction = await provider.getTransaction(transactionHash);
      const blockTime = await provider.getBlock(transaction.blockNumber);
      const nonce = transaction.nonce;

      if (liqTime === 0 && to === pairAddress) {
        liqTime = blockTime.timestamp;
      }

      if (from === tokenAddress && to === tokenAddress && !initialClog) {
        initialClog = true;
        const totalSupply = ethers.BigNumber.from(supply);
        clogSupply = parseFloat(
          event.args.value
            .mul(ethers.BigNumber.from(1000000))
            .div(totalSupply)
            .toString() / 10000
        ).toFixed(4);
      }

      // The following references data.owner and wallets[] which are not defined in function scope:
      // if (from !== data.owner && (from == pairAddress || to == pairAddress)) { totalTransfers++; }
      // if (from !== data.owner && to !== pairAddress && nonce <= 10) { ... }

      // Additional logic presumably intended here ...
    }
  }
}

/**
 * Updates the message ID in the database for a contract by _id.
 */
async function updateMessageId(docId, m, chain) {
  try {
    const ContractModel = chainContractModel[chain];
    await ContractModel.updateOne({ _id: docId }, { $set: { messageId: m.message_id } });
  } catch (error) {
    console.error('Error updating document:', error);
  }
}

/**
 * Send message payload to all connected WebSocket clients via HTTP server
 */
async function sendDataToWebSocketClients(message) {
  try {
    await axios.post('http://localhost:6160/send-data', { message });
    try{
      //await axios.post('http://localhost:6164/send-data', { message });
    }catch(e){}
  } catch (error) {
    console.error('Error sending data to WebSocket clients:', error.message);
  }
}

module.exports = {
  getNewContracts,
  scheduleTelegramUpdate, // if you need it externally
  postToTg,
  getSimilarAndDevTokens,
  getFirstBlockHistory,
  updateMessageId,
};
