const WebSocket = require('ws');
const Watch = require('../models/Watch');
const { sendTradeNotification } = require('./sendNotification'); // Function to send notifications to the users

const tokenCache = new Map(); // Cache to track previous mcaps

// WebSocket client for listening to trade data
const ws = new WebSocket('ws://127.0.0.1:6161');

function mapChain(numChain) {
  switch (numChain) {
    case 1: return 'bsc';
    case 2: return 'eth';
    case 3: return 'base';
    case 4: return 'avax';
    case 5: return 'sonic';
    default: return '';
  }
}

function getChainConfigs(chain) {
  // chain can be numeric, string, etc.
  // We assume that if chain is passed as a string (e.g., "bsc", "eth", "base", "avax")
  // Otherwise, you might need to map numeric values.
  const lower = chain.toString().toLowerCase();
  switch(lower) {
    case "1":
    case "bsc":
      return {
        chainName: "BSC",
        scannerBase: "https://bscscan.com",
        dexscreenerBase: "https://dexscreener.com/bsc/",
        gmgnBase: "https://gmgn.ai/bsc/token/",
      };
    case "2":
    case "ethereum":
    case "eth":
      return {
        chainName: "ETH",
        scannerBase: "https://etherscan.io",
        dexscreenerBase: "https://dexscreener.com/ethereum/",
        gmgnBase: "https://gmgn.ai/eth/token/",
      };
    case "3":
    case "base":
      return {
        chainName: "BASE",
        scannerBase: "https://basescan.org",
        dexscreenerBase: "https://dexscreener.com/base/",
        gmgnBase: "https://gmgn.ai/base/token/",
      };
    case "4":
    case "avax":
      return {
        chainName: "AVAX",
        scannerBase: "https://snowscan.xyz",
        dexscreenerBase: "https://dexscreener.com/avalanche/",
        gmgnBase: "", // if not available, leave empty
      };
    default:
      return {
        chainName: chain.toUpperCase(),
        scannerBase: "",
        dexscreenerBase: "",
        gmgnBase: "",
      };
  }
}

// Event listener when the WebSocket connection is established
ws.on('open', () => {
  console.log('Connected to WebSocket server');
});

// Event listener when a message is received from the WebSocket server
ws.on('message', async (data) => {
  try {
    const jsonString = data.toString();
    const message = JSON.parse(jsonString);  
    if (message.message && message.message.type === 'blockDataTrades') {
      const trades = message.message.data;
      let chain = message.message.chain      
      for (let wallet in trades) {
        const trade = trades[wallet];
        if (trade.type === 'Swap') {
          const { from, in: inToken, out: outToken, txHash } = trade;
          const users = await Watch.find({
            type: 'wallet',
            address: { $regex: `^${from.toLowerCase()}$`, $options: 'i' }
          });
         
          for (let user of users) {
            if (inToken && outToken) {
              const inValue = Object.values(inToken)[0].value;
              const outValue = Object.values(outToken)[0].value;
              const inValueUsd = Object.values(inToken)[0].usdValue;
              const outValueUsd = Object.values(outToken)[0].usdValue;
              const inValueMc = Object.values(inToken)[0].mcap;
              const outValueMc = Object.values(outToken)[0].mcap;
              const inAddress = Object.keys(inToken)[0];   // First token address in "in"
              const outAddress = Object.keys(outToken)[0]; // First token address in "out"
              
              let dexscreener = "https://dexscreener.com/"
              let gmgn = "https://gmgn.ai/"
              let scanner = "https://bscscan.com/tx/"
              let wExplorer = "https://bscscan.com/address/"
              let mainToken = inAddress
              let scanLink = "https://bscscan.com/token/"
              let type = "🟢Buy"
              if(chain == "bsc"){
                if(outAddress.toLowerCase() != "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c".toLowerCase() && outAddress.toLowerCase() != "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56".toLowerCase() && outAddress.toLowerCase() != "0x55d398326f99059fF775485246999027B3197955".toLowerCase() && outAddress.toLowerCase() != "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d".toLowerCase() && outAddress.toLowerCase() != "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3".toLowerCase()){
                  mainToken = outAddress
                  type = "🔴Sell"
                }
                dexscreener = dexscreener + "bsc/" + mainToken
                gmgn = gmgn + "bsc/token/" + mainToken
                scanner = scanner + txHash
                wExplorer = "https://bscscan.com/address/"+from
              }

              if(chain == "ethereum"){
                if(outAddress.toLowerCase() != "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase() && outAddress.toLowerCase() != "0xdAC17F958D2ee523a2206206994597C13D831ec7".toLowerCase() && outAddress.toLowerCase() != "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase() && outAddress.toLowerCase() != "0x6B175474E89094C44Da98b954EedeAC495271d0F".toLowerCase()){
                  mainToken = outAddress
                  type = "🔴Sell"
                }
                dexscreener = dexscreener + "ethereum/" + mainToken
                gmgn = gmgn + "eth/token/" + mainToken
                scanner = "https://etherscan.io/tx/" + txHash
                wExplorer = "https://etherscan.io/address/"+from
                scanLink = "https://etherscan.io/token/"
                chain = "eth"
              }

              if(chain == "base"){
                if(outAddress.toLowerCase() != "0x4200000000000000000000000000000000000006".toLowerCase() && outAddress.toLowerCase() != "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913".toLowerCase()){
                  mainToken = outAddress
                  type = "🔴Sell"
                }
                dexscreener = dexscreener + "base/" + mainToken
                gmgn = gmgn + chain +"/token/" + mainToken
                scanner = "https://basescan.org/tx/" + txHash
                wExplorer = "https://basescan.org/address/"+from
                scanLink = "https://basescan.org/token/"
              }

              if(chain == "avax"){
                if(outAddress.toLowerCase() != "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7".toLowerCase() && outAddress.toLowerCase() != "0xc7198437980c041c805A1EDcbA50c1Ce5db95118".toLowerCase() && outAddress.toLowerCase() != "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E".toLowerCase()){
                  mainToken = outAddress
                  type = "🔴Sell"
                }
                dexscreener = dexscreener + "avalanche/" + mainToken  
                gmgn = ""         
                scanner = "https://snowscan.xyz/tx/" + txHash
                wExplorer = "https://snowscan.xyz/address/"+from
                scanLink = "https://snowscan.xyz/token/"
              }

              let links = ""
              if(gmgn != ""){
                links = "<a href='"+scanner+"'>TX</a> | <a href='"+gmgn+"'>GMGN</a> | <a href='"+dexscreener+"'>DEXSCRENER</a>" 
              }else{
                links = "<a href='"+scanner+"'>TX</a> | <a href='"+dexscreener+"'>DEXSCRENER</a>" 
              }

              let inLink = "<a href ='"+scanLink+inAddress+"'>"+inToken[Object.keys(inToken)[0]].token+"</a>"
              let outLink = "<a href ='"+scanLink+outAddress+"'>"+outToken[Object.keys(outToken)[0]].token+"</a>"
              const walletDisplay = user.name ? `<a href="${wExplorer}">${user.name}</a>` : `<a href="${wExplorer}">${from}</a>`;
              if (inValue > 0 && outValue > 0) {
                let notificationMessage = type +" ( "+chain.toUpperCase()+" ) " + "\n💳"+walletDisplay+" \n\n⬆️"+parseFloat(parseFloat(outValue).toFixed(3)).toLocaleString()+"($"+parseFloat(parseFloat(outValueUsd).toFixed(3)).toLocaleString()+") "+outLink+" (MC: $"+parseFloat(parseFloat(outValueMc).toFixed(0)).toLocaleString()+")\n🔸SWAP FOR:\n⬇️"+parseFloat(parseFloat(inValue).toFixed(3)).toLocaleString()+"($"+parseFloat(parseFloat(inValueUsd).toFixed(3)).toLocaleString()+") "+inLink+" (MC: $"+parseFloat(parseFloat(inValueMc).toFixed(0)).toLocaleString()+")\n\n<code>"+mainToken+"</code>\n\n"+links
                await sendTradeNotification(user, notificationMessage);
              }
            }
          }
        }
      }
    }

    if (message.message && (message.message.type === 'blockDataContracts' || message.message.type === "blockDataCaUpdates")) {
    
      const contracts = message.message.data;
      const chainConfig = getChainConfigs(message.message.chain);
      const entryChain = chainConfig.chainName.toLowerCase();
      const isUpdate = message.message.type === "blockDataCaUpdates";
      
      for (const key in contracts) {
        const entry = contracts[key];
        const entryType = entry?.type?.toLowerCase();  // Expected to be 'token' or 'pair'
        //console.log(entry);

       /*  if(!isUpdate && entryType == "token"){
          console.log("------------------------->")
          console.log(entry.contractDeployer)
        } */
        // -----------------------------
        // 1) For a name-based filter (e.g., /watch token name=banana)
        // -----------------------------
        // This scenario applies only to entries of type 'token'
        if (entryType === 'token' && entry.info && !isUpdate) {
          // Query all Watch documents that were set via name (i.e. no explicit contract)
          const nameWatches = await Watch.find({
            type: 'token',
            chatId: { $exists: true },
            // Assuming that if contractAddress is not provided, user used a name filter
            $or: [
              { contractAddress: { $exists: false } },
              { contractAddress: null }
            ],
            name: { $exists: true }
          });
          for (const watchDoc of nameWatches) {
            
            // Check chain: if user set chain to "all" or if their chain list includes this entry's chain.
            const userChain = watchDoc.chain ? watchDoc.chain.toLowerCase() : "all";
            if (userChain !== "all" && !userChain.split(',').includes(entryChain)) {
              //continue;
            }else{
              const searchText = watchDoc.name.toLowerCase();
              // If the entry's info.name or symbol (converted to lower-case) includes the search text...
              if (
                (entry.info.name && entry.info.name.toLowerCase().includes(searchText)) ||
                (entry.info.symbol && entry.info.symbol.toLowerCase().includes(searchText))
              ) {
  
                if(entry.info.listed == true || entry.info.listed == "true"){
                 // continue;
                }else{
                  // Send a notification alerting the user.
                  const scanner = chainConfig.scannerBase ? chainConfig.scannerBase + "/tx/" + entry.txHash : "";
                  const caLink = chainConfig.scannerBase ? chainConfig.scannerBase + "/address/" + entry.contractAddress : "";
                  const owLink = chainConfig.scannerBase ? chainConfig.scannerBase + "/address/" + entry.contractDeployer : "";
                  const dexLink = chainConfig.dexscreenerBase ? chainConfig.dexscreenerBase + entry.contractAddress : "";
                  const gmgnLink = chainConfig.gmgnBase ? chainConfig.gmgnBase + entry.contractAddress : "";
                  
                  const notificationMessage = 
                    `<b>📑 New Contract Alert (${chainConfig.chainName})</b>\n` +
                    `🔸Filter by name: <code>${searchText}</code>\n` +
                    `Name: <b>${entry.info.name}</b> (<code>${entry.info.symbol}</code>)\n` +
                    `Contract: <code>${entry.contractAddress}</code>\n` +
                    `Deployer: <code>${entry.contractDeployer}</code>\n` +
                    `Supply: <code>${entry.info.totalSupply}</code> (decimals: <code>${entry.info.decimals}</code>)\n\n` +
                    `Links: ` +
                    `<a href="${scanner}">TX</a> | ` +
                    `<a href="${caLink}">CA</a> | ` +
                    `<a href="${owLink}">OW</a>` +
                    (gmgnLink ? ` | <a href="${gmgnLink}">GMGN</a>` : ``) +
                    (dexLink ? ` | <a href="${dexLink}">DEXSCREENER</a>` : ``);
                  
                  // Send an alert to the user (watchDoc holds the watch settings, including their chatId/userId)
                  await sendTradeNotification(watchDoc, notificationMessage);
                }
               
              }
            }
           
          }
        }
      /*   if (!isUpdate && entryType == "token") {
          console.log("DEBUG: Second check entry.contractDeployer = ", entry.contractDeployer);
        } */
       

       
        // -----------------------------
        // 3) For filter = 'pair'
        // -----------------------------
        // This scenario applies when entryType === 'pair'
        if (entryType === 'pair' && !isUpdate) {
         // console.log("Processing pair entry:", entry);
          // Create case-insensitive regexes for token0 and token1 based on the entry.
          const token0Regex = entry.token0 ? new RegExp("^" + entry.token0 + "$", "i") : undefined;
          const token1Regex = entry.token1 ? new RegExp("^" + entry.token1 + "$", "i") : undefined;
          const filterRegex = /^pair$/i;
          
          // Find Watch documents with filter "pair" that match token0...
          const token0Watches = token0Regex ? await Watch.find({
            type: 'token',
            chatId: { $exists: true },
            contractAddress: token0Regex,
            filter: filterRegex
          }) : [];
          
          // ...and likewise for token1.
          const token1Watches = token1Regex ? await Watch.find({
            type: 'token',
            chatId: { $exists: true },
            contractAddress: token1Regex,
            filter: filterRegex
          }) : [];
          
          // Combine the two arrays.
          const pairWatches = token0Watches.concat(token1Watches);
         // console.log("Found pair watches:", pairWatches);
          
          for (const watchDoc of pairWatches) {
            // Check chain: if the user's chain is not "all" and does not include the entry's chain, skip.
            const userChain = watchDoc.chain ? watchDoc.chain.toLowerCase() : "all";
            if (userChain !== "all" && !userChain.split(',').includes(entryChain)) {
             // console.log(`Skipping watch ${watchDoc._id} due to chain mismatch (userChain: ${userChain}, entryChain: ${entryChain})`);
              continue;
            }else{
                // Determine the "main" token based on which regex matches.
                let mainToken;
                if (watchDoc.contractAddress && token0Regex && token0Regex.test(watchDoc.contractAddress)) {
                  mainToken = entry.infoToken0;
                } else if (watchDoc.contractAddress && token1Regex && token1Regex.test(watchDoc.contractAddress)) {
                  mainToken = entry.infoToken1;
                } else {
                  // Fallback: default to token0.
                  mainToken = entry.infoToken0;
                }
                
                // Build URL links using chainConfig.
                const chainConfig = getChainConfigs(message.message.chain);
                const scanner = chainConfig.scannerBase ? `${chainConfig.scannerBase}/tx/${entry.txHash}` : "";
                // For each token in the pair, we build a link to its contract address.
                const caLink0 = chainConfig.scannerBase ? `${chainConfig.scannerBase}/address/${entry.infoToken0.token}` : "";
                const caLink1 = chainConfig.scannerBase ? `${chainConfig.scannerBase}/address/${entry.infoToken1.token}` : "";
                
                // Compose a formatted notification message.
                const notificationMessage =
                  `<b>🫂 New Pair Alert (${chainConfig.chainName})</b>\n` +
                  `🔹 Filter: Listed <code>${entry.dexName}</code>\n` +
                  `Pair: <b>${entry.infoToken0.symbol} / ${entry.infoToken1.symbol}</b>\n` +
                  `└CA: <code>${entry.pairAddress}</code>\n` +
                  `└Pool: <b>${parseFloat(entry.infoToken0.pairInfo.balToken).toLocaleString()}</b> ${entry.infoToken0.symbol} / ` +
                  `<b>${parseFloat(entry.infoToken1.pairInfo.balCurrency).toLocaleString()}</b> ${entry.infoToken1.currencySymbol}\n\n` +
                  `Links: ` +
                  `<a href="${scanner}">TX</a> | ` +
                  `<a href="${caLink0}">CA (${entry.infoToken0.symbol})</a> | ` +
                  `<a href="${caLink1}">CA (${entry.infoToken1.symbol})</a>`;
                
                // console.log("Pair Notification Message:", notificationMessage);
                
                // Send the alert notification to the user.
                await sendTradeNotification(watchDoc, notificationMessage);
            }
            
           
          }
        }
        
        /* if (!isUpdate && entryType == "token") {
          console.log("DEBUG: Third check entry.contractDeployer = ", entry.contractDeployer);
        } */
        // -----------------------------
        // 4) For filter = 'wallet'
        // -----------------------------
        // Applies only to token entries.

        if(!isUpdate && entryType == "token"){
          const walletWatches = await Watch.find({
            type: 'token',
            chatId: { $exists: true },
            filter: 'wallet'
          });
         
          for (const watchDoc of walletWatches) {
            const userChain = watchDoc.chain ? watchDoc.chain.toLowerCase() : "all";
            if (userChain !== "all" && !userChain.split(',').includes(entryChain)) {
             // console.log(`Skipping watch ${watchDoc._id} due to chain mismatch (userChain: ${userChain}, entryChain: ${entryChain})`);
              //continue;
            }else{
            // Check if the entry's contract deployer matches the wallet address stored in watchDoc.
            if (entry.contractDeployer && watchDoc.contractAddress) {
              if (entry.contractDeployer.toLowerCase() === watchDoc.contractAddress.toLowerCase()) {
                // Build URL links using the chain configuration.
                const scanner = chainConfig.scannerBase ? `${chainConfig.scannerBase}/tx/${entry.txHash}` : "";
                const caLink = chainConfig.scannerBase ? `${chainConfig.scannerBase}/address/${entry.contractAddress}` : "";
                const owLink = chainConfig.scannerBase ? `${chainConfig.scannerBase}/address/${entry.contractDeployer}` : "";
                const dexLink = chainConfig.dexscreenerBase ? `${chainConfig.dexscreenerBase}${entry.contractAddress}` : "";
                const gmgnLink = chainConfig.gmgnBase ? `${chainConfig.gmgnBase}${entry.contractAddress}` : "";
                // Compose the notification message.
                const notificationMessage =
                  `<b>🚀 New Token from Watched Wallet (${chainConfig.chainName})</b>\n` +
                  `📝 Name: <b>${entry.info.name}</b> (<code>${entry.info.symbol}</code>)\n` +
                  `💳 Contract: <code>${entry.contractAddress}</code>\n` +
                  `👤 Deployer: <code>${entry.contractDeployer}</code>\n` +
                  `📊 Supply: <code>${entry.info.totalSupply}</code> (decimals: <code>${entry.info.decimals}</code>)\n` +                  
                  `🔗 Links: ` +
                  `<a href="${scanner}">TX</a> | ` +
                  `<a href="${caLink}">CA</a> | ` +
                  `<a href="${owLink}">OW</a>` +
                  (gmgnLink ? ` | <a href="${gmgnLink}">GMGN</a>` : ``) +
                  (dexLink ? ` | <a href="${dexLink}">DEXSCREENER</a>` : ``);
                
                //console.log("Wallet Filter Notification Message:", notificationMessage);
                
                // Send the alert notification to the user.
                await sendTradeNotification(watchDoc, notificationMessage);
              }
            }
            }

          }
        }
        
         // -----------------------------
        // 2) For filter = 'listed'
        // -----------------------------
        // Applies only to entries with type 'token'
      /*   if (!isUpdate && entryType == "token") {
          console.log("DEBUG: Last check entry.contractDeployer = ", entry.contractDeployer);
        } */
        if (entryType === 'token' || message.message.type === "blockDataCaUpdates") {         
          // For new contract creations, only proceed if the entry is marked as listed.
          if (!isUpdate && (entry.info.listed === false || entry.info.listed === "false")) {
            //continue;
          }else{
            if (isUpdate && entry.listed === "false") {
              //continue;
            }else{
              let mainToken = null
              if(isUpdate){            
                mainToken = entry.token  
              }else{
                mainToken = entry.contractAddress            
              }
             
              // Use a case-insensitive regex for contract address and filter
              const contractRegex = mainToken 
                ? new RegExp("^" + mainToken + "$", "i")
                : undefined;
              const filterRegex = /^listed$/i;
              
              // Find watches with filter "listed" for this contract.
              const listedWatches = await Watch.find({
                type: 'token',
                chatId: { $exists: true },
                contractAddress: contractRegex,
                filter: filterRegex
              });
              
              for (const watchDoc of listedWatches) {
                const userChain = watchDoc.chain ? watchDoc.chain.toLowerCase() : "all";
                if (userChain !== "all" && !userChain.split(',').includes(entryChain)) {
                  //console.log(`Skipping watch ${watchDoc._id} due to chain mismatch (userChain: ${userChain}, entryChain: ${entryChain})`);
                  //continue;
                }else{
                // Build URL links using the chain configuration.            
                const caLink = chainConfig.scannerBase ? `${chainConfig.scannerBase}/address/${mainToken}` : "";
                const dexLink = chainConfig.dexscreenerBase ? `${chainConfig.dexscreenerBase}${mainToken}` : "";
                const gmgnLink = chainConfig.gmgnBase ? `${chainConfig.gmgnBase}${mainToken}` : "";
                
                // Compose the notification message differently for new contracts vs. updates.
                let notificationMessage = "";
                if (!isUpdate) {
                  notificationMessage =
                    `<b>✅ New Launch Alert (${chainConfig.chainName})</b>\n` +
                    `🔸 Filter: Listed <code>${entry.info.dexName}</code>\n` +
                    `📝 Name: <b>${entry.info.name}</b> (<code>${entry.info.symbol}</code>)\n` +
                    `💳 CA: <code>${mainToken}</code>\n` +
                    `💰 Mcap: <code>$${parseFloat(entry.info.info.mcap).toLocaleString()}</code>\n` +
                    `🏦 Pool: <code>${parseFloat(entry.info.pairInfo.balToken).toLocaleString()}</code> (${entry.info.symbol}) / <code>${parseFloat(entry.info.pairInfo.balCurrency).toLocaleString()}</code> (${entry.info.currencySymbol})\n` +
                    `📉 Taxes: B: <code>${entry.info.buyTax}</code> | S: <code>${entry.info.sellTax}</code> | T: <code>${entry.info.transferTax}</code>\n\n`;
                } else {
                  notificationMessage =
                    `<b>✅ New Launch Alert (${chainConfig.chainName})</b>\n` +
                    `🔸 Filter: Listed <code>${entry.dexName}</code>\n` +
                    `📝 Name: <b>${entry.name}</b> (<code>${entry.symbol}</code>)\n` +
                    `💳 CA: <code>${mainToken}</code>\n` +
                    `💰 Mcap: <code>$${parseFloat(entry.info.mcap).toLocaleString()}</code>\n` +
                    `🏦 Pool: <code>${parseFloat(entry.pairInfo.balToken).toLocaleString()}</code> (${entry.symbol}) / <code>${parseFloat(entry.pairInfo.balCurrency).toLocaleString()}</code> (${entry.currencySymbol})\n` +
                    `📉 Taxes: B: <code>${entry.buyTax}</code> | S: <code>${entry.sellTax}</code> | T: <code>${entry.transferTax}</code>\n\n`;
                }
                
                // Append common links
                notificationMessage += `🔗 Links: ` +              
                  `<a href="${caLink}">CA</a> | `+
                  (gmgnLink ? ` | <a href="${gmgnLink}">GMGN</a>` : ``) +
                  (dexLink ? ` | <a href="${dexLink}">DEXSCREENER</a>` : ``);
                
                //console.log("Notification Message:", notificationMessage);
                
                // Send the alert notification
                await sendTradeNotification(watchDoc, notificationMessage);
                
                // Remove the filter so the alert is only sent once.
                await Watch.deleteOne({ _id: watchDoc._id });
                }
              }
            }
         
          }
          
        }
      }
    }
  } catch (error) {
    console.error('Error processing message:', error.message);
  }
});

// Event listener for WebSocket errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error.message);
});

// Event listener for WebSocket connection close
ws.on('close', () => {
  console.log('WebSocket connection closed');
});

function initializeCryptoWatchers(bot) {
  console.log('✅ Crypto alert watchers are live');
}

module.exports = {
  initializeCryptoWatchers
};
