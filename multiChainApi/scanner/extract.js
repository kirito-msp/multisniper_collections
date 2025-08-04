const ethers = require('ethers');
const pkg = require('evm');
const CryptoJS = require("crypto-js");
const { EVM } = pkg;
const BigNumber = require('bignumber.js');
let maxBuyFunctions = ['function maxBuyLimit() view returns (uint256)', 'function maxTxAmountPerc() view returns (uint256)', 'function maxBuyTxTokens() view returns (uint256)', 'function maxTransactionAmountOnPurchase() view returns (uint256)', 'function _maximumBuyAmount() view returns (uint256)', 'function maxTransferAmountBuy() view returns (uint256)', 'function MaxTXAmount() view returns (uint256)','function getMaxBuyAmount() view returns (uint256)', 'function maxTxBPS() view returns (uint256)', 'function maxBuyTransactionAmount() view returns (uint256)', 'function maxTxAmountUI() view returns (uint256)', 'function initialMaxTokenAmountPerAddress() view returns (uint256)', 'function maxBuy() view returns (uint256)','function maxTxSize() view returns (uint256)', 'function maxPurchase() view returns (uint256)', 'function maxTxAmount() view returns (uint256)', 'function maxBuyTxAmount() view returns (uint256)', 'function tempMaxTxnCap() view returns (uint256)','function MaxTxAmt() view returns (uint256)', 'function maxTxn() view returns (uint256)', 'function _getMaxTxAmount() view returns (uint256)', 'function MAX_ANTIWHALE() view returns (uint256)']
let openTradingFunctions = ["function _tradingOpen() view returns (bool)","function tradingOpen() view returns (bool)","function tradingEnabled() view returns (bool)","function tradingAllowed() view returns (bool)","function openTrade() view returns (bool)"]
let buyFeeFunctions = ["function buyTotalTax() view returns (uint256)","function _totalTaxIfBuying() view returns (uint256)","function _buyFee() view returns (uint256)","function fees() view returns (uint256)","function buying_fee() view returns (uint256)","function viewFeesBuy() view returns (uint256)","function _initialBuyTax() view returns (uint256)","function buyFee() view returns (uint256)","function totalFee() view returns (uint256)","function _taxFeeOnBuy() view returns (uint256)"]
let sellFeeFunctions= [ "function sellTotalTax() view returns (uint256)","function _totalTaxIfSelling() view returns (uint256)","function selling_fee() view returns (uint256)","function _sellFee() view returns (uint256)","function fees() view returns (uint256)","function viewFeesSell() view returns (uint256)","function _initialBuyTax() view returns (uint256)","function sellFee() view returns (uint256)", "function _taxFeeOnSell() view returns (uint256)","function _marketingFee() view returns (uint256)"]
let maxTransactionFunctions= ["function maxTransactionAmount() view returns (uint256)","function _maxTxAmount() view returns (uint256)"]
let maxWalletFunctions= ["function _walletMax() view returns (uint256)","function maxWallet() view returns (uint256)","function _maxWalletToken() view returns (uint256)","function _maxWalletSize() view returns (uint256)"]
let functionsCompareArray = {
    method1:{
        method: "0x8f70ccf7",
        function: "setTrading(bool)",
        tradingVariable: "function _tradingOpen() view returns (bool)",
        maxWallet: "function _maxWalletSize() view returns (uint256)",
        maxTransaction: "function _maxTxAmount() view returns (uint256)",
        transferFee: "function _maxTransferAmount() view returns (uint256)",
        sellFee: "function _initialSellTax() view returns (uint256)",
        buyFee: "function _initialBuyTax() view returns (uint256)"
    },
    method2:{
        method: "0xc9567bf9",
        function: "openTrading()",
        tradingVariable: "function tradingOpen() view returns (bool)",
        maxWallet: "function _maxWalletSize() view returns (uint256)",
        maxTransaction: "function _maxTxAmount() view returns (uint256)",
        transferFee: "function _maxTransferAmount() view returns (uint256)",
        sellFee: "function _initialSellTax() view returns (uint256)",
        buyFee: "function _initialBuyTax() view returns (uint256)"
    },
    method3:{
        method: "0x8a8c523c",
        function: "enableTrading()",
        tradingVariable: "function tradingEnabled() view returns (bool)",
        maxWallet: "function _maxWalletSize() view returns (uint256)",
        maxTransaction: "function _maxTxAmount() view returns (uint256)",
        transferFee: "function _maxTransferAmount() view returns (uint256)",
        sellFee: "function sellFee() view returns (uint256)",
        buyFee: "function buyFee() view returns (uint256)"
    },
    method4:{
        method: "0x293230b8",
        function: "startTrading()",
        tradingVariable: "function tradingAllowed() view returns (bool)",
        maxWallet: "function _maxWalletToken() view returns (uint256)",
        maxTransaction: "function _maxTxAmount() view returns (uint256)",
        transferFee: "function _maxTransferAmount() view returns (uint256)",
        sellFee: "function _initialSellTax() view returns (uint256)",
        buyFee: "function totalFee() view returns (uint256)"
    },
    method5:{
        method: "0x8f70ccf7",
        function: "setTrading(bool)",
        tradingVariable: "function tradingOpen() view returns (bool)",
        maxWallet: "function _maxWalletSize() view returns (bool)",
        maxTransaction: "function _maxTxAmount() view returns (bool)",
        transferFee: "function _maxTransferAmount() view returns (bool)",
        sellFee: "function _taxFeeOnSell() view returns (bool)",
        buyFee: "function _taxFeeOnBuy() view returns (bool)"
    },
    method6:{
        method: "0xfb201b1d",
        function: "Enable()",
        tradingVariable: "function openTrade() view returns (bool)",
        maxWallet: "function _maxWalletSize() view returns (bool)",
        maxTransaction: "function _maxTxAmount() view returns (bool)",
        transferFee: "function _maxTransferAmount() view returns (bool)",
        sellFee: "function _marketingFee() view returns (bool)",
        buyFee: "function _taxFeeOnBuy() view returns (bool)"
    }
}

async function getLimits(data, provider) {
    try {
      let info = {
        method: null,
        function: null,
        tradingVariable: null,
        maxWallet: null,
        transferFee: null,
        sellFee: null,
        buyFee: null,
        status: null
      };
  
      // 1. Check Trading Status
      let tokenContract = new ethers.Contract(data.contract, openTradingFunctions, provider);
      let trading = {
        _tradingOpen: undefined,
        tradingOpen: undefined,
        tradingEnabled: undefined,
        tradingAllowed: undefined,
        openTrade: undefined,
      };
  
      let detectTrading = undefined;
      for (let role in trading) {
        try {
          trading[role] = await tokenContract[role]();
          // If the function returns a value (not undefined), use it
          if (typeof trading[role] !== "undefined") {
            detectTrading = trading[role];
          } else {
            // Set info according to role if undefined; order matters for method id!
            if (role === "_tradingOpen") {
              info.method = functionsCompareArray["method1"]["method"];
              info.function = functionsCompareArray["method1"]["function"];
              info.status = trading[role];
            } else if (role === "tradingOpen") {
              info.method = functionsCompareArray["method2"]["method"];
              info.function = functionsCompareArray["method2"]["function"];
              info.status = trading[role];
            } else if (role === "tradingEnabled") {
              info.method = functionsCompareArray["method3"]["method"];
              info.function = functionsCompareArray["method3"]["function"];
              info.status = trading[role];
            } else if (role === "tradingAllowed") {
              info.method = functionsCompareArray["method4"]["method"];
              info.function = functionsCompareArray["method4"]["function"];
              info.status = trading[role];
            }
          }
        } catch (e) {
          // Optionally log the error: console.error(`Error in ${role}:`, e);
        }
      }
  
      // 2. Get Buy Fee
      tokenContract = new ethers.Contract(data.contract, buyFeeFunctions, provider);
      let buyFeeFunc = {
        _initialBuyTax: undefined,
        buyFee: undefined,
        totalFee: undefined,
        _taxFeeOnBuy: undefined,
        buying_fee: undefined,
        fees: undefined,
        _buyFee: undefined,
        _totalTaxIfBuying: undefined,
        buyTotalTax: undefined,
        viewFeesBuy: undefined 
      };
      let detectBuyFee = undefined;
      for (let role in buyFeeFunc) {
        try {
          let result = await tokenContract[role]();
          if (typeof result !== "undefined" && result !== "0x0") {
            detectBuyFee = result;
            info.buyFee = detectBuyFee;
            data.buyFee = String(detectBuyFee);
            break; // stop once a valid value is found
          }
        } catch (e) {
          // Ignore if function not implemented
        }
      }
  
      // 3. Get Max Transaction Amount
      tokenContract = new ethers.Contract(data.contract, maxTransactionFunctions, provider);
      let maxTxFunc = {
        _maxTxAmount: undefined,
        maxTransactionAmount: undefined
      };
      let maxTxAmount = undefined;
      for (let role in maxTxFunc) {
        try {
          let result = await tokenContract[role]();
          if (typeof result !== "undefined" && result !== "0x0") {
            maxTxAmount = result;
            if (maxTxAmount) {
              // Adjust by removing the decimals (assumed to be stored in data.decimals)
              info.maxBuy = String(maxTxAmount).slice(0, String(maxTxAmount).length - data.decimals);
              data.maxBuy = String(maxTxAmount).slice(0, String(maxTxAmount).length - data.decimals);
              break;
            }
          }
        } catch (e) {}
      }
  
      // 4. Get Max Wallet Amount
      tokenContract = new ethers.Contract(data.contract, maxWalletFunctions, provider);
      let maxWalletFunc = {
        _maxWalletToken: undefined,
        _maxWalletSize: undefined,
        _walletMax: undefined,
        maxWallet: undefined
      };
      let maxWalletAmount = undefined;
      for (let role in maxWalletFunc) {
        try {
          let result = await tokenContract[role]();
          if (typeof result !== "undefined" && result !== "0x0") {
            maxWalletAmount = result;
            if (maxWalletAmount) {
              // If maxTxAmount exists and is greater than maxWalletAmount, adjust maxBuy accordingly
              if (maxTxAmount && maxTxAmount > maxWalletAmount) {
                info.maxBuy = String(maxWalletAmount).slice(0, String(maxWalletAmount).length - data.decimals);
                data.maxBuy = String(maxWalletAmount).slice(0, String(maxWalletAmount).length - data.decimals);
              }
              info.maxWallet = String(maxWalletAmount).slice(0, String(maxWalletAmount).length - data.decimals);
              data.maxWallet = String(maxWalletAmount).slice(0, String(maxWalletAmount).length - data.decimals);
              break;
            }
          }
        } catch (e) {}
      }
  
      // 5. Adjust Percentages (assuming data.tsupply is defined)
      if (data.maxBuy !== "NULL" && data.maxWallet !== "NULL") {
        if (data.maxBuy > data.maxWallet) {
          data.maxBuy = data.maxWallet;
        }
      }
  
      if (data.maxBuy !== "NULL" && data.maxBuy != 0) {
        data.maxBuy = parseFloat(
          new BigNumber(data.maxBuy)
            .dividedBy(new BigNumber(data.tsupply))
            .times(100)
            .toString()
        ).toFixed(2);
      }
  
      if (data.maxWallet !== "NULL" && data.maxWallet != 0) {
        data.maxWallet = parseFloat(
          new BigNumber(data.maxWallet)
            .dividedBy(new BigNumber(data.tsupply))
            .times(100)
            .toString()
        ).toFixed(2);
      }
  
      // Cap the values at 100 if necessary
      if (!isNaN(data.maxWallet) && data.maxWallet !== 'Infinity') {
        if (data.maxWallet > 70) {
          data.maxWallet = 100;
        }
      } else {
        data.maxWallet = 100;
      }
      if (!isNaN(data.maxBuy) && data.maxBuy !== 'Infinity') {
        if (data.maxBuy > 70) {
          data.maxBuy = 100;
        }
      } else {
        data.maxBuy = 100;
      }
  
      
      return data;
    } catch (e) {
      console.error("Error in getLimits:", e);
      return data;
    }
  }

async function extractData(dataToken,provider) {
    
    let data = {
        contract: dataToken.contractAddress,
        buyFee: 0,
        sellFee: 0,
        maxTx: 100,
        maxWallet: 100,
        uniqueHash: "msp0x"
    }
   
    try {
        let deploymentData = await provider.getCode(dataToken.contractAddress);
        if (deploymentData != "") {
            const evm = new EVM(deploymentData);
            let functionsCtr = evm.getFunctions()
            let eventsCtr = evm.getEvents()
            let optcodes = evm.getOpcodes()
            let uniqueId = functionsCtr + eventsCtr + optcodes            
            uniqueId = CryptoJS.SHA256(uniqueId).toString();
            uniqueId = uniqueId.substring(0, 10);
            data.uniqueHash = "msp" + uniqueId
           
            data.buyFee = parseFloat(data.buyFee).toFixed(2)
            data.sellFee = parseFloat(data.buyFee).toFixed(2)
            data.maxTx = parseFloat(data.buyFee).toFixed(2)
            data.maxWallet = parseFloat(data.buyFee).toFixed(2)
            let result = await getLimits(data,provider); // Wait for getLimits to complete
         
        } else {
            let result = await getLimits(data,provider); // Wait for getLimits to complete
         
        }
    } catch (e) {
        console.log("eRROR EXTRACT: ", e)
    }
    return data

}


module.exports = { extractData };