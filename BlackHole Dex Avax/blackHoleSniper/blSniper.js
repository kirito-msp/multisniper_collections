const { ethers } = require("ethers");
require("dotenv").config();
const readline = require("readline");

// --- ENV Variables ---
const SNIPER_PK = process.env.SNIPER_PK;
const AMOUNT_TO_BUY = process.env.AMOUNT_TO_BUY || "0.001";
const GWEI = process.env.GWEI || "20";
const WETH_ADDRESS = process.env.WETH_ADDRESS;
const MATCH_TOKEN = (process.env.MATCH_TOKEN || "").toLowerCase();
const SNIPE_ALL = (process.env.SNIPE_ALL === "true");
const ROUTER_ADDRESS = process.env.ROUTER_ADDRESS;
const SLIPPAGE = parseInt(process.env.SLIPPAGE || "5"); // 5% default

const FACTORY = "0xfE926062Fb99CA5653080d6C14fE945Ad68c265C";
const wsAvax = process.env.AVAX_WS || "ws://127.0.0.1:9650/ext/bc/C/ws";

// --- Providers/Contracts ---
const provider = new ethers.providers.WebSocketProvider(wsAvax);
const wallet = new ethers.Wallet(SNIPER_PK, provider);

const routerABI = [
  "function swapExactETHForTokens(uint amountOutMin, tuple(address pair, address from, address to, bool stable, bool concentrated, address receiver)[] routes, address to, uint deadline) payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, tuple(address pair, address from, address to, bool stable, bool concentrated, address receiver)[] routes, address to, uint deadline) returns (uint[] memory amounts)"
];


const router = new ethers.Contract(ROUTER_ADDRESS, routerABI, wallet);

const routerHelperABI = [
  "function getPoolAmountOut(uint amountIn, address tokenIn, address pair) external view returns (uint amount)"
];
const routerHelper = new ethers.Contract(ROUTER_ADDRESS, routerHelperABI, provider);

const tokenInfoABI = require("./abis/tokenInfo.json");
const factoryABI = [
  "event PairCreated(address indexed token0, address indexed token1, bool stable, address pair, uint256)",
  "function getPair(address tokenA, address tokenB, bool stable) external view returns (address pair)"
];


// --- State ---
let lastSnipe = { token: null, stable: false, pair: null };

// --- Utils ---
function applySlippage(amount, slippagePercent) {
  // Returns amount minus slippage%
  return amount.mul(100 - slippagePercent).div(100);
}

async function getPairAddress(tokenA, tokenB) {
  // Always stable = false for new tokens
  const factory = new ethers.Contract(FACTORY, factoryABI, provider);
  return await factory.getPair(tokenA, tokenB, false);
}


async function getTokenBalance(token, account) {
  if (token.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
    return ethers.utils.formatEther(await provider.getBalance(account));
  }
  const erc20 = new ethers.Contract(token, tokenInfoABI, provider);
  const bal = await erc20.balanceOf(account);
  const decimals = await erc20.decimals().catch(() => 18);
  return ethers.utils.formatUnits(bal, decimals);
}

// --- Main Printer ---
async function printStart() {
  const avaxBal = await provider.getBalance(wallet.address);
  console.log(`\n=== Sniper Started ===`);
  console.log(`Wallet: ${wallet.address}`);
  console.log(`AVAX Balance: ${ethers.utils.formatEther(avaxBal)}`);
  if (!SNIPE_ALL && MATCH_TOKEN) {
    console.log(`Mode: Snipe ONLY tokens paired with: ${MATCH_TOKEN}`);
  } else {
    console.log(`Mode: Snipe ANY new pair!`);
  }
  console.log(`Buy Amount: ${AMOUNT_TO_BUY} AVAX`);
  console.log(`GWEI: ${GWEI}`);
  console.log(`Router: ${ROUTER_ADDRESS}`);
  console.log(`Slippage: ${SLIPPAGE}%`);
  console.log(`Monitoring for new pairs...\n`);
  console.log(`Type /sell [percent] to sell last sniped token, or /sell [percent] [tokenAddr] [stable:true|false] [pairAddr]`);
}

// --- Get minAmountOut using RouterHelper and slippage ---
async function getAmountOutMin(amountIn, tokenIn, pairAddress) {
  try {
    const amountOut = await routerHelper.getPoolAmountOut(amountIn, tokenIn, pairAddress);
    if (amountOut && amountOut.gt && amountOut.gt(0)) {
      return applySlippage(amountOut, SLIPPAGE);
    }
  } catch (e) {
    console.log("[WARN] getPoolAmountOut failed, falling back to minAmountOut=0 (no slippage protection)");
  }
  return 0;
}


// --- SNIPER Core ---
async function snipeNewToken(tokenAddress, stable, pairAddress) {
  try {
    const balBefore = await getTokenBalance(tokenAddress, wallet.address);
    const avaxBefore = ethers.utils.formatEther(await provider.getBalance(wallet.address));
    console.log(`[SNIPER] Before: AVAX: ${avaxBefore} | Token: ${balBefore}`);

    const routes = [{
      pair: pairAddress,
      from: WETH_ADDRESS,
      to: tokenAddress,
      stable: stable,
      concentrated: false,
      receiver: wallet.address
    }];


    const deadline = Math.floor(Date.now() / 1000) + 180;
    const amountIn = ethers.utils.parseEther(AMOUNT_TO_BUY);
    const minAmountOut = await getAmountOutMin(amountIn, WETH_ADDRESS, pairAddress);

    if (minAmountOut.eq(0)) {
      console.error("[SNIPER] Pool has zero output for this amount. No liquidity, skipping buy.");
      return;
    }

    const tx = await router.swapExactETHForTokens(
      minAmountOut,
      routes,           
      wallet.address,    
      deadline,
      {
        value: amountIn,
        gasPrice: ethers.utils.parseUnits(GWEI, "gwei"),
        gasLimit: 600000
      }
    );


    console.log(`[SNIPER] Sent buy tx: ${tx.hash} - waiting confirmation...`);
    const receipt = await tx.wait();
    if (receipt.status !== 1) {
      throw new Error("Tx reverted. Probably no liquidity or pool is dead.");
    }
    console.log(`[SNIPER] Buy tx mined! Hash: ${receipt.transactionHash}`);

    const balAfter = await getTokenBalance(tokenAddress, wallet.address);
    const avaxAfter = ethers.utils.formatEther(await provider.getBalance(wallet.address));
    console.log(`[SNIPER] After: AVAX: ${avaxAfter} | Token: ${balAfter}`);

    lastSnipe = { token: tokenAddress, stable, pair: pairAddress };
    console.log(`[CHART] https://dexscreener.com/avalanche/${pairAddress}\n`);
    //process.exit(0)
  } catch (e) {
    if (e.message && e.message.includes("already known")) {
      console.error(`[SNIPER] ERROR: Transaction already known (duplicate nonce or tx still in mempool).`);
    } else if (e.message && e.message.includes("CALL_EXCEPTION")) {
      console.error(`[SNIPER] ERROR: Tx reverted. Pool may be empty or swap not possible now.`);
    } else {
      console.error(`[SNIPER] ERROR:`, e.message || e);
    }
  }
}

// --- PairCreated Listener ---
async function startListener() {
  const factory = new ethers.Contract(FACTORY, factoryABI, provider);
  factory.on("PairCreated", async (token0, token1, stable, pair, event) => {
    token0 = token0.toLowerCase();
    token1 = token1.toLowerCase();
    if (!SNIPE_ALL && MATCH_TOKEN && token0 !== MATCH_TOKEN && token1 !== MATCH_TOKEN) {
      return;
    }
    let tokenToBuy = token0 === WETH_ADDRESS.toLowerCase() ? token1 : token0;
    if (!tokenToBuy || tokenToBuy === WETH_ADDRESS.toLowerCase()) tokenToBuy = token1;
    console.log(`[PAIR FOUND] token0: ${token0} token1: ${token1} stable: ${stable} pair: ${pair}`);
    await snipeNewToken(tokenToBuy, stable, pair);
  });
  console.log("Listening for PairCreated events...");
}

// --- Sell Function ---
async function sellToken(tokenAddress, percent, stable, pairAddress) {
  try {
    if (!tokenAddress || !pairAddress) {
      return console.log(`[SELL] Missing token or pair address. Usage: /sell [percent] [tokenAddr] [stable:true|false] [pairAddr] OR just /sell [percent] to sell last sniped token.`);
    }
    const erc20 = new ethers.Contract(tokenAddress, tokenInfoABI, wallet);
    const bal = await erc20.balanceOf(wallet.address);
    if (bal.eq(0)) return console.log("No tokens to sell!");
    const amount = bal.mul(percent).div(100);
    const allowance = await erc20.allowance(wallet.address, ROUTER_ADDRESS);
    if (allowance.lt(amount)) {
      const tx = await erc20.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
      await tx.wait();
      console.log(`[SELL] Approved tokens for selling.`);
    }
    const routes = [{
      pair: pairAddress,
      from: tokenAddress,
      to: WETH_ADDRESS,
      stable: stable,
      concentrated: false,
      receiver: ROUTER_ADDRESS 
    }];


    const deadline = Math.floor(Date.now() / 1000) + 120;

    // Calculate minAmountOut with slippage
    const minAmountOut = await getAmountOutMin(amount, tokenAddress, pairAddress);


    const tx = await router.swapExactTokensForETH(
        amount,
        minAmountOut,
        routes,            
        wallet.address,   
        deadline,
        {
          gasPrice: ethers.utils.parseUnits(GWEI, "gwei"),
          gasLimit: 600000
        }
      );
    console.log(`[SELL] Sell tx sent: ${tx.hash} - waiting confirmation...`);
    const receipt = await tx.wait();
    if (receipt.status !== 1) {
      throw new Error("Sell tx reverted.");
    }
    const avaxBal = ethers.utils.formatEther(await provider.getBalance(wallet.address));
    const balAfter = await erc20.balanceOf(wallet.address);
    console.log(`[SELL] Sell completed! Hash: ${receipt.transactionHash}`);
    console.log(`[SELL] Wallet AVAX/ETH balance after: ${avaxBal}`);
    console.log(`[SELL] Token balance after: ${ethers.utils.formatUnits(balAfter, await erc20.decimals())}`);
  } catch (e) {
    console.error(`[SELL] ERROR:`, e.message || e);
  }
}

// --- CLI ---
function terminalCLI() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.setPrompt('SNIPER> ');
  rl.prompt();
  rl.on('line', async (line) => {
    line = line.trim();

    // /sell command
   if (line.startsWith('/sell')) {
      const parts = line.split(' ');
      const percent = parseInt(parts[1]) || 100;

      if (parts.length === 2 && lastSnipe.token && lastSnipe.pair) {
        await sellToken(lastSnipe.token, percent, lastSnipe.stable, lastSnipe.pair);
      } else if (parts.length === 3) {
        const tokenAddr = parts[2];
        const pairAddr = await getPairAddress(tokenAddr, WETH_ADDRESS);
        if (pairAddr && pairAddr !== ethers.constants.AddressZero) {
          await sellToken(tokenAddr, percent, false, pairAddr);
        } else {
          console.log(`[SELL] No pair found for ${tokenAddr} and ${WETH_ADDRESS} (stable: false).`);
        }
      } else if (parts.length === 5) {
        const [ , , tokenAddr, stableStr, pairAddr ] = parts;
        const stable = stableStr === "true";
        await sellToken(tokenAddr, percent, stable, pairAddr);
      } else {
        console.log("Usage: /sell [percent] (last token), /sell [percent] [tokenAddr], /sell [percent] [tokenAddr] [stable:true|false] [pairAddr]");
      }
      rl.prompt();
      return;
    }

    // /buy command, now auto-finds pair
    if (line.startsWith('/buy')) {
      const parts = line.split(' ');
      if (parts.length === 2) {
        const [, tokenAddr] = parts;
        const pairAddr = await getPairAddress(WETH_ADDRESS, tokenAddr);
        if (pairAddr && pairAddr !== ethers.constants.AddressZero) {
          await snipeNewToken(tokenAddr, false, pairAddr);
        } else {
          console.log(`[BUY] No pair found for ${WETH_ADDRESS} and ${tokenAddr} (stable: false).`);
        }
      } else {
        console.log("Usage: /buy [tokenAddr]");
      }
      rl.prompt();
      return;
    }

    rl.prompt();
  });
}



// --- Block Test Snipe (for dev/testing only) ---
async function testSnipeFromBlock(
  blockNumber = 65277572, 
  targetToken = "0x153374C6D6786B6ca2c4bc96f9C3A471428f2bC7"
) {
  console.log(`Running test snipe on block ${blockNumber} for token ${targetToken}...`);
  const iface = new ethers.utils.Interface(factoryABI);
  const topic = iface.getEventTopic("PairCreated");

  const logs = await provider.getLogs({
    address: FACTORY,
    fromBlock: blockNumber,
    toBlock: blockNumber,
    topics: [topic]
  });

  if (!logs.length) {
    console.log("No PairCreated events in that block.");
    return;
  }

  let found = false;
  for (const log of logs) {
    const parsed = iface.parseLog(log);
    const [token0, token1, stable, pair] = parsed.args;
    console.log(`[DEBUG] PairCreated: token0=${token0} token1=${token1} stable=${stable} pair=${pair}`);
    console.log(`[DEBUG] Lowercase: token0=${token0.toLowerCase()} token1=${token1.toLowerCase()}`);
    if (
      token0.toLowerCase() === targetToken.toLowerCase() ||
      token1.toLowerCase() === targetToken.toLowerCase()
    ) {
      found = true;
      console.log(`[TEST] MATCH FOUND: token0: ${token0} token1: ${token1} stable: ${stable} pair: ${pair}`);
      // Snipe target token directly (for testing, not WETH logic)
      await snipeNewToken(targetToken, stable, pair);
      break;
    }
  }
  if (!found) {
    console.log("No matching PairCreated for that token in this block.");
  }
}

// --- MAIN ---
async function main() {
  await printStart();
  // Comment out the next line for production/live usage!
  //await testSnipeFromBlock(65277572, "0x153374C6D6786B6ca2c4bc96f9C3A471428f2bC7");
  await startListener();
  terminalCLI();
}

main();
