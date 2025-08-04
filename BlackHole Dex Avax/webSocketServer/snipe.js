const { ethers, providers, Wallet } = require('ethers');

const routerAddress = "0xF56D524D651B90E4B84dc2FffD83079698b9066E";
const boundingAddress ="0x8315f1eb449Dd4B779495C3A0b05e5d194446c6e"
const REFERRER = "0x0000000000000000000000000000000000000000";          
const AVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const AMOUNT_IN = ethers.utils.parseEther("0.1");
const AMOUNT_OUT_MIN = ethers.utils.parseUnits("0", 18);
const maxGwei = ethers.utils.parseUnits("150", "gwei");
const maxPriority = ethers.utils.parseUnits("2", "gwei");

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeSnipe(data,bot,beforeBounding) {
  try {
    if (data) {
      const token = data.token;
      const key = data.key;
      const provider = data.provider;
      const wallet = new ethers.Wallet(key, provider);

      const tokenContract = new ethers.Contract(
        token,
        [
          "function approve(address spender, uint256 amount) external returns (bool)",
          "function allowance(address owner, address spender) external view returns (uint256)",
          "function balanceOf(address account) external view returns (uint256)"
        ],
        wallet
      );

      const arenaRouter = new ethers.Contract(
        routerAddress,
        [
          'function getAmountsOut(uint256,address[]) view returns (uint256[])',
          'function swapExactAVAXForTokensSupportingFeeOnTransferTokens(uint256 amountOutMin,address[] path,address to,uint256 deadline) payable',
          'function swapExactTokensForAVAXSupportingFeeOnTransferTokens(uint256 amountIn,uint256 amountOutMin,address[] path,address to,uint256 deadline)'
        ],
        wallet
      );

        const boundingRouter = new ethers.Contract(
        boundingAddress,
        [          
          'function buyAndCreateLpIfPossible(uint256 amount,uint256 _tokenId) payable',
        ],
        wallet
      );

      const DEADLINE = Math.floor(Date.now() / 1000) + 60 * 10;

      const txFees = {
        gasLimit: 650000,
        maxPriorityFeePerGas: maxPriority,
        maxFeePerGas: maxGwei,
        value: AMOUNT_IN,
        nonce: await wallet.getTransactionCount()
      };

      let buyTx = null
      if(beforeBounding != true){
        buyTx = await arenaRouter.swapExactAVAXForTokensSupportingFeeOnTransferTokens(
          AMOUNT_OUT_MIN,
          [AVAX, token],
          wallet.address,
          DEADLINE,
          txFees
        );
      }else{
         buyTx = await boundingRouter.buyAndCreateLpIfPossible(
          AMOUNT_OUT_MIN,
          data.tokenId,
          txFees
        );
      }
     

      const buyReceipt = await buyTx.wait();
      console.log("Buy submitted:", buyReceipt.transactionHash);
      // 

        bot.telegram.sendMessage(-1002254383684, "💳 New Ape: \n<a href = 'https://dexscreener.com/avalanche/"+token+"?maker="+wallet.address+"'>DexScreener</a>", { 
                                                        parse_mode: 'HTML', 
                                                        disable_web_page_preview: true 
                                                    });

      // Approve max amount
      const maxApprovalAmount = ethers.constants.MaxUint256;
      const txFeesApprove = {
        gasLimit: 150000,
        maxPriorityFeePerGas: maxPriority,
        maxFeePerGas: maxGwei,
        nonce: await wallet.getTransactionCount()
      };

      const approveTx = await tokenContract.approve(routerAddress, maxApprovalAmount, txFeesApprove);
      await approveTx.wait();

      // Delay 10 seconds
      if(beforeBounding == true){
          await delay(10000);
      }

      // Sell all tokens
      const balance = await tokenContract.balanceOf(wallet.address);
      const DEADLINE_SELL = Math.floor(Date.now() / 1000) + 60 * 10;

      const txFeesSell = {
        gasLimit: 650000,
        maxPriorityFeePerGas: maxPriority,
        maxFeePerGas: maxGwei,
        nonce: await wallet.getTransactionCount()
      };

      const sellTx = await arenaRouter.swapExactTokensForAVAXSupportingFeeOnTransferTokens(
        balance,
        AMOUNT_OUT_MIN,
        [token, AVAX],
        wallet.address,
        DEADLINE_SELL,
        txFeesSell
      );

      const sellReceipt = await sellTx.wait();
      console.log("Sell submitted:", sellReceipt.transactionHash);
    }
  } catch (e) {
    console.error("Error in executeSnipe:", e);
  }
}

module.exports = { executeSnipe };
