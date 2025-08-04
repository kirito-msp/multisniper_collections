/**
 * worker.js — Improved & Optimized
 */

const mongoose = require('mongoose');
const { ethers } = require('ethers');
const config = require('../config.json');
const tokenInfoABI = require('../abis/tokenInfo.json');
const pkg = require('evm');
const CryptoJS = require("crypto-js");
const { EVM } = pkg;
const ContractModel = require('../models/BscContract');
const WalletModel = require('../models/BscWallet');
const VolumeModel = require('../models/BscVolume');
const { checkToken } = require('./tokenInfo');
const { storeContracts, storeTrading, storeVolume } = require('./store');
const { extractData } = require('./extract');
const { zoraPost } = require('./zoraTgPost');
const axios = require('axios');
const { parentPort } = require('worker_threads');

// ===============================
// GLOBALS & CONFIG
// ===============================

const mongoUri = `mongodb://${config.mongodb.user}:${encodeURIComponent(config.mongodb.password)}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}?authSource=multiChainApi`;

mongoose.connect(mongoUri).catch(err => {
  console.error('MongoDB connection error:', err);
});

// For chain mapping: bsc=1, eth=2, base=3, avax=4, sonic=5
let thisChain = 1;

// Main events of interest
const EVENTS = {
  // PairCreated (Uniswap V2 etc.)
  "0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9": {
    abi: "event PairCreated(address indexed token0, address indexed token1, address pair, uint)"
  },
  // PoolCreated (Uniswap V3 etc.)
  "0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118": {
    abi: "event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)"
  },
  // LBPairCreated (TraderJoe V2, etc.)
  "0x2c8d104b27c6b7f4492017a6f5cf3803043688934ebcaa6a03540beeaf976aff": {
    abi: "event LBPairCreated(address indexed tokenX, address indexed tokenY, uint256 indexed binStep, address LBPair, uint256 pid)"
  },
  // Transfer
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": {
    abi: "event Transfer(address indexed from, address indexed to, uint256 value)"
  },
  // Deposit
  "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c": {
    abi: "event Deposit(address indexed dst, uint wad)"
  },
  // Withdrawal
  "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65": {
    abi: "event Withdrawal(address indexed src, uint wad)"
  },
  // TokenCreated
  "0xdae899a394233ea0635e48cfc12126491c770b57e2ea82e0aaf258e023584dee": {
    abi: "event TokenCreated(address tokenAddress, uint256 lpNftId, address deployer, string name, string symbol, uint256 supply, address recipient, uint256 recipientAmount)"
  },
  // CoinCreated 
  "0x3d1462491f7fa8396808c230d95c3fa60fd09ef59506d0b9bd1cf072d2a03f56": {
    abi: "event CoinCreated(address indexed caller, address indexed payoutRecipient, address indexed platformReferrer, address currency, string uri, string name, string symbol, address coin, address pool, string version)"
  }
};



// ABIs for name/symbol in string or bytes32 form
const tokenInfoABIString = [
  { constant: true, inputs: [], name: "name", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
  { constant: true, inputs: [], name: "symbol", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
  { constant: true, inputs: [], name: "decimals", outputs: [{ name: "", type: "uint8" }], stateMutability: "view", type: "function" },
  { constant: true, inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
];
const tokenInfoABIBytes32 = [
  { constant: true, inputs: [], name: "name", outputs: [{ name: "", type: "bytes32" }], stateMutability: "view", type: "function" },
  { constant: true, inputs: [], name: "symbol", outputs: [{ name: "", type: "bytes32" }], stateMutability: "view", type: "function" },
  { constant: true, inputs: [], name: "decimals", outputs: [{ name: "", type: "uint8" }], stateMutability: "view", type: "function" },
  { constant: true, inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
];

// ===============================
// HELPER FUNCTIONS
// ===============================

/**
 * Minimally store the contract if it doesn't already exist
 */
async function storeContract(contractInfo) {
  if (!contractInfo) return;
  try {
    const exists = await ContractModel.findOne({ contractAddress: contractInfo.contractAddress });
    if (exists) return;

    const newDoc = new ContractModel(contractInfo);
    await newDoc.save();
  } catch (err) {
    console.error('storeContract error:', err.message);
  }
}

/**
 * Attempt to fetch name/symbol/decimals/totalSupply in two ways:
 *  1) Standard string
 *  2) bytes32 fallback
 */
async function fetchInfo(contractAddress, fnName, provider) {
  try {
    const cString = new ethers.Contract(contractAddress, tokenInfoABIString, provider);
    return await cString[fnName]();
  } catch {
    // fallback
    try {
      const cBytes32 = new ethers.Contract(contractAddress, tokenInfoABIBytes32, provider);
      const result = await cBytes32[fnName]();
      return ethers.utils.parseBytes32String(result);
    } catch {
      return "unknown";
    }
  }
}

/**
 * Get name/symbol/decimals/totalSupply for a contract
 */
async function getContractInfo(contractAddress, provider) {
  let name = await fetchInfo(contractAddress, "name", provider);
  let symbol = await fetchInfo(contractAddress, "symbol", provider);

  let decimals = 0, totalSupply = "0";
  try {
    // Attempt with string-based ABI
    const cString = new ethers.Contract(contractAddress, tokenInfoABIString, provider);
    decimals = await cString.decimals();
    totalSupply = (await cString.totalSupply()).toString();
  } catch {
    // fallback: bytes32-based
    try {
      const cBytes32 = new ethers.Contract(contractAddress, tokenInfoABIBytes32, provider);
      decimals = await cBytes32.decimals();
      totalSupply = (await cBytes32.totalSupply()).toString();
    } catch {
      // ignore
    }
  }

  // if name or symbol is unknown, reuse the other if known
  if (symbol === "unknown" && name !== "unknown") symbol = name;
  if (name === "unknown" && symbol !== "unknown") name = symbol;

  return { name, symbol, decimals, totalSupply };
}

/**
 * Generate a unique code from EVM bytecode features, to store "hashCode"
 */
function generateHashCode(bytecode) {
  try {
    const evm = new EVM(bytecode);
    const fns = evm.getFunctions();
    const evs = evm.getEvents();
    const ops = evm.getOpcodes();
    let uniqueId = fns + evs + ops;
    uniqueId = CryptoJS.SHA256(uniqueId).toString().substring(0, 10);
    return `#${uniqueId}`;
  } catch {
    return "#unknown";
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

/**
 * Convert partial volume record to a sanitized object
 */
function sanitizeTrade(trade) {
  return {
    tokenAddress: trade.tokenAddress,
    total: isNaN(trade.total) ? 0 : trade.total,
    buys: isNaN(trade.buys) ? 0 : trade.buys,
    buyVol: isNaN(trade.buyVol) ? 0 : trade.buyVol,
    sells: isNaN(trade.sells) ? 0 : trade.sells,
    sellVol: isNaN(trade.sellVol) ? 0 : trade.sellVol,
  };
}

/**
 * Set a time limit on processing a block
 */
function timeoutPromise(ms, errorMsg) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(errorMsg)), ms);
  });
}

/**
 * The main function to parse a single block
 */
async function monitorBlock({ chain, blockNumber }, provider) {
  const block = await provider.getBlockWithTransactions(blockNumber);
 
  if (!block || block.transactions.length === 0) {
    console.log(`Empty or no TX block => ${blockNumber}`);
    return `Block ${blockNumber} on chain ${chain} processed (empty)`;
  }

  // Structures to store intermediate data
  const blockDataVolume = { [block.timestamp]: {} };
  const blockDataTrades = {};
  const blockDataContracts = {};
  const contractCache = {}; // like contractInfo

  // Process each transaction in the block
  for (const tx of block.transactions) {
    let receipt;
    try {
      receipt = await provider.getTransactionReceipt(tx.hash);
    } catch {
      continue; // skip if cannot get receipt
    }
    if (!receipt || receipt.status !== 1) continue; // skip failed TX

    // If there's a contract creation
    if (receipt.contractAddress) {
      if (!contractCache[receipt.contractAddress]) {
        // Check token info
        const info = await checkToken(receipt.contractAddress, thisChain, provider);
        if (info && info.name !== "unknown" && info.symbol !== "unknown") {
          contractCache[receipt.contractAddress] = info;
        }
      }

      if (!blockDataContracts[receipt.contractAddress] && contractCache[receipt.contractAddress]) {
        const infoData = contractCache[receipt.contractAddress];
        const doc = {
          chain: thisChain,
          type: "token",
          contractAddress: receipt.contractAddress,
          contractDeployer: receipt.from,
          txHash: tx.hash,
          block: tx.blockNumber,
          timestamp: block.timestamp,
          info: infoData,
          limits: {},
        };

        // If it has a normal name/symbol, attempt an extract
        if (infoData.name && infoData.name !== "unknown" && infoData.symbol && infoData.symbol !== "unknown") {
          doc.limits = await extractData(doc, provider);
        } else {
          // If it's a nonsense contract, skip
          delete doc.limits;
        }
        blockDataContracts[receipt.contractAddress] = doc;
      }
    }

    // We'll keep track of a single "transferInfo" object for one TX
    let transferInfo = {
      type: "none",
      from: receipt.from,
      in: {},
      out: {},
      txHash: tx.hash,
      block: blockNumber,
      timestamp: block.timestamp,
    };

    // If the user sent raw native tokens (e.g. BNB/ETH) with empty data
    if (tx.data === "0x") {
      const val = parseFloat(ethers.utils.formatEther(tx.value));
      if (val > 0) {
        // treat it as a simple Transfer
        transferInfo.type = "Transfer";
        transferInfo.out["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"] = {
          token: "ETH",
          from: tx.from,
          to: tx.to,
          value: val,
        };
      }
    }

    // Loop logs to catch events
    if (receipt.logs && receipt.logs.length > 0) {
      for (const lg of receipt.logs) {
        const evHash = lg.topics[0]?.toLowerCase();
        if (!evHash) continue;
        const evMeta = EVENTS[evHash];
        if (!evMeta) continue; // skip unknown

        try {
          const iface = new ethers.utils.Interface([evMeta.abi]);
          const decoded = iface.parseLog(lg);

          if (evHash === "0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9") {
            // PairCreated
            const { token0, token1, pair } = decoded.args;
            if (!blockDataContracts[pair]) {
              // Check & cache token info
              if (!contractCache[token0]) {
                contractCache[token0] = await checkToken(token0, thisChain, provider);
              }
              if (!contractCache[token1]) {
                contractCache[token1] = await checkToken(token1, thisChain, provider);
              }
              const t0 = contractCache[token0], t1 = contractCache[token1];
              const cA = new ethers.Contract(token0, tokenInfoABI, provider);
              const cB = new ethers.Contract(token1, tokenInfoABI, provider);

              let bal0 = "0", bal1 = "0";
              try {
                bal0 = await cA.balanceOf(pair);
              } catch {}
              try {
                bal1 = await cB.balanceOf(pair);
              } catch {}

              blockDataContracts[pair] = {
                type: "pair",
                chain: thisChain,
                pairAddress: pair,
                token0,
                infoToken0: t0,
                balToken0: parseFloat(ethers.utils.formatUnits(bal0, t0?.decimals || 18)).toFixed(t0?.decimals || 18),
                token1,
                infoToken1: t1,
                balToken1: parseFloat(ethers.utils.formatUnits(bal1, t1?.decimals || 18)).toFixed(t1?.decimals || 18),
                txHash: tx.hash,
                block: tx.blockNumber,
                timestamp: block.timestamp,
              };
            }
          } else if (evHash === "0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118") {
            // PoolCreated
            const { token0, token1, pool } = decoded.args;
            if (!blockDataContracts[pool]) {
              if (!contractCache[token0]) {
                contractCache[token0] = await checkToken(token0, thisChain, provider);
              }
              if (!contractCache[token1]) {
                contractCache[token1] = await checkToken(token1, thisChain, provider);
              }
              const t0 = contractCache[token0], t1 = contractCache[token1];
              const cA = new ethers.Contract(token0, tokenInfoABI, provider);
              const cB = new ethers.Contract(token1, tokenInfoABI, provider);

              let bal0 = "0", bal1 = "0";
              try {
                bal0 = await cA.balanceOf(pool);
              } catch {}
              try {
                bal1 = await cB.balanceOf(pool);
              } catch {}

              blockDataContracts[pool] = {
                type: "pair",
                chain: thisChain,
                pairAddress: pool,
                token0,
                infoToken0: t0,
                balToken0: parseFloat(ethers.utils.formatUnits(bal0, t0?.decimals || 18)).toFixed(t0?.decimals || 18),
                token1,
                infoToken1: t1,
                balToken1: parseFloat(ethers.utils.formatUnits(bal1, t1?.decimals || 18)).toFixed(t1?.decimals || 18),
                txHash: tx.hash,
                block: tx.blockNumber,
                timestamp: block.timestamp,
              };
            }
          } else if (evHash === "0x2c8d104b27c6b7f4492017a6f5cf3803043688934ebcaa6a03540beeaf976aff") {
            // LBPairCreated
            const { tokenX, tokenY, LBPair } = decoded.args;
            if (!blockDataContracts[LBPair]) {
              if (!contractCache[tokenX]) {
                contractCache[tokenX] = await checkToken(tokenX, thisChain, provider);
              }
              if (!contractCache[tokenY]) {
                contractCache[tokenY] = await checkToken(tokenY, thisChain, provider);
              }
              const tX = contractCache[tokenX], tY = contractCache[tokenY];
              const cA = new ethers.Contract(tokenX, tokenInfoABI, provider);
              const cB = new ethers.Contract(tokenY, tokenInfoABI, provider);

              let balX = "0", balY = "0";
              try {
                balX = await cA.balanceOf(LBPair);
              } catch {}
              try {
                balY = await cB.balanceOf(LBPair);
              } catch {}

              blockDataContracts[LBPair] = {
                type: "pair",
                chain: thisChain,
                pairAddress: LBPair,
                token0: tokenX,
                infoToken0: tX,
                balToken0: parseFloat(ethers.utils.formatUnits(balX, tX?.decimals || 18)).toFixed(tX?.decimals || 18),
                token1: tokenY,
                infoToken1: tY,
                balToken1: parseFloat(ethers.utils.formatUnits(balY, tY?.decimals || 18)).toFixed(tY?.decimals || 18),
                txHash: tx.hash,
                block: tx.blockNumber,
                timestamp: block.timestamp,
              };
            }
          } else if (evHash === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
            // Transfer
            const { from, to, value } = decoded.args;
            // We only mark "in" or "out" if (receipt.from === from) or (receipt.from === to)
            if (receipt.from.toLowerCase() === from.toLowerCase()) {
              // => We are sending some tokens out
              if (!transferInfo.out[lg.address]) {
                const infoCa = await _fetchCachedToken(contractCache, lg.address, provider);
                if (infoCa?.listed) {
                  const val = parseFloat(ethers.utils.formatUnits(value, infoCa.decimals)).toFixed(infoCa.decimals);
                  transferInfo.out[lg.address] = {
                    token: infoCa.symbol,
                    from,
                    to,
                    value: parseFloat(val),
                    usdValue: _calcUsdValue(val, infoCa.info?.priceToken),
                    mcap: infoCa.info?.mcap,
                    price: infoCa.info?.priceToken,
                    nounce: tx.nonce,
                  };
                }
              }
            }
            if (receipt.from.toLowerCase() === to.toLowerCase()) {
              // => We are receiving some tokens in
              if (!transferInfo.in[lg.address]) {
                const infoCa = await _fetchCachedToken(contractCache, lg.address, provider);
                if (infoCa?.listed) {
                  const val = parseFloat(ethers.utils.formatUnits(value, infoCa.decimals)).toFixed(infoCa.decimals);
                  transferInfo.in[lg.address] = {
                    token: infoCa.symbol,
                    from,
                    to,
                    value: parseFloat(val),
                    usdValue: _calcUsdValue(val, infoCa.info?.priceToken),
                    mcap: infoCa.info?.mcap,
                    price: infoCa.info?.priceToken,
                    nounce: tx.nonce,
                  };
                }
              }
            }
          } else if (evHash === "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c") {
            // Deposit
            const { dst, wad } = decoded.args;
            if (!transferInfo.out[lg.address]) {
              const infoCa = await _fetchCachedToken(contractCache, lg.address, provider);
              if (infoCa?.listed) {
                const val = parseFloat(ethers.utils.formatUnits(wad, infoCa.decimals)).toFixed(infoCa.decimals);
                transferInfo.out[lg.address] = {
                  token: infoCa.symbol,
                  from: receipt.from,
                  to: receipt.to,
                  value: parseFloat(val),
                  usdValue: _calcUsdValue(val, infoCa.info?.priceToken),
                  mcap: infoCa.info?.mcap,
                  price: infoCa.info?.priceToken,
                  nounce: tx.nonce,
                };
              }
            }
          } else if (evHash === "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65") {
            // Withdrawal
            const { src, wad } = decoded.args;
            if (!transferInfo.in[lg.address]) {
              const infoCa = await _fetchCachedToken(contractCache, lg.address, provider);
              if (infoCa?.listed) {
                const val = parseFloat(ethers.utils.formatUnits(wad, infoCa.decimals)).toFixed(infoCa.decimals);
                transferInfo.in[lg.address] = {
                  token: infoCa.symbol,
                  from: receipt.to,
                  to: receipt.from,
                  value: parseFloat(val),
                  usdValue: _calcUsdValue(val, infoCa.info?.priceToken),
                  mcap: infoCa.info?.mcap,
                  price: infoCa.info?.priceToken,
                  nounce: tx.nonce,
                };
              }
            }
          } else if (evHash === "0xdae899a394233ea0635e48cfc12126491c770b57e2ea82e0aaf258e023584dee")  {
            try{
              const { tokenAddress } = decoded.args;
              if (tokenAddress) {
                console.log("New Type: " + tokenAddress)
                if (!contractCache[tokenAddress]) {
                  // Check token info
                  const info = await checkToken(tokenAddress, thisChain, provider);
                  if (info && info.name !== "unknown" && info.symbol !== "unknown") {
                    contractCache[tokenAddress] = info;
                  }
                }
          
                if (!blockDataContracts[tokenAddress] && contractCache[tokenAddress]) {
                  const infoData = contractCache[tokenAddress];
                  const doc = {
                    chain: thisChain,
                    type: "token",
                    contractAddress: tokenAddress,
                    contractDeployer: receipt.from,
                    txHash: tx.hash,
                    block: tx.blockNumber,
                    timestamp: block.timestamp,
                    info: infoData,
                    limits: {},
                  };
          
                  // If it has a normal name/symbol, attempt an extract
                  if (infoData.name && infoData.name !== "unknown" && infoData.symbol && infoData.symbol !== "unknown") {
                    doc.limits = await extractData(doc, provider);
                  } else {
                    // If it's a nonsense contract, skip
                    delete doc.limits;
                  }
                  blockDataContracts[tokenAddress] = doc;
                }
              }
            }catch(e){
              console.log(e)
            }
          } else if (evHash === "0x3d1462491f7fa8396808c230d95c3fa60fd09ef59506d0b9bd1cf072d2a03f56")  {
            try{
              const { coin, caller } = decoded.args;
              if (coin) {
                //console.log("New Zora: " + coin)
                if (!contractCache[coin]) {
                  // Check token info
                  const info = await checkToken(coin, thisChain, provider);
                  if (info && info.name !== "unknown" && info.symbol !== "unknown") {
                    contractCache[coin] = info;
                  }
                }
          
                if (!blockDataContracts[coin] && contractCache[coin]) {
                  const infoData = contractCache[coin];
                  const doc = {
                    chain: thisChain,
                    type: "token",
                    contractAddress: coin,
                    contractDeployer: caller,
                    txHash: tx.hash,
                    block: tx.blockNumber,
                    timestamp: block.timestamp,
                    info: infoData,
                    limits: {},
                    zora: true
                  };
                 
                  // If it has a normal name/symbol, attempt an extract
                  if (infoData.name && infoData.name !== "unknown" && infoData.symbol && infoData.symbol !== "unknown") {
                    doc.limits = await extractData(doc, provider);
                  } else {
                    // If it's a nonsense contract, skip
                    delete doc.limits;
                  }
                  zoraPost(doc)
                  blockDataContracts[coin] = doc;
                }
              }
            }catch(e){
              console.log(e)
            }
          }
        } catch (parseErr) {
         // console.log(parseErr)
        }
      } // end-for logs
    }

    // If we discovered that the TX is a "Swap"
    if (
      Object.keys(transferInfo.in).length > 0 &&
      Object.keys(transferInfo.out).length > 0
    ) {
      transferInfo.type = "Swap";
    } else if (
      (Object.keys(transferInfo.in).length > 0 || Object.keys(transferInfo.out).length > 0) &&
      transferInfo.type === "none"
    ) {
      transferInfo.type = "Transfer";
    }

    // If it's a swap, record into blockDataVolume & blockDataTrades
    if (transferInfo.type === "Swap") {
      blockDataTrades[transferInfo.txHash] = transferInfo;

      // Update volume stats for "in" => buys
      for (const t of Object.keys(transferInfo.in)) {
        const usdVal = transferInfo.in[t].usdValue;
        if (!blockDataVolume[block.timestamp][t]) {
          blockDataVolume[block.timestamp][t] = {
            total: usdVal,
            buys: 1,
            buyVol: usdVal,
            sells: 0,
            sellVol: 0,
          };
        } else {
          const vol = blockDataVolume[block.timestamp][t];
          vol.total += usdVal;
          vol.buys += 1;
          vol.buyVol += usdVal;
        }
      }
      // Update volume stats for "out" => sells
      for (const t of Object.keys(transferInfo.out)) {
        const usdVal = transferInfo.out[t].usdValue;
        if (!blockDataVolume[block.timestamp][t]) {
          blockDataVolume[block.timestamp][t] = {
            total: usdVal,
            buys: 0,
            buyVol: 0,
            sells: 1,
            sellVol: usdVal,
          };
        } else {
          const vol = blockDataVolume[block.timestamp][t];
          vol.total += usdVal;
          vol.sells += 1;
          vol.sellVol += usdVal;
        }
      }
    }
  } // end-for transactions

  // Dispatch blockDataContracts to watchers
  if (Object.keys(blockDataContracts).length > 0) {
    const watchData = { chain, type: "blockDataContracts", data: blockDataContracts };
    sendDataToWebSocketClients(watchData);
    // Store them in DB
    storeContracts(blockDataContracts, provider);
  }

  // Store volumes
  for (const [ts, tokens] of Object.entries(blockDataVolume)) {
    if (Object.keys(tokens).length > 0) {
      const tradesArray = Object.keys(tokens).map(tokenAddress => {
        const item = tokens[tokenAddress];
        return sanitizeTrade({ tokenAddress, ...item });
      });
      const dataVolume = {
        block: blockNumber,
        timestamp: ts,
        trades: tradesArray,
      };
      storeVolume(dataVolume, thisChain);
    }
  }

  // Dispatch blockDataTrades to watchers
  if (Object.keys(blockDataTrades).length > 0) {
    const watchData = { chain, type: "blockDataTrades", data: blockDataTrades };
    sendDataToWebSocketClients(watchData);
    storeTrading(blockDataTrades, thisChain, provider);
  }

  return `Block ${blockNumber} on chain ${chain} processed by worker ${process.pid}`;
}

/**
 * The main function that the worker calls when it receives a block message
 */
async function processBlock(message) {
  const { chain, blockNumber, wsUrl } = message;
  const provider = new ethers.providers.WebSocketProvider(wsUrl);

  try {
    const result = await Promise.race([
      monitorBlock(message, provider),
      timeoutPromise(60000, `Timeout processing block ${blockNumber} on chain ${chain}`)
    ]);
    return result;
  } catch (err) {
    console.error("processBlock error:", err);
    throw err;
  }
}

// ===============================
// WORKER EVENT LISTENER
// ===============================
parentPort.on('message', async (message) => {
  // Convert chain name => numeric ID
  switch (message.chain) {
    case "bsc":      thisChain = 1; break;
    case "ethereum": thisChain = 2; break;
    case "base":     thisChain = 3; break;
    case "avax":     thisChain = 4; break;
    case "sonic":    thisChain = 5; break;
    default:         thisChain = 6; break;
  }

  if (thisChain < 6) {
    try {
      const result = await processBlock(message);
      parentPort.postMessage({ result, chain: message.chain, blockNumber: message.blockNumber });
    } catch (error) {
      console.log('Worker received message:', message);
      parentPort.postMessage({ error: error.toString(), chain: message.chain, blockNumber: message.blockNumber });
    }
  } else {
    // Unknown chain => skip
    const result = `Block ${message.blockNumber} on chain ${message.chain} processed by worker ${process.pid} (skipped)`;
    parentPort.postMessage({ result, chain: message.chain, blockNumber: message.blockNumber });
  }
});

// ===============================
// OPTIONAL: CLEANUP
// ===============================
async function cleanupOldRecords() {
  try {
    const recordCount = await ContractModel.countDocuments();
    if (recordCount === 0) return;

    const sixMonthsAgo = Math.floor(Date.now() / 1000) - (6 * 30 * 24 * 3600);
    const oldRecords = await ContractModel.find({ timestamp: { $lt: sixMonthsAgo } });

    if (oldRecords.length > 0) {
      const result = await ContractModel.deleteMany({ timestamp: { $lt: sixMonthsAgo } });
      console.log(`Removed ${result.deletedCount} contracts older than 6 months.`);
    }
  } catch (err) {
    console.error("Error cleaning old records:", err.message);
  }
}

// ===============================
// INTERNAL UTILS
// ===============================

/** 
 * Pull from local cache if present, otherwise checkToken from remote.
 */
async function _fetchCachedToken(cache, address, provider) {
  if (!cache[address]) {
    cache[address] = await checkToken(address, thisChain, provider);
  }
  return cache[address];
}

/**
 * Convert a numeric value + price into USD
 */
function _calcUsdValue(value, priceToken) {
  if (!priceToken || isNaN(priceToken)) return 0;
  return parseFloat((parseFloat(value) * parseFloat(priceToken)).toFixed(6));
}
