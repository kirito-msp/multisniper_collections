// worker.js
const { parentPort } = require('worker_threads');
const { ethers } = require('ethers');

const providers = {}; // Cache providers per chain.

function getProvider(rpcWsUrl, chain) {
  // Reuse provider for a chain if it exists, otherwise create a new one.
  if (!providers[chain]) {
    providers[chain] = new ethers.providers.WebSocketProvider(rpcWsUrl);
  }
  return providers[chain];
}

async function processBlock(message) {
  const { chain, blockNumber, rpcWsUrl } = message;
  // Retrieve (or create) the provider for this chain.
  const provider = getProvider(rpcWsUrl, chain);
  console.log(`Worker ${process.pid} processing block ${blockNumber} on chain ${chain}`);
  
  // Replace this simulated delay with your actual block processing logic.
  // For example: const block = await provider.getBlockWithTransactions(blockNumber);
  await new Promise(resolve => setTimeout(resolve, 6000));
  
  return `Block ${blockNumber} on chain ${chain} processed by worker ${process.pid}`;
}

parentPort.on('message', async (message) => {
    console.log(message)
   try {
    const result = await processBlock(message);
    parentPort.postMessage({ result, chain: message.chain, blockNumber: message.blockNumber });
  } catch (error) {
    parentPort.postMessage({ error: error.toString(), chain: message.chain, blockNumber: message.blockNumber });
  } 
});
