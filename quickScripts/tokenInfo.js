const { ethers, providers, Contract } = require('ethers');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });
const { BigNumber, constants, utils } = ethers;
// Load your token ABI and the address book (address-book2 structure)
const tokenInfoABI = require('./assets/abis/tokenInfo.json');
const addressBook = require('./assets/address-book'); // contains bsc, eth, polygon, etc.
const { extra } = addressBook;

let testWallet = {
  address: "0x55d32ceC588866ECA004eC1EEfCa0297b9108c88",
  privateKey: "65041583054f776720bb3a80c82b0c387325b86655d5cba3f8bc11d2607cdaf7"
}

// Your WebSocket endpoints (or use HTTP endpoints as needed)
const providersWss = {
  bsc: process.env.nodeBsc,
  eth: process.env.nodeEth,
  base: process.env.nodeBase,
  avax: process.env.nodeAvax
};

/**
 * InfoRouters mapping: each chain key points to a contract that exposes getEthPrice().
 */
const infoRouters = {
  bsc: '0xb92bdf25f69497842b0C94371627b1e9C68349d7',
  eth: '0x9df6A715D0db471DDf22de988c5f3ED6bAA96745',
  base: '0x17380Ffb1A64B4933E2A76d64D0a38e30fF87a20',
  avax: '0xf5D6cFaE0cBDCa942b434Ad2159b2974b82c6e0a',
};

const swapRouters = {
  bsc: '0xD22447B63c303377bAeEbe042dcbDa75d27a9a48', //OK
  eth: '0x137e87EfA00C8450C689584111D4744Eb00cDe8f',
  base: '0x24061dD6406E9DECff6A55C39c7384700166866f', 
  avax: '0xf6dc62F8d19F25df9F87889055B1f53aE6596B78',
};


// ABI for getEthPrice function.
const getEthPriceAbi = ['function getEthPrice() external view returns (uint256)'];

// Minimal ABI for a Uniswap‑V3 pool that includes slot0() and token0().
const V3_POOL_ABI = [
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function token0() external view returns (address)"
];

// Minimal ABI for interacting with a factory to get a V2 pair.
const FACTORY_PAIR_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)"
];

// Minimal ABI for interacting with a factory to get a V3 pool.
const FACTORY_POOL_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
];

// Minimal ERC20 ABI for balance queries.
const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)"
];

// Minimal UniswapV2 router ABI for getAmountsOut (used for testing V2 trading)
const UNISWAP_V2_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)"
];

/**
 * Returns a provider instance for the given chain key.
 */
function getProviderForChain(chain) {
  const nodeUrl = providersWss[chain];
  if (!nodeUrl) throw new Error(`No provider URL defined for chain: ${chain}`);
  return new providers.WebSocketProvider(nodeUrl);
}

/**
 * Returns the native currency address for a chain using the address book.
 */
function getNativeCurrencyAddress(chain) {
  let chainData = addressBook[chain];
  if (!chainData) throw new Error(`Chain ${chain} is not defined in the address book`);
  if (chain === 'bsc') return chainData.currency.BNB.address;
  if (chain === 'eth') return chainData.currency.ETH.address;
  if (chain === 'polygon') return chainData.currency.MATIC.address;
  if (chain === 'avax') return chainData.currency.AVAX.address;
  if (chain === 'base') return chainData.currency.ETH.address;
  if (chain === 'arbitrum') return chainData.currency.ETH.address;
  if (chain === 'blast') return chainData.currency.ETH.address;
  if (chain === 'sonic') return chainData.currency.SONIC.address;
  throw new Error(`Native currency for chain ${chain} not defined`);
}

function getDecimalsCurrencyAddress(chain,symbol) {
  let chainData = addressBook[chain];
  if (!chainData) throw new Error(`Chain ${chain} is not defined in the address book`);
  return chainData.currency[symbol].decimals; 
}

/**
 * Retrieves the ether price from the infoRouter for the given chain.
 *
 * @param {string} chain - The chain key.
 * @param {object} provider - ethers provider instance.
 * @returns {Promise<number>} The ether price.
 */
async function getEtherPrice(chain, provider) {
  const routerAddress = infoRouters[chain];
  if (!routerAddress) throw new Error(`No infoRouter defined for chain: ${chain}`);
  const infoRouter = new Contract(routerAddress, getEthPriceAbi, provider);
  let priceBN = await infoRouter.getEthPrice();
  if(chain == "avax"){
    priceBN = parseFloat(priceBN / 1000).toFixed(3)
  }
  return parseFloat(priceBN.toString());
}

/**
 * Retrieves the burned LP percentage for a given liquidity pair contract.
 * It checks the balance of the dead addresses and computes the percentage
 * relative to the total supply of the LP token.
 *
 * @param {object} provider - ethers provider instance.
 * @param {string} pairAddress - The LP token (liquidity pair) contract address.
 * @returns {Promise<number>} The burned percentage (e.g., 5 means 5% burned).
 */
async function getBurnedLPPercentage(provider, pairAddress) {
  try {
    const lpContract = new Contract(pairAddress, ERC20_ABI, provider);
    const totalSupplyBN = await lpContract.totalSupply();
    // Query the burned LP tokens from the defined dead and zero addresses.
    const deadBalanceBN = await lpContract.balanceOf(extra.dead);
    const zeroBalanceBN = await lpContract.balanceOf(extra.zero);
    const burnedLPBN = deadBalanceBN.add(zeroBalanceBN);
    // Calculate percentage = (burned / totalSupply) * 100
    const burnedPercentage = burnedLPBN.mul(100).div(totalSupplyBN);
    return parseFloat(burnedPercentage.toString());
  } catch (e) {
    // For pairs that don't support totalSupply (e.g. V3 pools), we just return 0.
    return 0;
  }
}

/**
 * Get all pairs (or pools) for the provided token on the given chain and for every currency in chainData.currency.
 *
 * @param {string} chain - The chain key (e.g., "bsc", "eth", etc.)
 * @param {string} tokenAddress - The token contract address.
 * @param {object} provider - ethers provider instance for the chain.
 * @returns {Promise<Array>} Array of objects with pair/pool details.
 */
async function getTokenPairs(chain, tokenAddress, provider) {
  let pairs = [];
  const chainData = addressBook[chain];
  if (!chainData || !chainData.dex || !chainData.currency) {
    throw new Error(`No DEX or currency configuration for chain: ${chain}`);
  }
  
  // Loop over every currency defined for the chain.
  let count = 0;
  for (const currencyKey in chainData.currency) {
    const currency = chainData.currency[currencyKey];
    const currencyAddress = currency.address;
    
    // Iterate over each DEX for this chain.
    for (const dexKey in chainData.dex) {
      const dex = chainData.dex[dexKey];
      try {
        // If a fee array is defined, assume a V3 pool.
        if (dex.fee && Array.isArray(dex.fee) && dex.fee.length > 0) {
          const factory = new Contract(dex.factory, FACTORY_POOL_ABI, provider);
          for (const fee of dex.fee) {
            try {
              const poolAddress = await factory.getPool(tokenAddress, currencyAddress, fee);            
              //process.exit(0)
              if (poolAddress && poolAddress !== extra.zero) {
                pairs.push({
                  dexName: dex.name,
                  dexKey,
                  fee,
                  currency: currencyKey,
                  currencyAddress,
                  pairAddress: poolAddress,
                  router: dex.router,
                  factory: dex.factory,
                  version: 'v3'
                });
              }
            } catch (innerErr) {
              console.error(`Error checking pool for ${dex.name} with fee ${fee} and currency ${currencyKey}:`, innerErr);
            }
          }
        } else {
          if(dex.hasFeePair == true && dex.fee == null){
            // Otherwise, assume a V2 pair.
            const factory = new Contract(dex.factory, [dex.pairFunctionAbi], provider);
            let isStable = false
            if(count > 0){
              isStable = true
            }
            const pairAddress = await factory.getPair(tokenAddress, currencyAddress, isStable);
            if (pairAddress && pairAddress !== extra.zero) {
              pairs.push({
                dexName: dex.name,
                dexKey,
                currency: currencyKey,
                currencyAddress,
                pairAddress,
                router: dex.router,
                factory: dex.factory,
                version: 'v2'
              });
            }
          }else{
            if(dex.name.includes("TraderJoeV2")){
              const factory = new Contract(dex.factory, [dex.pairFunctionAbi], provider);
              // Call getAllLBPairs with the token addresses
              const lbPairs = await factory.getAllLBPairs(tokenAddress, currencyAddress);
              // lbPairs is an array of tuples:
              // [ { binStep, LBPair, createdByOwner, ignoredForRouting }, ... ]
              // You can choose one pair (for example, the one with the lowest binStep or the first one)
              if (lbPairs.length > 0) {
                // For example, simply choose the first pair that has a nonzero LBPair address.
                for (const pairInfo of lbPairs) {
                  if (pairInfo.LBPair !== extra.zero) { 
                    pairs.push({
                      dexName: dex.name,
                      dexKey,
                      currency: currencyKey,
                      currencyAddress,
                      pairAddress: pairInfo.LBPair,
                      router: dex.router,
                      factory: dex.factory,
                      version: dex.name.includes("V2.1") ? "v2.1" : "v2.2",
                      // you might also want to store additional info (e.g. binStep)
                      binStep: pairInfo.binStep
                    });
                    break; // or collect all pairs if needed
                  }
                }
              }
            }else{
              // Otherwise, assume a V2 pair.
              const factory = new Contract(dex.factory, FACTORY_PAIR_ABI, provider);
              const pairAddress = await factory.getPair(tokenAddress, currencyAddress);              
              if (pairAddress && pairAddress !== extra.zero) {
                pairs.push({
                  dexName: dex.name,
                  dexKey,
                  currency: currencyKey,
                  currencyAddress,
                  pairAddress,
                  router: dex.router,
                  factory: dex.factory,
                  version: 'v2'
                });
              }
            }

          }        
        }
      } catch (e) {
        console.error(`Error checking pair/pool for ${dex.name} with currency ${currencyKey}:`, e);
      }
    }
    count++
  }

  return pairs;
}

/**
 * For a given pair/pool object, returns detailed liquidity info for the provided token by querying ERC20 balanceOf.
 *
 * @param {object} provider - ethers provider instance.
 * @param {object} pair - The pair object (including version, pairAddress, and currencyAddress).
 * @param {string} tokenAddress - The token address.
 * @param {number} tokenDecimals - Token decimals for formatting.
 * @param {number} currencyDecimals - Currency decimals for formatting (default is 18).
 * @returns {Promise<object>} An object { liquidity, tokenLP, currencyLP }.
 */
async function getPairLiquidity(provider, pair, tokenAddress, tokenDecimals, currencyDecimals) {
  try {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
    const currencyContract = new Contract(pair.currencyAddress, ERC20_ABI, provider);
    const tokenBalanceBN = await tokenContract.balanceOf(pair.pairAddress);
    const currencyBalanceBN = await currencyContract.balanceOf(pair.pairAddress);
    const tokenLP = parseFloat(ethers.utils.formatUnits(tokenBalanceBN, tokenDecimals));
    const currencyLP =  parseFloat(parseFloat(currencyBalanceBN / 10 **currencyDecimals).toFixed(currencyDecimals));
    return { liquidity: tokenLP, tokenLP, currencyLP };
  } catch (e) {
    console.error(`Error getting liquidity for pair ${pair.pairAddress}:`, e);
    return { liquidity: 0, tokenLP: 0, currencyLP: 0 };
  }
}

/**
 * Among all available pairs, returns the best pair for trading on the token.
 * "Best" is defined as the one with the highest token balance (tokenLP) in the pool.
 *
 * @param {string} chain - The chain key (e.g., "bsc").
 * @param {string} tokenAddress - The token contract address.
 * @param {number} tokenDecimals - Token decimals for formatting.
 * @param {object} provider - ethers provider instance for the chain.
 * @returns {Promise<object|null>} The best pair object (augmented with liquidity details) or null if none exists.
 */
async function getBestPair(chain, tokenAddress, tokenDecimals, provider) {
  const pairs = await getTokenPairs(chain, tokenAddress, provider);
  if (pairs.length === 0) return null;

  let bestPair = null;
  let bestLiquidity = 0;
  let currencyDecimals = 18;
  let hasPair = null
  for (const pair of pairs) { 
    currencyDecimals = getDecimalsCurrencyAddress(chain,pair.currency)
    const liqData = await getPairLiquidity(provider, pair, tokenAddress, tokenDecimals, currencyDecimals);
    pair.liquidity = liqData.liquidity;
    pair.tokenLP = liqData.tokenLP;
    pair.currencyLP = liqData.currencyLP;
    if (liqData.liquidity > bestLiquidity) {
      bestLiquidity = liqData.liquidity;
      bestPair = pair;
    }else{
      hasPair = pair
    }
  }

  if(bestPair == null && hasPair != null){
    bestPair = hasPair
  }

  return bestPair;
}

/**
 * Get token information (name, symbol, decimals, total supply, burned supply).
 * Also calculates the burned percentage (burned/totalSupply * 100) formatted to 2 decimals.
 *
 * @param {string} tokenAddress - The token contract address.
 * @param {object} provider - ethers provider instance.
 * @returns {Promise<object>} Token details object.
 */
async function getTokenInfo(tokenAddress, provider) {
    const tokenContract = new Contract(tokenAddress, tokenInfoABI, provider);
    
    // Retrieve name with error handling.
    let name;
    try {
      name = await tokenContract.name();
    } catch (err) {
      //console.error("Error getting name:", err);
      name = "Unknown";
    }
  
    // Retrieve symbol with error handling.
    let symbol;
    try {
      symbol = await tokenContract.symbol();
    } catch (err) {
      //console.error("Error getting symbol:", err);
      symbol = "Unknown";
    }
  
    // Retrieve decimals with error handling.
    let decimalsBN;
    try {
      decimalsBN = await tokenContract.decimals();
    } catch (err) {
      //console.error("Error getting decimals:", err);
      // Fallback to a default of 18 decimals if not available.
      decimalsBN = 18;
    }
    const decimals = Number(decimalsBN);
  
    // Retrieve totalSupply with error handling.
    let totalSupplyBN;
    try {
      totalSupplyBN = await tokenContract.totalSupply();
    } catch (err) {
      //console.error("Error getting totalSupply:", err);
      // Fallback to 0 if totalSupply method doesn't exist.
      totalSupplyBN = ethers.BigNumber.from("0");
    }
    const totalSupply = parseFloat(ethers.utils.formatUnits(totalSupplyBN, decimals));
  
    // Retrieve burned token balances from dead and zero addresses.
    let deadBalanceBN;
    try {
      deadBalanceBN = await tokenContract.balanceOf(extra.dead);
    } catch (err) {
      //console.error("Error getting dead balance:", err);
      deadBalanceBN = ethers.BigNumber.from("0");
    }
    let zeroBalanceBN;
    try {
      zeroBalanceBN = await tokenContract.balanceOf(extra.zero);
    } catch (err) {
      //console.error("Error getting zero balance:", err);
      zeroBalanceBN = ethers.BigNumber.from("0");
    }
    const burnedBN = deadBalanceBN.add(zeroBalanceBN);
    const burned = parseFloat(ethers.utils.formatUnits(burnedBN, decimals));
  
    // Calculate burned percentage safely.
    const burnedPercent = totalSupply ? ((burned / totalSupply) * 100).toFixed(2) : "0";
  
    return { name, symbol, decimals, totalSupply, burned, burnedPercent };
  }
  

/**
 * Main function to analyze a token.
 * It retrieves token details, gets the current ether price via the chain’s infoRouter,
 * then retrieves all pairs (for every currency) along with liquidity details and computes token price and market cap.
 *
 * For V2 pairs, the token price is derived from the balance ratio (multiplied by etherPrice if the pool’s currency is the native currency).
 * For V3 pools, the price is calculated from the pool’s slot0() data (using sqrtPriceX96).
 *
 * Market cap is computed as:
 *   marketCap = (totalSupply - burned) * tokenPrice,
 * where tokenPrice is derived as above.
 *
 * Additionally, for each pair (and the best pair) the percentage of burned LP tokens is calculated.
 * For V3 pairs (or any pair that does not support totalSupply), burnedLPPercent is set to 0.
 *
 * @param {string} chain - The chain key (e.g., "bsc", "eth", etc.).
 * @param {string} tokenAddress - The token contract address.
 * @returns {Promise<object>} An object containing token info, the best pair, and all pairs.
 */
async function analyzeToken(chain, tokenAddress) {
  try {
    let provider = getProviderForChain(chain)
    const tokenInfo = await getTokenInfo(tokenAddress, provider);
   
    const etherPrice = await getEtherPrice(chain, provider);

    // Define stablecoins (assumed to be 1:1 with USD).
    const stableCurrencies = ['USDT', 'USDt', 'BUSD', 'USDC', 'DAI'];
    // Get native currency symbol for this chain.
    const nativeCurrency = Object.keys(addressBook[chain].currency).find(
      key => addressBook[chain].currency[key].address.toLowerCase() === getNativeCurrencyAddress(chain).toLowerCase()
    );

    // Get all pairs and augment each with liquidity, token price, market cap and burned LP percentage.
    const allPairs = await getTokenPairs(chain, tokenAddress, provider);
    let currencyDecimals = 18;
    for (let pair of allPairs) {
      currencyDecimals = getDecimalsCurrencyAddress(chain,pair.currency)
      const liqData = await getPairLiquidity(provider, pair, tokenAddress, tokenInfo.decimals, currencyDecimals);
      pair.liquidity = Number(liqData.liquidity).toFixed(2);
      pair.tokenLP = Number(liqData.tokenLP).toFixed(2);
      pair.currencyLP = Number(liqData.currencyLP).toFixed(2);
      
      if (parseFloat(pair.tokenLP) > 0) {
        let tokenPrice;
        if (pair.version === 'v3') {
          const poolContract = new Contract(pair.pairAddress, V3_POOL_ABI, provider);
          const slot0 = await poolContract.slot0();
          const sqrtPriceX96 = slot0.sqrtPriceX96;
          const token0 = await poolContract.token0();
          const Q192 = Math.pow(2, 192);
          const sqrtPrice = parseFloat(sqrtPriceX96.toString());
          tokenPrice = (tokenAddress.toLowerCase() === token0.toLowerCase())
            ? (sqrtPrice * sqrtPrice) / Q192
            : Q192 / (sqrtPrice * sqrtPrice);
          if (nativeCurrency && pair.currency === nativeCurrency) {
            tokenPrice = tokenPrice * etherPrice;
          }
        } else if(pair.version == "v2.1" || pair.version == "v2.2"){         
          const activeBin = pair.activeBin ? pair.activeBin : 358;
          const multiplier = Math.pow(1 + (pair.binStep / 10000), activeBin);
          tokenPrice = (pair.currencyLP / pair.tokenLP) * etherPrice * multiplier;
        } else {
          if (nativeCurrency && pair.currency === nativeCurrency) {
            tokenPrice = (pair.currencyLP / pair.tokenLP) * etherPrice;
          } else if (stableCurrencies.includes(pair.currency)) {
            tokenPrice = pair.currencyLP / pair.tokenLP;
          } else {
            tokenPrice = (pair.currencyLP / pair.tokenLP) * etherPrice;
          }
        }
        pair.tokenPrice = tokenPrice;
        let marketCap = (tokenInfo.totalSupply - tokenInfo.burned) * tokenPrice;
        pair.marketCap = Number(marketCap.toFixed(0)).toLocaleString();
      } else {
        pair.tokenPrice = 0;
        pair.marketCap = "0";
      }

      // Only calculate burnedLPPercent for V2 pairs.
      if (pair.version != 'v3') {
        pair.burnedLPPercent = await getBurnedLPPercentage(provider, pair.pairAddress);
      } else {
        pair.burnedLPPercent = 0;
      }
    }
    
    // Choose best pair based on highest tokenLP.
    let bestPair = await getBestPair(chain, tokenAddress, tokenInfo.decimals, provider);
   
    if (bestPair) {
      let currencyDecimals = getDecimalsCurrencyAddress(chain,bestPair.currency)
      const liqData = await getPairLiquidity(provider, bestPair, tokenAddress, tokenInfo.decimals, currencyDecimals);
      bestPair.liquidity = Number(liqData.liquidity).toFixed(2);
     
      bestPair.tokenLP = Number(liqData.tokenLP).toFixed(2);
      bestPair.currencyLP = Number(liqData.currencyLP).toFixed(2);
      if (parseFloat(bestPair.tokenLP) > 0) {
        let tokenPrice;
        if (bestPair.version === 'v3') {
          const poolContract = new Contract(bestPair.pairAddress, V3_POOL_ABI, provider);
          const slot0 = await poolContract.slot0();
          //const sqrtPriceX96 = slot0.sqrtPriceX96;
          const token0 = await poolContract.token0();
          const Q192 = BigNumber.from(2).pow(192);
          const sqrtPrice = slot0.sqrtPriceX96;
          
          if (tokenAddress.toLowerCase() === token0.toLowerCase()) {
            // Price = (sqrtPriceX96^2) / 2^192
            tokenPrice = sqrtPrice.mul(sqrtPrice)
              .mul(constants.WeiPerEther) // scale by 1e18 for precision
              .div(Q192);
              tokenPrice = parseFloat(tokenPrice / 10 ** currencyDecimals)
          } else {
            // Otherwise, price = 2^192 / (sqrtPriceX96^2)
            tokenPrice = Q192.mul(constants.WeiPerEther)
              .div(sqrtPrice.mul(sqrtPrice));
              tokenPrice = parseFloat(tokenPrice / 10 ** currencyDecimals)
          }       
          if (nativeCurrency && bestPair.currency === nativeCurrency) {
            tokenPrice = tokenPrice * etherPrice;           
          }
         
        } else if(bestPair.version == "v2.1" || bestPair.version == "v2.2"){         
          const activeBin = bestPair.activeBin ? bestPair.activeBin : 358;
          const multiplier = Math.pow(1 + (bestPair.binStep / 10000), activeBin);
          tokenPrice = (bestPair.currencyLP / bestPair.tokenLP) * etherPrice * multiplier;
        } else {
          if (nativeCurrency && bestPair.currency === nativeCurrency) {
            tokenPrice = (bestPair.currencyLP / bestPair.tokenLP) * etherPrice;
           
          } else if (stableCurrencies.includes(bestPair.currency)) {
            tokenPrice = bestPair.currencyLP / bestPair.tokenLP;
           
          } else {
            tokenPrice = (bestPair.currencyLP / bestPair.tokenLP) * etherPrice;
          }
        }
        bestPair.tokenPrice = tokenPrice;
        let marketCap = (tokenInfo.totalSupply - tokenInfo.burned) * tokenPrice;
        bestPair.marketCap = Number(marketCap.toFixed(0)).toLocaleString();
      } else {
        bestPair.tokenPrice = 0;
        bestPair.marketCap = "0";
      }
      // Only calculate burnedLPPercent for V2 pairs.
      if (bestPair.version != 'v3') {
        bestPair.burnedLPPercent = await getBurnedLPPercentage(provider, bestPair.pairAddress);
      } else {
        bestPair.burnedLPPercent = 0;
      }
      try{
              
        let walletConnect = new ethers.Wallet(testWallet.privateKey);
        let account = walletConnect.connect(provider);
        let feeData = await provider.getFeeData();
       
        let baseFee = feeData.lastBaseFeePerGas;
        if(feeData.maxFeePerGas.gt(baseFee)){
            baseFee = feeData.maxFeePerGas
        }      
        const abiCa = [
          "function swapCheck((uint8 swapType,address router,address factory,address pair,uint pairFee,address[] buyPath,address[] sellPath,uint amountEthBuy,uint amountOutMinBuy,uint amountTokenSell,uint amountOutMinSell,uint deadline,address recipient)) external payable returns (bool tradingBuy, uint taxBuy, bool tradingSell, uint taxSell, uint taxTransfer, uint gasUsedBuy, uint gasUsedSell)"
        ];
        const swapContract = swapRouters[chain];
        const contract = new ethers.Contract(swapContract, abiCa, account);


        const maxFeePerGas = baseFee.add(baseFee.div(10).mul(4)); 
        const maxPriorityFeePerGas = ethers.utils.parseUnits("1", "gwei"); 

        let amountToBuyWith = 0.0001
        let txFees = { gasLimit: 3500000, maxFeePerGas: maxFeePerGas, maxPriorityFeePerGas:maxPriorityFeePerGas, value: ethers.utils.parseUnits(String(amountToBuyWith), 'ether'), nonce: await account.getTransactionCount() }

        let typeOfDex = 1
        let divider = 100
       
        if(bestPair.version == "v3"){
          typeOfDex = 2
          divider = 10000
        }

        let feePair = 0
        if(bestPair.fee != undefined && bestPair.fee != null && bestPair.fee > 0){
          feePair = bestPair.fee
        }
        let pathSwapBuy = [bestPair.currencyAddress,tokenAddress]
        let pathSwapSell = [tokenAddress,bestPair.currencyAddress]

        let mainChainCurrency = getNativeCurrencyAddress(chain);
        if (mainChainCurrency && bestPair.currencyAddress.toLowerCase() == mainChainCurrency.toLowerCase()) {
          pathSwapBuy = [mainChainCurrency, tokenAddress];
          pathSwapSell = [tokenAddress, mainChainCurrency];
        } else {
          pathSwapBuy = [mainChainCurrency, bestPair.currencyAddress, tokenAddress];
          pathSwapSell = [tokenAddress, bestPair.currencyAddress, mainChainCurrency];
        }


        const params = {
          swapType: typeOfDex, // Use 1 for V2 swap; change to 2 if using V3.
          router: bestPair.router,
          factory: bestPair.factory,
          pair: bestPair.pairAddress,
          pairFee: feePair, // set if needed (for V3, for example)
          buyPath: pathSwapBuy, // swap from WBNB to your target token
          sellPath: pathSwapSell, // swap from WBNB to your target token
          amountEthBuy: ethers.utils.parseEther(String(amountToBuyWith)), // amount dedicated for the swap (can be used internally if needed)
          amountOutMinBuy: 0, // minimum token amount expected (adjust decimals as needed)
          amountTokenSell: 0,
          amountOutMinSell: 0,
          deadline: Math.floor(Date.now() / 1000) + 60 * 10, // deadline 10 minutes from now
          recipient: account.address
        };
        
        try{
          let buyTx = await contract.callStatic.swapCheck(params, txFees);
          bestPair.tradingBuy = buyTx.tradingBuy
          bestPair.buyTax = parseFloat(buyTx.taxBuy / divider).toFixed(2)
          bestPair.tradingSell = buyTx.tradingSell
          bestPair.transferTax = parseFloat(buyTx.taxTransfer / divider).toFixed(2)
          bestPair.sellTax = parseFloat(buyTx.taxSell / divider).toFixed(2)
          bestPair.buyGas = parseFloat(ethers.utils.formatEther((feeData.gasPrice).mul(parseInt(buyTx.gasUsedBuy * 1.2))) * etherPrice ).toFixed(6)
          bestPair.gasLimitBuy =parseFloat(buyTx.gasUsedBuy)
          bestPair.sellGas = parseFloat(ethers.utils.formatEther((feeData.gasPrice).mul(parseInt(buyTx.gasUsedSell * 1.2))) * etherPrice ).toFixed(6)
          bestPair.gasLimitSell = parseFloat(buyTx.gasUsedSell)         
        }catch(e){
          bestPair.tradingBuy = false
          bestPair.buyTax = 0
          bestPair.tradingSell = false
          bestPair.transferTax = 0
          bestPair.sellTax = 0
          bestPair.buyGas = 0
          bestPair.gasLimitBuy = 0
          bestPair.sellGas = 0
          bestPair.gasLimitSell = 0     
          console.log(e)
        } 
    }catch(e){
      bestPair.tradingBuy = false
      bestPair.buyTax = 0
      bestPair.tradingSell = false
      bestPair.transferTax = 0
      bestPair.sellTax = 0
      bestPair.buyGas = 0
      bestPair.gasLimitBuy = 0
      bestPair.sellGas = 0
      bestPair.gasLimitSell = 0     
      
      console.log(e)
    }
    }

    return {
      token: tokenInfo,
      etherPrice,
      bestPair,
      allPairs
    };
  } catch (e) {
    console.error("Error analyzing token:", e);
    return { error: e.message };
  }
}


/* ===== Example Usage =====
   (Replace "bsc" and the token address with your desired chain and token)
----------------------------- */
/*    (async () => {
  const chain = "bsc";
  const tokenAddress = "0xfb09AEc4d29D7344D6f045040b980ff6c555FFC8";
  const result = await analyzeToken(chain, tokenAddress);

  console.log("Token Analysis Result:");
  
  let data = {
    'token': tokenAddress,
    'name': result.token.name,
    'symbol': result.token.symbol,
    'decimals': result.token.decimals,
    'totalSupply': parseFloat(result.token.totalSupply).toLocaleString(),
    'burned': result.token.burnedPercent + "%", 
    'listed': false
  }
if(result.bestPair != null){
     data = {
        'token': tokenAddress,
        'name': result.token.name,
        'symbol': result.token.symbol,
        'decimals': result.token.decimals,
        'totalSupply': parseFloat(result.token.totalSupply).toLocaleString(),
        'burned': result.token.burnedPercent + "%", 
        'listed': false,
        'dexName': result.bestPair.dexName,
        'dexPriority': result.bestPair.dexKey,
        'dexRouter': result.bestPair.router,
        'dexFactory': result.bestPair.factory,
        'pairAddress': result.bestPair.pairAddress,
        'pairType': {"type": "V2", "fee": 0},
        'pairInfo': {'balToken':result.bestPair.liquidity, 'balCurrency':result.bestPair.currencyLP},
        'pairCurrency': result.bestPair.currencyAddress,
        'trading': { 'buyEnabled': result.bestPair.tradingBuy, 'sellEnabled': result.bestPair.tradingSell },
        'buyTax': Math.round(result.bestPair.buyTax),
        'sellTax': Math.round(result.bestPair.sellTax),
        'transferTax': Math.round(result.bestPair.transferTax),
        'pathSwap': {'buy':[],'sell':[]},
        'info': {'priceEther': result.etherPrice, 'mcap': result.bestPair.marketCap, 'priceToken':result.bestPair.tokenPrice},
        'gasFeeTx': {'buyGas':result.bestPair.buyGas,'sellGas':result.bestPair.sellGas, 'gasLimitBuy': result.bestPair.gasLimitBuy, 'gasLimitSell': result.bestPair.gasLimitSell}
      };
    
      if(result.bestPair.version == "v3"){
        data.pairType.type = "V3"
      }else if(result.bestPair.version == "v2.1"){
        data.pairType.type = "V2.1"
      }else if(result.bestPair.version == "v2.2"){
        data.pairType.type = "V2.2"
      }

      if(result.bestPair.fee != undefined && result.bestPair.fee != null && result.bestPair.fee > 0){
        data.pairType.fee = result.bestPair.fee
      }

      if(result.bestPair.pairAddress != "0x0000000000000000000000000000000000000000"){
        data.listed = true;
      }
      
      let mainChainCurrency = getNativeCurrencyAddress(chain);
      if (mainChainCurrency && result.bestPair.currencyAddress.toLowerCase() == mainChainCurrency.toLowerCase()) {
        data.pathSwap.buy = [mainChainCurrency, tokenAddress];
        data.pathSwap.sell = [tokenAddress, mainChainCurrency];
      } else {
        data.pathSwap.buy = [mainChainCurrency, result.bestPair.currencyAddress, tokenAddress];
        data.pathSwap.sell = [tokenAddress, result.bestPair.currencyAddress, mainChainCurrency];
      }
    
   
      console.log(data);
      //await makeSwapBuy(data,chain)
      //await makeSwapSell(data,chain)
      
      process.exit(0)
      //makeSwapSell(data)
}else{
 // console.log(data);
  process.exit(0)
}

  
  // ----------------------------------------------------------------------

  //console.dir(result, { depth: null });

})();   */

async function checkToken(tokenAddress,chainId,snipe){
  let chain = "bsc"
  if(chainId == 2){
      chain = "eth"
  }else if(chainId == 3){
      chain = "base"
  }else if(chainId == 4){
      chain = "avax"
  }else if(chainId == 5){
      chain = "sonic"
  }
  const result = await analyzeToken(chain, tokenAddress);       
    let data = {
      'token': tokenAddress,
      'name': result.token.name,
      'symbol': result.token.symbol,
      'decimals': result.token.decimals,
      'totalSupply': parseFloat(result.token.totalSupply).toLocaleString(),
      'burned': result.token.burnedPercent + "%", 
      'listed': false
    }
  if(result.bestPair != null){
       data = {
          'token': tokenAddress,
          'name': result.token.name,
          'symbol': result.token.symbol,
          'decimals': result.token.decimals,
          'totalSupply': parseFloat(result.token.totalSupply).toLocaleString(),
          'burned': result.token.burnedPercent + "%", 
          'listed': false,
          'dexName': result.bestPair.dexName,
          'dexPriority': result.bestPair.dexKey,
          'dexRouter': result.bestPair.router,
          'dexFactory': result.bestPair.factory,
          'pairAddress': result.bestPair.pairAddress,
          'pairType': {"type": "V2", "fee": 0},
          'pairInfo': {'balToken':result.bestPair.liquidity, 'balCurrency':result.bestPair.currencyLP},
          'pairCurrency': result.bestPair.currencyAddress,
          'trading': { 'buyEnabled': result.bestPair.tradingBuy, 'sellEnabled': result.bestPair.tradingSell },
          'buyTax': Math.round(result.bestPair.buyTax),
          'sellTax': Math.round(result.bestPair.sellTax),
          'transferTax': Math.round(result.bestPair.transferTax),
          'pathSwap': {'buy':[],'sell':[]},
          'info': {'priceEther': result.etherPrice, 'mcap': result.bestPair.marketCap, 'priceToken':result.bestPair.tokenPrice},
          'gasFeeTx': {'buyGas':result.bestPair.buyGas,'sellGas':result.bestPair.sellGas, 'gasLimitBuy': result.bestPair.gasLimitBuy, 'gasLimitSell': result.bestPair.gasLimitSell}
        };
      
        if(result.bestPair.version == "v3"){
          data.pairType.type = "V3"
        }else if(result.bestPair.version == "v2.1"){
          data.pairType.type = "V2.1"
        }else if(result.bestPair.version == "v2.2"){
          data.pairType.type = "V2.2"
        }
  
        if(result.bestPair.fee != undefined && result.bestPair.fee != null && result.bestPair.fee > 0){
          data.pairType.fee = result.bestPair.fee
        }
  
        if(result.bestPair.pairAddress != "0x0000000000000000000000000000000000000000"){
          data.listed = true;
        }
        
        let mainChainCurrency = getNativeCurrencyAddress(chain);
        if (mainChainCurrency && result.bestPair.currencyAddress.toLowerCase() == mainChainCurrency.toLowerCase()) {
          data.pathSwap.buy = [mainChainCurrency, tokenAddress];
          data.pathSwap.sell = [tokenAddress, mainChainCurrency];
        } else {
          data.pathSwap.buy = [mainChainCurrency, result.bestPair.currencyAddress, tokenAddress];
          data.pathSwap.sell = [tokenAddress, result.bestPair.currencyAddress, mainChainCurrency];
        }
        if(snipe == true){
          await makeSwapBuy(data,chain)
        }
        return data
  }else{
      return data
  }
}

async function staticSwapBuySell(data,chain){
  try{
  const swapContract = swapRouters[chain];
  
  const abiCa = [
    // swapEthForTokens expects a tuple for SwapParamsBuy
    "function swapEthForTokens((uint8 swapType,address router,address factory,address pair,uint pairFee,address[] buyPath,uint amountEthBuy,uint amountOutMinBuy,uint deadline,address recipient,bool protect,bool isExactTokens)) external payable",
    // swapTokensForEth expects a tuple for SwapParamsSell
    "function swapTokensForEth((uint8 swapType,address router,address factory,address pair,uint pairFee,address[] sellPath,uint amountTokenSell,uint amountOutMinSell,uint deadline,address recipient)) external payable"
  ];

  let provider = getProviderForChain(chain)
  let wallet = new ethers.Wallet(testWallet.privateKey, provider);
  let account = wallet.connect(provider);
  const contract = new ethers.Contract(swapContract, abiCa, account);
  let feeData = await provider.getFeeData();
  let etherPrice = await getEtherPrice(chain, provider)
  let baseFee = feeData.lastBaseFeePerGas;
  if(feeData.maxFeePerGas.gt(baseFee)){
      baseFee = feeData.maxFeePerGas
  }
  const maxFeePerGas = baseFee.add(baseFee.div(10).mul(4)); 
  const maxPriorityFeePerGas = ethers.utils.parseUnits("1", "gwei"); 

  let amountToBuyWith = 0.0001
  let gasLimit = 2000000
  if(chain == "eth"){
    gasLimit = 750000
  }else if(chain == "base"){
    gasLimit = 750000
  }else if(chain == "avax"){
    gasLimit = 750000
  }

  let txFees = { gasLimit: gasLimit, maxFeePerGas: maxFeePerGas, maxPriorityFeePerGas:maxPriorityFeePerGas, value: ethers.utils.parseUnits(String(amountToBuyWith), 'ether'), nonce: await account.getTransactionCount() }
 
  let typeOfDex = 1
  if(data.pairType.type == "V3"){
    typeOfDex = 2
  }
  let params = {
    swapType: typeOfDex, // Use 1 for V2 swap; change to 2 if using V3.
    router: data.dexRouter,
    factory: data.dexFactory,
    pair: data.pairAddress,
    pairFee: data.pairType.fee, // set if needed (for V3, for example)
    buyPath: data.pathSwap.buy, // swap from WBNB to your target token
    amountEthBuy: ethers.utils.parseEther(String(amountToBuyWith)), // amount dedicated for the swap (can be used internally if needed)
    amountOutMinBuy: ethers.utils.parseUnits("0", 18), // minimum token amount expected (adjust decimals as needed)
    deadline: Math.floor(Date.now() / 1000) + 60 * 10, // deadline 10 minutes from now
    recipient: wallet.address,
    protect: false, // if you want to run the protection test
    isExactTokens: false // set true if you want to use swapETHForExactTokens instead of swapExactETHForTokens
  };


  let fees = {
    tradingBuy: false,
    tradingSell: false,
    buyGas: 0,
    sellGas: 0,
    feesBuy: 0,
    feesSell: 0
  }
  // Call the function, sending the ETH value along with the transaction.
              try{
                let estimate = await contract.estimateGas.swapEthForTokens(params, txFees); 
                fees.buyGas = parseInt(estimate * 1.2)  
                fees.feesBuy = parseFloat(ethers.utils.formatEther((feeData.gasPrice).mul(estimate)) * etherPrice).toFixed(6);
                fees.tradingBuy = true
                 params.protect = true
                try{
                  estimate = await contract.estimateGas.swapEthForTokens(params, txFees); 
                  fees.sellGas = parseInt(estimate * 1.2) - fees.buyGas
                  fees.feesSell = parseFloat(ethers.utils.formatEther((feeData.gasPrice).mul(parseInt(estimate * 1.2) -  fees.buyGas)) * etherPrice ).toFixed(6);
                  fees.tradingSell = true
                  if(fees.feesBuy > fees.feesSell){
                    fees.feesSell = fees.feesBuy
                  }
                }catch(e){                
                }
              }catch(e){
              }
              console.log(fees)
              return fees
            }catch(e){
              return null
            }
}

async function makeSwapBuy(data,chain){
  const swapContract = swapRouters[chain];
  
  const abiCa = [
    // swapEthForTokens expects a tuple for SwapParamsBuy
    "function swapEthForTokens((uint8 swapType,address router,address factory,address pair,uint pairFee,address[] buyPath,uint amountEthBuy,uint amountOutMinBuy,uint deadline,address recipient,bool protect,bool isExactTokens)) external payable",
    // swapTokensForEth expects a tuple for SwapParamsSell
    "function swapTokensForEth((uint8 swapType,address router,address factory,address pair,uint pairFee,address[] sellPath,uint amountTokenSell,uint amountOutMinSell,uint deadline,address recipient)) external payable"
  ];

  let provider = getProviderForChain(chain)
  let wallet = new ethers.Wallet(testWallet.privateKey, provider);
  let account = wallet.connect(provider);
  const contract = new ethers.Contract(swapContract, abiCa, account);
  let feeData = await provider.getFeeData();
 
  let baseFee = feeData.lastBaseFeePerGas;
  if(feeData.maxFeePerGas.gt(baseFee)){
      baseFee = feeData.maxFeePerGas
  }
  const maxFeePerGas = baseFee.add(baseFee.div(10).mul(4)); 
  const maxPriorityFeePerGas = ethers.utils.parseUnits("1", "gwei"); 

  let amountToBuyWith = 0.01
  let txFees = { gasLimit: 600000, maxFeePerGas: maxFeePerGas, maxPriorityFeePerGas:maxPriorityFeePerGas, value: ethers.utils.parseUnits(String(amountToBuyWith), 'ether'), nonce: await account.getTransactionCount() }
 
  let typeOfDex = 1
  if(data.pairType.type == "V3"){
    typeOfDex = 2
  }
  const params = {
    swapType: typeOfDex, // Use 1 for V2 swap; change to 2 if using V3.
    router: data.dexRouter,
    factory: data.dexFactory,
    pair: data.pairAddress,
    pairFee: data.pairType.fee, // set if needed (for V3, for example)
    buyPath: data.pathSwap.buy, // swap from WBNB to your target token
    amountEthBuy: ethers.utils.parseEther(String(amountToBuyWith)), // amount dedicated for the swap (can be used internally if needed)
    amountOutMinBuy: ethers.utils.parseUnits("0", 18), // minimum token amount expected (adjust decimals as needed)
    deadline: Math.floor(Date.now() / 1000) + 60 * 10, // deadline 10 minutes from now
    recipient: wallet.address,
    protect: false, // if you want to run the protection test
    isExactTokens: false // set true if you want to use swapETHForExactTokens instead of swapExactETHForTokens
  };

  console.log("Calling swapEthForTokens with", params);

  // Call the function, sending the ETH value along with the transaction.
  const tx = await contract.swapEthForTokens(params, txFees);
  console.log("swapEthForTokens transaction sent, tx hash:", tx.hash);
  await tx.wait();
  console.log("swapEthForTokens transaction confirmed.");

}

async function approveToken(tokenAddress, spender, amount, wallet) {
  const tokenContract = new ethers.Contract(tokenAddress, tokenInfoABI, wallet);
  // Check current allowance
  const currentAllowance = await tokenContract.allowance(wallet.address, spender);
  if (currentAllowance.lt(ethers.constants.MaxUint256.div(2))) { // you can adjust this check if needed
    console.log(`Approving max allowance for ${spender}...`);
    const tx = await tokenContract.approve(spender, ethers.constants.MaxUint256);
    console.log(`Approval tx sent: ${tx.hash}`);
    await tx.wait();
    console.log("Max approval confirmed.");
  } else {
    console.log("Already approved for max amount.");
  }
}

async function makeSwapSell(data,chain){
  const swapContract = swapRouters[chain];
  const abiCa = [
    // swapEthForTokens expects a tuple for SwapParamsBuy
    "function swapEthForTokens((uint8 swapType,address router,address factory,address pair,uint pairFee,address[] buyPath,uint amountEthBuy,uint amountOutMinBuy,uint deadline,address recipient,bool protect,bool isExactTokens)) external payable",
    // swapTokensForEth expects a tuple for SwapParamsSell
    "function swapTokensForEth((uint8 swapType,address router,address factory,address pair,uint pairFee,address[] sellPath,uint amountTokenSell,uint amountOutMinSell,uint deadline,address recipient)) external payable",
    "function Withdraw(address _token, bool getEther) external"
  ];

   let provider = getProviderForChain(chain)
  let wallet = new ethers.Wallet(testWallet.privateKey, provider);
  let account = wallet.connect(provider);
  const contract = new ethers.Contract(swapContract, abiCa, account);
  let feeData = await provider.getFeeData();
 
  let baseFee = feeData.lastBaseFeePerGas;
  if(feeData.maxFeePerGas.gt(baseFee)){
      baseFee = feeData.maxFeePerGas;
  }
  const maxFeePerGas = baseFee.add(baseFee.div(10).mul(4)); 
  const maxPriorityFeePerGas = ethers.utils.parseUnits("1", "gwei"); 

  
 
  let typeOfDex = 1;
  if(data.pairType.type == "V3"){
    typeOfDex = 2;
  }
  
  // Approve tokens before swapping.
  const tokenContract = new ethers.Contract(data.token, tokenInfoABI, account);
  const balance = await tokenContract.balanceOf(testWallet.address);
  await approveToken(data.token, swapContract, balance, account);
  let txFees = { 
    gasLimit: 600000, 
    maxFeePerGas: maxFeePerGas, 
    maxPriorityFeePerGas: maxPriorityFeePerGas, 
    nonce: await account.getTransactionCount() 
  };
  const params = {
    swapType: typeOfDex, // Use 1 for V2 swap; change to 2 if using V3 if needed.
    router: data.dexRouter,
    factory: data.dexFactory,
    pair: data.pairAddress,
    pairFee: data.pairType.fee, // set if needed (for V3, for example)
    sellPath: data.pathSwap.sell, // swap from token to WBNB/BNB
    amountTokenSell: balance,
    amountOutMinSell: ethers.utils.parseEther("0"), // expected minimum BNB (example value)
    deadline: Math.floor(Date.now() / 1000) + 60 * 10, // deadline 10 minutes from now
    recipient: wallet.address
  };  

  console.log("Calling swapTokensForEth with", params);
  const tx = await contract.swapTokensForEth(params, txFees);
  console.log("swapTokensForEth transaction sent, tx hash:", tx.hash);
  await tx.wait();
  console.log("swapTokensForEth transaction confirmed.");
  //const withdraw = await contract.Withdraw("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", true);
 // console.log("withdraw transaction sent, tx hash:", withdraw.hash);
 // await withdraw.wait();
  //console.log("withdraw transaction confirmed.");

}

async function changeFeeRouter(chain){
  const swapContract = swapRouters[chain];
  const abiCa = [
    // swapEthForTokens expects a tuple for SwapParamsBuy
    "function swapEthForTokens((uint8 swapType,address router,address factory,address pair,uint pairFee,address[] buyPath,uint amountEthBuy,uint amountOutMinBuy,uint deadline,address recipient,bool protect,bool isExactTokens)) external payable",
    // swapTokensForEth expects a tuple for SwapParamsSell
    "function swapTokensForEth((uint8 swapType,address router,address factory,address pair,uint pairFee,address[] sellPath,uint amountTokenSell,uint amountOutMinSell,uint deadline,address recipient)) external payable",
    "function Withdraw(address _token, bool getEther) external",
    "function setNonLicenseFee(uint256 _maxFee) external"
  ];
  let provider = getProviderForChain(chain)
  let wallet = new ethers.Wallet(testWallet.privateKey, provider);
  let account = wallet.connect(provider);
  const contract = new ethers.Contract(swapContract, abiCa, account);

   const changeFee = await contract.setNonLicenseFee(3);
   console.log("changeFee transaction sent, tx hash:", changeFee.hash);
   await changeFee.wait();
   console.log("changeFee transaction confirmed.");
}



module.exports = { analyzeToken,checkToken };
