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
const axios = require('axios');

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

/**
 * Announce data to a specified local endpoint (POST).
 */
async function sendToEndpoint(url, payload) {
  try {
    await axios.post(url, payload);
  } catch (error) {
    console.error(`Error sending data to ${url}:`, error);
  }
}

/**
 * Announces token creation/updates to the local service.
 */
async function anouncePost(announcePost) {
  await sendToEndpoint('http://localhost:3123/data', announcePost);
}

/**
 * Announces trading data to the local service.
 */
async function anounceTrading(announcePost) {
  await sendToEndpoint('http://localhost:3124/data', announcePost);
}

/**
 * Announces fresh wallets to the local service.
 */
async function sendInfoToFreshTracker(announcePost) {
  await sendToEndpoint('http://localhost:3126/data', announcePost);
}

/**
 * Stores a new contract if it does not exist.
 */
async function storeNewContracts(contractInfo) {
  if (!contractInfo) return;  
  if (contractInfo.info.totalSupply == "0" || contractInfo.info.totalSupply == 0) return;

  const ContractModel = chainContractModel[contractInfo.chain];
  if (!ContractModel) {
    console.error(`No contract model found for chain: ${contractInfo.chain}`);
    return;
  }

  try {
    const existingContract = await ContractModel.findOne({
      contractAddress: contractInfo.contractAddress,
    });
    if (existingContract) return; // Already stored
    let isPlatform = false
      if(contractInfo.chain == 3 && contractInfo?.zora == true){
        isPlatform = "zora"
      } 
    const newData = {
      _id: contractInfo.contractAddress,
      name: contractInfo.info.name,
      symbol: contractInfo.info.symbol,
      decimals: contractInfo.info.decimals,
      totalSupply: contractInfo.info.totalSupply,
      contractAddress: contractInfo.contractAddress,
      contractCreator: contractInfo.contractDeployer,
      txHash: contractInfo.txHash,
      block: contractInfo.block,
      timestamp: contractInfo.timestamp,
      limits: {
        buytax: contractInfo?.limits?.buyFee ?? 0,
        selltax: contractInfo?.limits?.sellFee ?? 0,        
        transfertax: 0,
        maxtransaction: contractInfo?.limits?.maxTx ?? 0,
        maxwallet: contractInfo?.limits?.maxWallet ?? 0,
      },
      pairs: [],
      launched: {
        status: contractInfo.info.listed,
        txHash: 'null',
        block: 0,
        timestamp: 0,
      },
      trading: {
        buy: false,
        sell: false,
      },
      socials: {
        web: 'none',
        telegram: 'none',
        twitter: 'none',
        twitter_info: {
          created: 'none',
          verified: 'none',
          followers: 0,
        },
      },
      twitter_calls: [],
      influencers_calls: [],
      statistics: {
        price: '0',
        marketcap: 0,
        initialMc: 0,
        burned: 0,
        block1supply: {
          total: 0,
          freshWallets: 0,
          clog: 0,
        },
        ath: 0,
        five_min: { mcap: 0, growth: 0, ath: 0 },
        thirty_min: { mcap: 0, growth: 0, ath: 0 },
        sixty_min: { mcap: 0, growth: 0, ath: 0 },
        six_hours: { mcap: 0, growth: 0, ath: 0 },
        twelve_hours: { mcap: 0, growth: 0, ath: 0 },
        twenty_four_hours: { mcap: 0, growth: 0, ath: 0 },
      },
      hashCode: contractInfo?.limits?.uniqueHash ?? "mspUnknown",
      isRug: false,
      messageId: 0,
      updatePost: false,
      isPlatform: isPlatform
    };

    // Announce post before saving
    await anouncePost({
      chain: contractInfo.chain,
      data: newData,
    });

    const newContract = new ContractModel(newData);
    await newContract.save();
  } catch (error) {
    console.error('Error in storeNewContracts:', error, contractInfo);
  }
}

/**
 * Stores new pairs if the main token already exists, and updates the contract data.
 */
async function storeNewPairs(contractInfo, provider) {
  if (!contractInfo) return;

  const ContractModel = chainContractModel[contractInfo.chain];
  if (!ContractModel) {
    console.error(`No contract model found for chain: ${contractInfo.chain}`);
    return;
  }

  try {
    // Check if token0 or token1 is already in the DB as a main token
    let mainToken = await ContractModel.findOne({ contractAddress: contractInfo.token0 });
    if (!mainToken) {
      mainToken = await ContractModel.findOne({ contractAddress: contractInfo.token1 });
    }

    if (!mainToken) return;

    mainToken.pairs.push(contractInfo);

    // If token is not yet launched, check if it meets launch conditions
    if (!mainToken.launched.status) {
      mainToken.updatePost = true;
      const liveDataToken = await checkToken(mainToken.contractAddress, contractInfo.chain, provider);

      if (liveDataToken && liveDataToken !== false) {
        try {
          if (liveDataToken.listed) {
            if (liveDataToken.pairInfo.balToken > 0.1 && liveDataToken.pairInfo.balCurrency > 0.1) {
              mainToken.launched.status = true;
            }
            if (liveDataToken.info.mcap > 0) {
              mainToken.limits.buytax = liveDataToken.buyTax;
              mainToken.limits.selltax = liveDataToken.sellTax;
              mainToken.limits.transfertax = liveDataToken.transferTax;
              mainToken.launched.txHash = contractInfo.txHash;
              mainToken.launched.block = contractInfo.block;
              mainToken.launched.timestamp = contractInfo.timestamp;
              mainToken.trading.buy = liveDataToken.trading.buyEnabled;
              mainToken.trading.sell = liveDataToken.trading.sellEnabled;
              mainToken.statistics.price = liveDataToken.info.priceToken;
              mainToken.statistics.marketcap = liveDataToken.info.mcap;
              mainToken.statistics.burned = parseFloat(liveDataToken.burned.split('%')[0]);

              if (mainToken.statistics.ath < liveDataToken.info.mcap) {
                mainToken.statistics.ath = liveDataToken.info.mcap;
              }
              if (mainToken.statistics.initialMc === 0 && liveDataToken.info.mcap > 0) {
                mainToken.statistics.initialMc = liveDataToken.info.mcap;
              }
            }
          }
        } catch (e) {
          console.error('Error updating mainToken with liveDataToken in storeNewPairs:', e);
        }
      }
    }

    await mainToken.save();

    // Announce changes
    await anouncePost({
      chain: contractInfo.chain,
      data: mainToken,
    });
  } catch (error) {
    console.error('Error in storeNewPairs:', error);
  }
}

/**
 * Iterates over an object of items and stores them as new contracts or pairs.
 */
async function storeContracts(data, provider) {
  if (!data) return;

  const tasks = Object.values(data).map(async (item) => {
    if (item.type === 'pair') {
      await storeNewPairs(item, provider);
    } else {
      await storeNewContracts(item);
    }
  });

  await Promise.all(tasks);
  return true;
}

/**
 * Handles storing trading data; checks the state of each contract as trades occur.
 */
async function storeTrading(tradeInfo, chain, provider) {
  if (!tradeInfo) return;

  for (const [key] of Object.entries(tradeInfo)) {
    if (Object.keys(tradeInfo[key]).length > 0) {
      // "in" events
      for (const [id] of Object.entries(tradeInfo[key].in)) {
        await checkStatusContract(
          id,
          chain,
          provider,
          tradeInfo[key].block,
          tradeInfo[key].in[id].nounce,
          'in',
          tradeInfo[key]
        );
      }
      // "out" events
      for (const [id] of Object.entries(tradeInfo[key].out)) {
        await checkStatusContract(
          id,
          chain,
          provider,
          tradeInfo[key].block,
          tradeInfo[key].out[id].nounce,
          'out',
          tradeInfo[key]
        );
      }
      // You can uncomment if you need to do something with trading announcements
      // await anounceTrading({ chain, data: tradeInfo });
    }
  }
}

/**
 * Checks the status of a contract at trade time, updates if it is newly launched, or if it has rugged.
 */
async function checkStatusContract(contractAddress, chain, provider, blockNumber, nounce, type, swapInfo) {
  if (!contractAddress) return;

  const ContractModel = chainContractModel[chain];
  if (!ContractModel) {
    console.error(`No contract model found for chain: ${chain}`);
    return;
  }

  try {
    const mainToken = await ContractModel.findOne({ contractAddress });
    if (!mainToken || mainToken.isRug) return;

    const liveDataToken = await checkToken(mainToken.contractAddress, chain, provider);
    if (!liveDataToken || liveDataToken === false) return;

    let shouldAnnounce = false;
    const nowTimestamp = Math.floor(Date.now() / 1000);

    // Set initial MC if not yet set
    if (mainToken.statistics.initialMc === 0 && liveDataToken.info.mcap > 0) {
      mainToken.statistics.initialMc = liveDataToken.info.mcap;
    }

    // Update base stats
    mainToken.limits.buytax = liveDataToken.buyTax;
    mainToken.limits.selltax = liveDataToken.sellTax;
    mainToken.limits.transfertax = liveDataToken.transferTax;
    mainToken.trading.buy = liveDataToken.trading.buyEnabled;
    mainToken.trading.sell = liveDataToken.trading.sellEnabled;
    mainToken.statistics.price = liveDataToken.info.priceToken;
    mainToken.statistics.marketcap = liveDataToken.info.mcap;
    mainToken.statistics.burned = parseFloat(liveDataToken.burned.split('%')[0]);

    // Update ATH
    if (mainToken.statistics.ath < liveDataToken.info.mcap) {
      mainToken.statistics.ath = liveDataToken.info.mcap;
    }

    // If not launched, check if it meets launch conditions
    if (!mainToken.launched.status) {
      mainToken.updatePost = true;
      if (liveDataToken.pairInfo.balToken > 0 && liveDataToken.pairInfo.balCurrency > 0) {
        mainToken.launched.status = true;
        mainToken.launched.block = blockNumber;
        mainToken.launched.timestamp = nowTimestamp;
      }
      shouldAnnounce = true;
    } else {
      // If launched, check if token has rugged
      if (
        parseFloat(liveDataToken.pairInfo.balToken) < 0.1 ||
        parseFloat(liveDataToken.pairInfo.balCurrency) < 0.1
      ) {
        mainToken.isRug = true;
      }
    }

    // If launched, update timed stats
    if (mainToken.launched.status && mainToken.launched.timestamp > 0) {
      const startTime = mainToken.launched.timestamp;
      const currentMcap = liveDataToken.info.mcap;
      const initialMcap = mainToken.statistics.initialMc;
      const timedIntervals = [
        { key: 'five_min', seconds: 300 },
        { key: 'thirty_min', seconds: 1800 },
        { key: 'sixty_min', seconds: 3600 },
        { key: 'six_hours', seconds: 21600 },
        { key: 'twelve_hours', seconds: 43200 },
        { key: 'twenty_four_hours', seconds: 86400 },
      ];

      timedIntervals.forEach(({ key, seconds }) => {
        if (
          mainToken.statistics[key].ath === 0 &&
          nowTimestamp > startTime + seconds &&
          initialMcap > 0
        ) {
          mainToken.statistics[key].ath = mainToken.statistics.ath;
          mainToken.statistics[key].mcap = currentMcap;
          mainToken.statistics[key].growth = parseFloat(
            (currentMcap / initialMcap) * 100 - 100
          ).toFixed(0);
          shouldAnnounce = true;
        }
      });

      // If trade is 'in' and nounce < 100, it counts as fresh wallet
     /*  if (type === 'in' && nounce !== undefined && nounce !== null && nounce < 100) {
        mainToken.statistics.block1supply.freshWallets += 1;
        await sendInfoToFreshTracker({
          chain,
          data: mainToken,
          swap: swapInfo,
        });
      } */
    }

    // Announce post if something changed
    if (shouldAnnounce) {
      await anouncePost({ chain, data: mainToken });
    }

    await mainToken.save();
  } catch (e) {
    console.error('Error in checkStatusContract:', e);
  }
}

/**
 * Stores volume information.
 */
async function storeVolume(contractInfo, chain) {
  if (!contractInfo) return false;

  const VolumeModel = chainVolumeModel[chain];
  if (!VolumeModel) {
    console.error(`No volume model found for chain: ${chain}`);
    return false;
  }

  try {
    const newVolume = new VolumeModel(contractInfo);
    await newVolume.save();
    return true;
  } catch (error) {
    //console.error('Error in storeVolume:', error);
    return false;
  }
}

module.exports = {
  storeContracts,
  storeTrading,
  storeVolume,
};
