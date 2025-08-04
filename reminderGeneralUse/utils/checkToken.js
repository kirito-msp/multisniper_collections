// utils/checkToken.js
const axios = require('axios');

// Replace this with your actual data source or endpoint
const BASE_URL = 'https://your-api-host.com/token'; // Example

async function checkToken(contractAddress, chainName = 'ETH') {
  try {
    const { data } = await axios.get(`${BASE_URL}`, {
      params: {
        address: contractAddress,
        chain: chainName
      }
    });

    if (!data || !data.token || !data.bestPair) {
      throw new Error('Invalid data structure returned');
    }

    return {
      token: data.token.address,
      name: data.token.name,
      symbol: data.token.symbol,
      decimals: data.token.decimals,
      totalSupply: data.token.totalSupply,
      burned: data.token.burnedPercent + "%",
      listed: data.token.listed || false,

      dexName: data.bestPair.dexName,
      dexPriority: data.bestPair.dexKey,
      dexRouter: data.bestPair.router,
      dexFactory: data.bestPair.factory,
      pairAddress: data.bestPair.pairAddress,
      pairType: { type: 'V2', fee: 0 },

      pairInfo: {
        balToken: data.bestPair.liquidity,
        balCurrency: data.bestPair.currencyLP
      },

      pairCurrency: data.bestPair.currencyAddress,
      currencySymbol: data.bestPair.currencySymbol,

      trading: {
        buyEnabled: data.bestPair.tradingBuy,
        sellEnabled: data.bestPair.tradingSell
      },

      buyTax: Math.round(data.bestPair.buyTax),
      sellTax: Math.round(data.bestPair.sellTax),
      transferTax: Math.round(data.bestPair.transferTax),

      pathSwap: {
        buy: [],
        sell: []
      },

      info: {
        priceEther: data.etherPrice,
        mcap: data.bestPair.marketCap,
        priceToken: data.bestPair.tokenPrice
      },

      gasFeeTx: {
        buyGas: data.bestPair.buyGas,
        sellGas: data.bestPair.sellGas,
        gasLimitBuy: data.bestPair.gasLimitBuy,
        gasLimitSell: data.bestPair.gasLimitSell
      }
    };
  } catch (err) {
    console.error(`[checkToken error] ${contractAddress} on ${chainName}:`, err.message);
    return null;
  }
}

module.exports = {
  checkToken
};
