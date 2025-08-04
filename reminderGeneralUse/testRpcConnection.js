const { ethers } = require('ethers');

async function testRpcConnection(rpcUrl) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    console.log(`🌐 Testing RPC connection to: ${rpcUrl}`);

    // Test by fetching latest block number
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Connected successfully! Current block number: ${blockNumber}`);

    // Fetch current gas price (extra validation)
    const gasPrice = await provider.getGasPrice();
    console.log(`⛽ Current gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`);
  } catch (error) {
    console.error(`❌ Connection failed: ${error.message}`);
  }
}

// Pass the RPC URL from command line argument
const rpcUrl = process.argv[2];

if (!rpcUrl) {
  console.error('⚠️  Please provide the RPC URL as an argument.');
  console.log('Example: node testRpcConnection.js https://bsc-dataseed.binance.org/');
  process.exit(1);
}

testRpcConnection(rpcUrl);
