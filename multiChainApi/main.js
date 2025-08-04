const { Worker } = require('worker_threads');
const { ethers } = require('ethers');
const os = require('os');
const config = require('./config.json');

const maxWorkers = os.cpus().length;
const workerPool = [];
const pendingBlocks = [];
const MAX_TASK_TIME = 60 * 1000; // 60 seconds
const BLOCK_CONFIRMATIONS = 2;   // Wait 2 confirmations before processing

// Track the last processed block for each chain
const lastProcessedBlock = {};

// Create and setup new worker
function createWorker(message) {
    const worker = new Worker('./scanner/scan.js');
    worker.busy = true;
    worker.currentMessage = message;
    worker.startTime = Date.now();

    worker.on('message', (msg) => {
        if (msg.error) {
            console.error(`Error processing block ${msg.blockNumber} on chain ${msg.chain}: ${msg.error}`);
        }
        worker.busy = false;
        worker.currentMessage = null;
        worker.startTime = null;

        processPendingBlocks();
    });

    worker.on('error', (err) => {
        console.error(`Worker encountered error: ${err}`);
        recycleWorker(worker);
    });

    worker.on('exit', (code) => {
        console.log(`Worker ${worker.threadId} exited with code ${code}`);
        recycleWorker(worker);
    });

    worker.postMessage(message);
    workerPool.push(worker);
}

// Recycle terminated or errored worker
function recycleWorker(worker) {
    const index = workerPool.indexOf(worker);
    if (index !== -1) workerPool.splice(index, 1);
    if (worker.currentMessage) pendingBlocks.unshift(worker.currentMessage);
    processPendingBlocks();
}

// Dispatch blocks to available workers or queue
function dispatchBlock(message) {
    const freeWorker = workerPool.find(w => !w.busy);
    if (freeWorker) {
        freeWorker.busy = true;
        freeWorker.currentMessage = message;
        freeWorker.startTime = Date.now();
        freeWorker.postMessage(message);
    } else if (workerPool.length < maxWorkers) {
        createWorker(message);
    } else {
        pendingBlocks.push(message);
    }
}

// Process pending blocks if workers available
function processPendingBlocks() {
    while (pendingBlocks.length && workerPool.some(w => !w.busy)) {
        const nextMsg = pendingBlocks.shift();
        dispatchBlock(nextMsg);
    }
}

// Subscribe to blocks with confirmation checks
async function subscribeChain(chain, wsUrl, rpcWsUrl) {
 // console.log(rpcWsUrl)
    const provider = new ethers.providers.WebSocketProvider(wsUrl);

    provider.on('block', async (latestBlockNumber) => {
        const confirmedBlock = latestBlockNumber - BLOCK_CONFIRMATIONS;
        const lastBlock = lastProcessedBlock[chain] ?? confirmedBlock - 1;

        // Process all missing blocks (to ensure none skipped)
        for (let bn = lastBlock + 1; bn <= confirmedBlock; bn++) {
            dispatchBlock({ chain, blockNumber: bn, wsUrl });
        }

        lastProcessedBlock[chain] = confirmedBlock;
    });

    provider._websocket.on('error', (err) => {
        console.error(`WS Error on chain ${chain}:`, err);
    });

    provider._websocket.on('close', () => {
        console.warn(`WS Closed on chain ${chain}. Reconnecting...`);
        setTimeout(() => subscribeChain(chain, wsUrl), 3000);
    });
}

// Initialize all chains
const chains = Object.keys(config).filter(k => config[k].wsUrl);
chains.forEach(chain => subscribeChain(chain, config[chain].wsUrl, config[chain].rpcWsUrl));

console.log(`🚀 Dynamic Worker Pool running. Max Workers: ${maxWorkers}`);
console.log(`⛓️ Chains subscribed: ${chains.join(', ')}`);

// Periodic monitoring & recycling stuck workers
setInterval(() => {
    const now = Date.now();
    workerPool.forEach(worker => {
        if (worker.busy && (now - worker.startTime > MAX_TASK_TIME)) {
            console.warn(`Terminating stuck worker ${worker.threadId} processing ${worker.currentMessage.chain}:${worker.currentMessage.blockNumber}`);
            worker.terminate();
        }
    });

    console.log(`📊 Active Workers: ${workerPool.filter(w => w.busy).length}/${maxWorkers}, Queue: ${pendingBlocks.length}`);
}, 5000);
