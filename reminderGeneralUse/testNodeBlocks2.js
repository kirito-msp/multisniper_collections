const { ethers } = require('ethers');

const wsRpcUrl = 'ws://127.0.0.1:8548';


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

testWsProvider();
