const { ethers } = require('ethers');

const NODE_URL = "ws://127.0.0.1:8546";  //put your Node WS here

const CONCURRENT_REQUESTS = 100; // Number of parallel requests per batch
const TEST_DURATION_MS = 60000; // Duration of test in milliseconds (e.g., 1 min)


const provider = new ethers.providers.WebSocketProvider(NODE_URL);

let requestsSent = 0;
let requestsSucceeded = 0;
let requestsFailed = 0;
let testRunning = true;

async function sendRequest() {
    try {
        requestsSent++;
        await provider.getBlockNumber();
        requestsSucceeded++;
    } catch (error) {
        requestsFailed++;
    }
}

async function stressTest() {
    const promises = [];

    while (testRunning) {
        for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
            promises.push(sendRequest());
        }
        await new Promise(r => setTimeout(r, 100));
    }

    await Promise.all(promises);
}

console.log(`🔥 Starting stress test on ${NODE_URL}`);
console.log(`🚀 Duration: ${TEST_DURATION_MS / 1000}s, Concurrent Requests: ${CONCURRENT_REQUESTS}`);

stressTest();

setTimeout(() => {
    testRunning = false;
    provider.destroy();

    console.log("🛑 Stress test completed!");
    console.log(`✅ Requests Succeeded: ${requestsSucceeded}`);
    console.log(`❌ Requests Failed: ${requestsFailed}`);
    console.log(`📊 Total Requests Sent: ${requestsSent}`);
    process.exit(0);
}, TEST_DURATION_MS);
