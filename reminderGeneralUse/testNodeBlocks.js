const { ethers } = require('ethers');

const httpRpcUrl = 'http://127.0.0.1:8547';
const wsRpcUrl = 'ws://127.0.0.1:8548';

// Test with HTTP Provider
async function testHttpProvider(blockNumber) {
    const provider = new ethers.providers.JsonRpcProvider(httpRpcUrl);
    try {
        const block = await provider.getBlockWithTransactions(blockNumber);
        console.log(`🔷 [HTTP] Block ${blockNumber}: ${block.transactions.length} transactions.`);
    } catch (error) {
        console.error('❌ HTTP Provider error:', error.message);
    }
}

// Test with WebSocket Provider
async function testWsProvider() {
    const provider = new ethers.providers.WebSocketProvider(wsRpcUrl);
    provider.on('block', async (blockNumber) => {
        try {
            const block = await provider.getBlockWithTransactions(blockNumber);
            console.log(`🔶 [WS] Block ${blockNumber}: ${block.transactions.length} transactions.`);
        } catch (error) {
            console.error('❌ WS Provider error:', error.message);
        }
    });

    provider._websocket.on('error', (err) => {
        console.error('⚠️ WebSocket Error:', err.message);
    });

    provider._websocket.on('close', () => {
        console.warn('⚠️ WebSocket closed.');
    });
}

// Specify a recent block number to test immediately via HTTP
const testBlockNumber = 'latest'; // You can replace 'latest' with a specific block number

testHttpProvider(testBlockNumber);
testWsProvider();
