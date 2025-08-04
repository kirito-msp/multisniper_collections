//require('dotenv').config();
const fss = require('fs');

function replaceEnvData(new_data){

    fss.readFile(env_file, 'utf8', function(err, data){
    
        if (err) return console.log(err);

        var result = data;

        Object.entries(new_data).forEach(entry => {
            const [key, value] = entry;

            result = result.replace(`${key} = ${process.env[key]}`, `${key} = ${value}`);

          });
        
        fs.writeFile(env_file, result, 'utf8', function (err) {
            if (err) return console.log(err);
            else {
                console.log("Update done.. RESTARTING!");    
                process.exit(0);
            }
        });
        
    });

}

function replaceEnvDataWitoutRestart(new_data){

    fss.readFile(env_file, 'utf8', function(err, data){
    
        if (err) return console.log(err);

        var result = data;

        Object.entries(new_data).forEach(entry => {
            const [key, value] = entry;

            result = result.replace(`${key} = ${process.env[key]}`, `${key} = ${value}`);

          });
        
        fs.writeFile(env_file, result, 'utf8', function (err) {
            if (err) return console.log(err);
            else {
               
            }
        });
        
    });

}

function customEnv(envData){

    const picked = (({snipeWithEther,sellOnfunction,sellFunctionHash,slippage,bscNodeCRONOS,max_transfer_gwei,buyMaxPriorityFeePerGas,buyMaxFeePerGas,sellMaxPriorityFeePerGas,sellMaxFeePerGas,snipeListingFromUnicrypt,to_transfer,amount_transfer,transferToken,token_transfer,transfer_gwei,transfer_gas,utilAction,snipePresale,presaleCurency,ownerWallet,selectPresale,swapContractPOLYGON,swapContractETH,swapContractBSC,choseMethode,claimTokens,snipefunction,antiHoneyPot,presale_address,presale_bnb_amount,presale_gas,presale_gwei,TokenContract,amount_BNB_buy,delay_on_buy_blocks,buy_Gwei,buy_Gas,sell_Gwei,sell_Gas,approveBeforeOrAfter,snipeOrBuy,exchangeToken,sellWithProffit,xvalue,sellDelay,nrOfSellTransactions,nrOfBuyTransactions,whiteListActive,presaleSarted,autoGasOnSnipe,needApproval,instantSell,sellAuto,antiRugActive,choseMarket,choseMode,choseBlockChain,privateKey,botName,openTrade,bscNodeBSC,bscNodeETH,bscNodePOLY,multiWalletsArray,sendMultiWallet,tokensArrayMonitor,frontrunnAmount,frontrunnMinTxValue,trakingWallet,snipeOnWalletCall,tg_wait_for_contract,tg_channel,tg_api_id,tg_api_hash,tg_secret_phrase,snipeExactTokens}) => ({sellOnfunction,sellFunctionHash,bscNodeCRONOS,max_transfer_gwei,buyMaxPriorityFeePerGas,buyMaxFeePerGas,sellMaxPriorityFeePerGas,sellMaxFeePerGas,snipeListingFromUnicrypt,to_transfer,amount_transfer,transferToken,token_transfer,transfer_gwei,transfer_gas,utilAction,snipePresale,presaleCurency,ownerWallet,selectPresale,swapContractPOLYGON,swapContractETH,swapContractBSC,choseMethode,claimTokens,snipefunction,antiHoneyPot,presale_address,presale_bnb_amount,presale_gas,presale_gwei,TokenContract,amount_BNB_buy,delay_on_buy_blocks,buy_Gwei,buy_Gas,sell_Gwei,sell_Gas,approveBeforeOrAfter,snipeOrBuy,exchangeToken,sellWithProffit,xvalue,sellDelay,nrOfSellTransactions,nrOfBuyTransactions,whiteListActive,presaleSarted,autoGasOnSnipe,needApproval,instantSell,sellAuto,antiRugActive,choseMarket,choseMode,choseBlockChain,privateKey,botName,openTrade,bscNodeBSC,bscNodeETH,bscNodePOLY,multiWalletsArray,sendMultiWallet,tokensArrayMonitor,frontrunnAmount,frontrunnMinTxValue,trakingWallet,snipeOnWalletCall,tg_wait_for_contract,tg_channel,tg_api_id,tg_api_hash,tg_secret_phrase,snipeExactTokens,slippage,snipeWithEther}))(envData);

    return picked;

}

