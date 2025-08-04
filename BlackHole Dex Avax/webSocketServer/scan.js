const mongoose = require('mongoose');
const { Telegraf } = require('telegraf');
const { ethers, providers } = require('ethers');
const config = require('./config.json');
const tokenInfoABI = require('./abis/tokenInfo.json');
const ContractModel = require('./models/Contract');
const CreatorModel = require('./models/Creators');
const { getInfoAboutTwitter } = require('./arenaApiScrape');
const axios = require('axios');

const mongoUri = `mongodb://${config.mongodb.user}:${encodeURIComponent(config.mongodb.password)}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}?authSource=arenaAvaxDb`;


const tokenCreatedAbi = [
  "event TokenCreated(uint256 tokenId, tuple(uint128 curveScaler, uint16 a, uint8 b, bool lpDeployed, uint8 lpPercentage, uint8 salePercentage, uint8 creatorFeeBasisPoints, address creatorAddress, address pairAddress, address tokenContractAddress) params, uint256 tokenSupply)"
];

const iface = new ethers.utils.Interface(tokenCreatedAbi);

mongoose.connect(mongoUri).then(() => {
    console.log('MongoDB connected successfully');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});


const provider = new providers.WebSocketProvider(config.avax.wsUrl);

async function main(){
                provider.on('block', async (blockNumber) => {
  
                     const block = await provider.getBlockWithTransactions(blockNumber);
                     try {
                         if (!block || block.transactions.length === 0) {
                             return;
                         }
        
                         for (const tx of block.transactions) {
                            if(tx.to && tx.to.toLowerCase() == "0x8315f1eb449Dd4B779495C3A0b05e5d194446c6e".toLowerCase() && tx.data.includes("0x30f51a46")){
                            const receipt = await provider.getTransactionReceipt(tx.hash);
                             if (receipt.status == 1) {
                             
                                 for (const log of receipt.logs) {
                                     if (log.topics[0]) {
                                         if (log.topics[0].toLowerCase() === "0x9d75ceea73ecd0b028445324402292e1672e8569a4baef809067e859e205df03") {
                                           const decoded = iface.decodeEventLog("TokenCreated", log.data, log.topics);

                                            const tokenId = decoded.tokenId.toString();
                                            const tokenSupply = decoded.tokenSupply.toString();
                                            const params = decoded.params;

                                         /*    console.log("✅ Token Created");
                                            console.log("Token ID:", tokenId);
                                            console.log("Curve Scaler:", params.curveScaler.toString());
                                            console.log("a:", params.a);
                                            console.log("b:", params.b);
                                            console.log("LP Deployed:", params.lpDeployed);
                                            console.log("LP %:", params.lpPercentage);
                                            console.log("Sale %:", params.salePercentage);
                                            console.log("Creator Fee BP:", params.creatorFeeBasisPoints);
                                            console.log("Creator Address:", params.creatorAddress);
                                            console.log("Pair Address:", params.pairAddress);
                                            console.log("Token Contract Address:", params.tokenContractAddress);
                                            console.log("Token Supply:", tokenSupply);    */

                                            let dataCreation = {
                                                tokenId: tokenId,
                                                contractAddress: params.tokenContractAddress,
                                                creatorAddress: params.creatorAddress,                              
                                                pairAddress: params.pairAddress,
                                                tokenSupply: tokenSupply,
                                                lpDeployed: params.lpDeployed,
                                                lpPercent: params.lpPercentage,
                                                salePercent: params.salePercentage
                                            }

                                            saveNewContractMongo(dataCreation)
                                        } 
                                     }
                                 }                                 
                             }
                            }else if(tx.data){
                                let isTransfer = false
                                let islpCreated = false
                                let tokenAddress = null
                                 const receipt = await provider.getTransactionReceipt(tx.hash);
                             if (receipt.status == 1) {
                                 for (const log of receipt.logs) {
                                     if (log.topics[0]) {
                                         if (log.topics[0].toLowerCase() === "0xdcc4fdba730d4140e09644dcf79f9f343a8b7d60341eb38ef5ef5315f0b513c9") {
                                            islpCreated = true
                                         }
                                          if (log.topics[0].toLowerCase() === "0xb8b26cb164ca3ed6e34e10a7033252fa64523361f0dfd876faab3329c54efbb6") {
                                            isTransfer = true
                                         }

                                          if (log.topics[0].toLowerCase() === "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0") {
                                            tokenAddress = log.address
                                         }
                                        }
                                    }
                                }
                                    if(isTransfer == true && islpCreated == true && tokenAddress != null){
                                        //Bounding detection !
                                        let contractInfo = await getContractFromDb(tokenAddress)
                                        if(contractInfo != null){
/*                                         console.log("🌟 Arena new token bounded: " + tokenAddress)
                                        console.log(tx) */                                          
                                             const watchData = { type: "migration", data: contractInfo };
                                                sendDataToWebSocketClients(watchData);
                                        }                                                   
                                    }
                               
                            }

                         }
                 
                     } catch (e) {
                         console.log(e);
                     }
                });
}

async function getContractFromDb(tokenAddress) {
    if (!tokenAddress) {
        console.warn('⚠️ No token address provided');
        return null;
    }

    try {
        const contract = await ContractModel.findOne({
            contractAddress: { $regex: new RegExp(`^${tokenAddress}$`, 'i') }
        });

        if (contract) {
            console.log(`✅ Found contract in DB: ${contract.contractAddress}`);
            return contract;
        } else {
            console.log(`🔍 No contract found in DB for: ${tokenAddress}`);
            return null;
        }
    } catch (err) {
        console.error(`❌ Error in getContractFromDb:`, err.message);
        return null;
    }
}

const storeContract = async (contractInfo) => {
    try {
        if (contractInfo) {
            const existingContract = await ContractModel.findOne({ contractAddress: contractInfo.contractAddress });
            if (existingContract) {
                //console.log(`Contract ${contractInfo.contractAddress} already exists in the database.`);
                return; // Skip saving the contract
            }

            const newContract = new ContractModel(contractInfo);
            //console.log('Contract Info to be stored:', contractInfo); // Log the incoming contract info
           // console.log('New Contract Object:', newContract.toObject()); // Check the Mongoose object

            await newContract.save();
            console.log(`✅ Stored contract: ${contractInfo.symbol} (${contractInfo.contractAddress})`);
            //console.log(`Contract ${contractInfo.contractAddress} stored in the database. Block ${contractInfo.block}`);
        } else {
            console.log(`Could not fetch details for contract ${contractInfo.contractAddress}.`);
        }
    } catch (error) {
        console.error('Error in storeContract:', error);
    }
};

function sanitizeName(name) {
    // Remove all special characters except letters and numbers
    const sanitized = name.replace(/[^a-zA-Z0-9]/g, '');
    // Return the first 15 characters of the sanitized name
    return sanitized.substring(0, 20);
}

async function getContractInfo(contractAddress) {
    const contract = new ethers.Contract(contractAddress, tokenInfoABI, provider);
    let name = "unknown";
    let symbol = "unknown";
    let decimals = 0;
    let totalSupply = "0";
    try {
        name = sanitizeName(await contract.name());
    } catch (e) {}
    try {
        symbol = await contract.symbol();
    } catch (e) {}
    try {
        decimals = await contract.decimals();
    } catch (e) {}
    try {
        totalSupply = (await contract.totalSupply()).toString();
    } catch (e) {}

    return {
        name: name,
        symbol: symbol,
        decimals: decimals,
        totalSupply: totalSupply
    };
}

async function storeOrIncrementCreator(creatorAddress) {
    try {
        if (!creatorAddress) {
            console.warn('⚠️ Creator address is null or undefined. Skipping.');
            return null;
        }

        const existingCreator = await CreatorModel.findOne({ creatorAddress });

        if (existingCreator) {
            existingCreator.count += 1;
            await existingCreator.save();
            console.log(`🔄 Updated creator ${creatorAddress} count to ${existingCreator.count}`);
            return existingCreator.count;
        } else {
            const newCreator = new CreatorModel({
                creatorAddress: creatorAddress,
                count: 1
            });
            await newCreator.save();
            console.log(`🆕 Added new creator ${creatorAddress} with count 1`);
            return 1;
        }
    } catch (error) {
        console.error('Error in storeOrIncrementCreator:', error.message);
        return null;
    }
}


async function saveNewContractMongo(dataCreation) {
    try {
        const info = await getContractInfo(dataCreation.contractAddress);

        const contractInfo = {
            tokenId: dataCreation.tokenId,
            name: info.name,
            symbol: info.symbol,
            decimals: info.decimals,
            totalSupply: info.totalSupply,
            contractAddress: dataCreation.contractAddress,
            contractCreator: dataCreation.creatorAddress,
            pairAddress: dataCreation.pairAddress,
            lpDeployed: dataCreation.lpDeployed.toString(),
            lpPercent: dataCreation.lpPercent.toString(),
            salePercent: dataCreation.salePercent.toString(),
            xHandle: "none",
            xFollowers: "0", // String because schema expects string
            creationTime: Math.floor(Date.now() / 1000), // UNIX timestamp
            boundingCurve: 0
        };
        console.log(contractInfo.contractCreator)
      let deploys = await storeOrIncrementCreator(contractInfo.contractCreator)
      let scanApi = await getInfoAboutTwitter(contractInfo.contractAddress)
      if(scanApi.xHandle != null){
        contractInfo.xHandle = scanApi.xHandle
      }

      if(scanApi.xFollowers != 0){
        contractInfo.xFollowers = scanApi.xFollowers
      }
      let devPrevDeploys = deploys
      if(scanApi.prevDeploys > 1){
        devPrevDeploys = scanApi.prevDeploys
      }
            
      await storeContract(contractInfo);
           const watchData = { type: "creation", data: contractInfo };
            sendDataToWebSocketClients(watchData);
    } catch (error) {
        console.error('Error saving contract to MongoDB:', error);
    }
}


async function sendDataToWebSocketClients(message) {
  try {
    await axios.post('http://localhost:6160/send-data', { message });    
  } catch (error) {
    console.error('Error sending data to WebSocket clients:', error.message);
  }
}

main()