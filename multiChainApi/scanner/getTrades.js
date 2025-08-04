const express = require('express');
const mongoose = require('mongoose');
const { ethers, providers, Contract } = require('ethers');
const config = require('../config.json');
const tokenInfoABI = require('../abis/tokenInfo.json');
const app = express();
const port = 3124;
const { Telegraf, Markup } = require('telegraf');

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
    1: "YOUR TELEGRAM BOT TOKEN",
    2: "YOUR TELEGRAM BOT TOKEN",
    3: "YOUR TELEGRAM BOT TOKEN",
    4: "YOUR TELEGRAM BOT TOKEN",
    5: "YOUR TELEGRAM BOT TOKEN",
}

const teleTopicID = {
    1: 58483,
    2: 58485,
    3: 58489,
    4: 58487,
    5: 58535,
}

const providerRpc = {
    1: config.bsc.wsUrl,
    2: config.ethereum.wsUrl,
    3: config.base.wsUrl,
    4: config.avax.wsUrl
}

const ERC20_ABI = [
    "function balanceOf(address account) external view returns (uint256)",
    "function totalSupply() external view returns (uint256)"
  ];

const mongoUri = `mongodb://${config.mongodb.user}:${encodeURIComponent(config.mongodb.password)}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}?authSource=multiChainApi`;

mongoose.connect(mongoUri).then(() => {
   // console.log('MongoDB connected successfully');
}).catch((err) => {
   // console.error('MongoDB connection error:', err);
});

async function getNewContracts(){
    try {
        let bscNewContracts = await BscContract.find({ updatePost: true });
        let ethNewContracts = await EthContract.find({ updatePost: true });
        let baseNewContracts  = await BaseContract.find({ updatePost: true });
        let avaxNewContracts  = await AvaxContract.find({ updatePost: true });
        let sonicNewContracts  = await SonicContract.find({ updatePost: true });

        for (const [key] of Object.entries(bscNewContracts)) {
            console.log(bscNewContracts[key])
            process.exit(0)
        }
        //console.log(ethNewContracts)
        //console.log(baseNewContracts)
        //console.log(avaxNewContracts)
        //console.log(sonicNewContracts)
     
    } catch (err) {
        console.error('Error fetching new contracts:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

app.use(express.json());

// POST endpoint at /data
app.post('/data', (req, res) => {  
  //console.dir(req.body, { depth: null }); 
 // postToTg(req.body.chain,req.body.data)
  console.log(req.body.chain,req.body.data)
  res.status(200).send('Data received!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function postToTg(chain,data){
    try{
        let chainScanner = "bscscan.com"
        let currency = "BNB"
        let url = "https://dexscreener.com/bsc/"
        let cielo = "https://app.bubblemaps.io/bsc/token/"
        if(chain == 2){
            chainScanner = "etherescan.io"
            currency = "ETH"
            url = "https://dexscreener.com/ethereum/"
            cielo = "https://app.bubblemaps.io/eth/token/"
        }else if(chain == 3){
            chainScanner = "basescan.org"
            currency = "ETH"
            url = "https://dexscreener.com/base/"
            cielo = "https://app.bubblemaps.io/base/token/"
        }else if(chain == 4){
            chainScanner = "snowscan.xyz"
            currency = "AVAX"
            url = "https://dexscreener.com/avalanche/"
            cielo = "https://app.bubblemaps.io/avax/token/"
        }else if(chain == 5){
            chainScanner = "146.routescan.io"
            currency = "SONIC"
            url = "https://dexscreener.com/sonic/"
            cielo = "https://app.bubblemaps.io/sonic/token/"
        }
        const provider = new ethers.providers.WebSocketProvider(providerRpc[chain])
        const tokenCa = new Contract(data.contractAddress, ERC20_ABI, provider);
        let balanceInCa = 0.00
        try{
            if(data.totalSupply != 0 && data.totalSupply != '0'){
                balanceInCa = parseFloat(await tokenCa.balanceOf(data.contractAddress) /10**data.decimals).toFixed(0);
                balanceInCa = parseFloat(parseFloat(balanceInCa) / parseFloat(parseFloat(await tokenCa.totalSupply() /10**data.decimals).toFixed(0)) *100).toFixed(2)
            }
        }catch(e){        
        } 
        let devFunds = parseFloat(await provider.getBalance(data.contractCreator) /10**18).toFixed(3)

        let newMessage = "<a href='https://"+chainScanner+"/tx/"+data.txHash+"'>"+data.name + "</a> ("+data.symbol+")\n└Unique Hash: #"+data.hashCode+"\n└Clog: <code>"+balanceInCa+"</code>%\n" + "└Ca: <code>"+data.contractAddress+"</code>\n└Supply: <code>"+data.totalSupply+"</code>(<code>"+data.decimals+"</code>)\n└Dev: <code>"+data.contractCreator+"</code>\n└Dev Funds: <code>"+devFunds+"</code> " + currency
        let hasData = false
        if(data.launched.status == true){
            
            let liveDataToken = await checkToken(data.contractAddress,chain,provider)
            hasData = liveDataToken

            if(liveDataToken != false){
                let buyEnabled = "🚫"
                if(liveDataToken.trading.buyEnabled == true){
                    buyEnabled = "✅"
                }
                let sellEnabled = "🚫"
                if(liveDataToken.trading.sellEnabled == true){
                    sellEnabled = "✅"
                }
                newMessage += "\n\n📝Statistics:\n└Launched: <code>"+liveDataToken.dexName+"</code>\n└Mcap: <code>$"+liveDataToken.info.mcap+"</code>\n└Pool: <code>"+parseFloat(liveDataToken.pairInfo.balToken).toLocaleString()+"</code> " +liveDataToken.symbol+" / <code>" + liveDataToken.pairInfo.balCurrency+"</code> "+currency+"\n└Burned: <code>"+liveDataToken.burned+"</code>\n"
                newMessage += "└Taxes: B <code>"+liveDataToken.buyTax+"</code>% | S <code>" +liveDataToken.sellTax+"</code>% | T <code>" +liveDataToken.transferTax+"</code>%\n"
                newMessage += "└Gase fee: B <code>$"+parseFloat(liveDataToken.gasFeeTx.buyGas).toFixed(4)+"</code> | S <code>$" +parseFloat(liveDataToken.gasFeeTx.sellGas).toFixed(4)+"</code>\n"
                newMessage += "└Trading: B "+buyEnabled+" | S " +sellEnabled+"\n"
            }       
        }
        newMessage += "\n\n<a href ='"+url+data.contractAddress+"'>DexScreener</a> | <a href ='https://x.com/search?q=($"+data.symbol+" OR "+data.contractAddress+")&src=typed_query'>Search X.com</a> | <a href ='https://app.cielo.finance/profile/"+data.contractAddress+"/pnl/tokens'>Cielo</a> | <a href ='"+cielo+data.contractAddress+"'>BubleMaps</a>\n"        
        newMessage += "\n\n⚒️Creation time: "+await formatTime(data.timestamp)+""
        if (hasData != false && data.pairs.length > 0) {
        newMessage += "\n📈Launch time: "+await formatTime(data.pairs[0].timestamp)+""
        let timeBetween = data.pairs[0].timestamp - data.timestamp
        const days = Math.floor(timeBetween / (24 * 3600));
        const remainderAfterDays = timeBetween % (24 * 3600);
        const hours = Math.floor(remainderAfterDays / 3600);
        const remainderAfterHours = remainderAfterDays % 3600;
        const minutes = Math.floor(remainderAfterHours / 60);
        const seconds = remainderAfterHours % 60;
        newMessage += `\n🕚Launched in: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds.`;
        }
        
        
        try{
            const grupDev = "YOUR TG GROUP OR CHANNEL ID TO SEND MESSAGES"
            const botMain = new Telegraf(teleGramBot[chain]);
            //console.log(newMessage)
            if(data.messageId > 0){ 
                botMain.telegram.editMessageText(
                    grupDev,
                    data.messageId, 
                    null, 
                    newMessage,
                    { parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        message_thread_id: teleTopicID[chain]  
                    } 
                ).then(() => {
                // console.log("Message edited successfully!");
                }).catch((error) => {
                    //console.error("Error editing message:", error);
                });
            }else{
                botMain.telegram.sendMessage(grupDev, newMessage, {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    message_thread_id: teleTopicID[chain]          
                }).then((m) => {
                    //update m.message_id;  
                    updateMessageId(data._id, m, chain)
                }).catch((error) => {
                    console.error("Error editing message:", error);
                });
            }
        
        }catch(e){
            console.log(e)
        }  
    }catch(e){
        console.log(e)
    }
}

async function formatTime(timestamp){  
    try{
        const date = new Date(timestamp * 1000); // convert to milliseconds
    
        // Format parts with leading zeros if needed
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        
        const formattedUTC = `${hours}:${minutes}:${seconds} ${day}.${month}.${year}`;
        return formattedUTC
    } catch(e){
        return "00:00:00 00.00.0000"
        console.log(e)
    }
   
}

async function updateMessageId(docId, m, chain) {
    try {
      const ContractModel = chainContractModel[chain];
      const updateResult = await ContractModel.updateOne(
        { _id: docId },
        { $set: { messageId: m.message_id } }
      );
      //console.log("Update result:", updateResult);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  }