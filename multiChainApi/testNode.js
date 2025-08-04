// Import ethers.js
const { providers } = require('ethers');

// Define providers for the nodes you want to test
const providersArray = [
    { url: "ws://127.0.0.1:8548", provider: new providers.WebSocketProvider("ws://127.0.0.1:8548") },
    { url: "ws://65.109.105.143:8548", provider: new providers.WebSocketProvider("ws://65.109.105.143:8548") }
];

// Track block notifications to compare the reception time
providersArray.forEach((node, index) => {
    node.provider.on("block", (blockNumber) => {
        console.log(`Node ${index + 1} (${node.url}) received new block: ${blockNumber} at ${new Date().toISOString()}`);
    });
});

// Handle provider errors gracefully
providersArray.forEach((node, index) => {
    node.provider._websocket.on("error", (err) => {
        console.error(`Node ${index + 1} (${node.url}) encountered an error: ${err.message}`);
    });
    node.provider._websocket.on("close", () => {
        console.log(`Node ${index + 1} (${node.url}) connection closed`);
    });
});
