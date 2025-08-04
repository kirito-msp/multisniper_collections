const { ethers } = require('ethers');

// Your WebSocket RPC endpoint
const wsUrl = "ws://127.0.0.1:8548";
const provider = new ethers.providers.WebSocketProvider(wsUrl);

// Target contract and function
const TARGET_CONTRACT = "0x459F65A7aaB8c08220ac636Ef633508E697e15d8".toLowerCase();
const FN_SIG = "setWhitelistEnabled(bool)";


const { checkToken } = require('./snipeScript.js'); 
const { MaxInt256 } = require('@ethersproject/constants');

// Compute the 4-byte selector
const WHITELIST_SELECTOR = ethers.utils.id(FN_SIG).slice(0, 10);  
// e.g. '0x5d098b38'

// Set up an ABI coder for decoding the bool
const abiCoder = new ethers.utils.AbiCoder();
let trigger = false

async function main(){
  console.log("Snipe on tx data call monitoring...")
  let snipe = await checkToken(TARGET_CONTRACT,3,provider,false)  
  if(snipe == false){
    console.log("Please check the contract address!")
    process.exit(0)
  }else{
    console.log("Contract: " + snipe.token)
    console.log("Name: " + snipe.name)
    console.log("Symbol: " + snipe.symbol)
    console.log("Supply: " + snipe.totalSupply + " ("+snipe.decimals+")")
    if(snipe?.listed == "false"){
      console.log("Status: Not Launched!")
    }else{
      console.log("Status: Listed on " + snipe?.dexName)
      if(snipe?.info?.mcap > 0){
        console.log("Mcap: $" + parseFloat(snipe?.info?.mcap).toLocaleString())
      }
    }
  }
        
}

main()

provider.on('block', async (blockNumber) => {
  if(trigger == false){
    try {
      //console.log(`\n🔔 New block: ${blockNumber}`);
     // let test = await checkToken(TARGET_CONTRACT,3,provider)
      //console.log(test)
      const block = await provider.getBlockWithTransactions(blockNumber);
  
      for (const tx of block.transactions) {
        if (!tx.data || !tx.data.startsWith(WHITELIST_SELECTOR)) continue;
        if (!tx.to || tx.to.toLowerCase() !== TARGET_CONTRACT) continue;
  
        // Decode the bool argument (located in the next 32-byte slot)
        const encodedArg = "0x" + tx.data.slice(10); 
        const [enabled] = abiCoder.decode(["bool"], encodedArg);
  
        if (enabled === false) {
          console.log("🛑 Detected setWhitelistEnabled(false) call:");
          console.log(`  • Tx Hash: ${tx.hash}`);
          console.log(`  • From:    ${tx.from}`);
          console.log(`  • To:      ${tx.to}`);
          console.log(`  • Block:   ${blockNumber}`);
          console.log(`  • Data:    ${tx.data}`);
          console.log('');
          let snipe = await checkToken(TARGET_CONTRACT,3,provider,true)          
          console.log(snipe)
        }
      }
    } catch (err) {
      console.error('Error processing block', blockNumber, err);
    }
  }
});

