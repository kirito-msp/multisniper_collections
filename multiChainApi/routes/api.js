const express = require('express');
const mongoose = require('mongoose');
const { ethers, providers } = require('ethers');
const config = require('../config.json');
const tokenInfoABI = require('../abis/tokenInfo.json');


// Import all contract models statically
const BscContract = require('../models/BscContract');
const EthContract = require('../models/EthContract');
const BaseContract = require('../models/BaseContract');
const AvaxContract = require('../models/AvaxContract');
const SonicContract = require('../models/SonicContract');

const BscVolume = require('../models/BscVolume');
const EthVolume = require('../models/EthVolume');
const BaseVolume = require('../models/BaseVolume');
const AvaxVolume = require('../models/AvaxVolume');
const SonicVolume = require('../models/SonicVolume');

const BscWallet = require('../models/BscWallet');
const EthWallet = require('../models/EthWallet');
const BaseWallet = require('../models/BaseWallet');
const AvaxWallet = require('../models/AvaxWallet');
const SonicWallet = require('../models/SonicWallet');

const { checkToken } = require('../scanner/tokenInfo');

const chainContractModel = {
    1: BscContract,
    2: EthContract,
    3: BaseContract,
    4: AvaxContract,
    5: SonicContract,
  };

const chainVolumeModel = {
    1: BscVolume,
    2: EthVolume,
    3: BaseVolume,
    4: AvaxVolume,
    5: SonicVolume,
  };

const chainWalletsModel = {
    1: BscWallet,
    2: EthWallet,
    3: BaseWallet,
    4: AvaxWallet,
    5: SonicWallet,
};

const functionsInfo = ['function getBestPool(address token) public view returns (address[] memory _pairInfo, uint256[] memory _balances, uint256[] memory _decimals, uint256 _fees)',
'function getEthPrice() external view returns (uint256)']

const functionsSwap = ['function testBuyV2(uint256 dex, address[] memory absolutePath) external payable returns (uint256)',
'function testSellV2(uint256 dex, address[] memory absolutePath) external payable returns (uint256)',
'function startSwapBuySell(address[] memory dataAddr, uint256[] memory dataUint, uint256[] memory dataStr, bool[] memory dataBool, address[] memory to, uint24[] memory pairFees) external payable']

let infoRouters = {
    'bsc': '0xb92bdf25f69497842b0C94371627b1e9C68349d7', //OK
    'eth': '0x9df6A715D0db471DDf22de988c5f3ED6bAA96745', //OK
    'blast': '0x047E6e93cAa6d38EA9FAB260070D0C087FAB6Ef9', //OK
    'base': '0x17380Ffb1A64B4933E2A76d64D0a38e30fF87a20', //OK
    'polygon': '0xA30536869e83Df93AbFc43eA2c146e4C52DDCa73', //OK
    'arbitrum': '0xFa62c338D66215C09a9F85B96f4AaBBF13Eee57f', //OK
    'avax': '0xf5D6cFaE0cBDCa942b434Ad2159b2974b82c6e0a' //OK
}

let swapRouters = {
    'bsc': '0x24Bf6D89D3485e4589fc04E0D8c67cEC24e3813C', //OK
    'eth': '0xDfeBBB631a8C7AF0D8Ada7c212c767dd5fea9493', //OK
    'blast': '0xf5D6cFaE0cBDCa942b434Ad2159b2974b82c6e0a', //OK
    'base': '0x3036b689b1b134477c90FAa6836F6Cc4E842765B', //OK
    'polygon': '0xf3a787C1d881d80806de927C2E7784566957BE3F', //OK
    'arbitrum': '0xe63A3A93Ee219438b24D249093969DF85222FE27', //issues with exact tokens
    'avax': '0x3036b689b1b134477c90FAa6836F6Cc4E842765B' //OK
}

let ETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const router = express.Router();

// Route to search for a contract by address
router.get('/', async (req, res) => {
    const { module, query, apikey } = req.query;
    console.log(module, query, apikey)
    if (!config.api.apikey.includes(apikey)) {
        return res.status(503).json({
            success: false,
            message: 'INVALID API KEY'
        });
    }

    if (module !== 'token') {
        return res.status(400).json({
            success: false,
            message: 'INVALID MODULE'
        });
    }

    if (!query) {
        return res.status(400).json({
            success: false,
            message: 'MISSING QUERY'
        });
    }

    const tokenQuery = query.toLowerCase();

    try {
        const chainModels = {
            bsc: BscContract,
            eth: EthContract,
            base: BaseContract,
            avax: AvaxContract,
            sonic: SonicContract,
        };
        
        const result = [];
        
        for (const [chain, Model] of Object.entries(chainModels)) {
            const found = await Model.findOne({
                $or: [
                  { contractAddress: { $regex: new RegExp(`^${tokenQuery}$`, 'i') } },
                  { name: { $regex: new RegExp(`^${tokenQuery}$`, 'i') } },
                  { symbol: { $regex: new RegExp(`^${tokenQuery}$`, 'i') } },
                ]
              });

            if (found) {
                result.push({
                    chain,
                    address: found.address,
                    name: found.tokenName,
                    symbol: found.symbol,
                    ...found._doc
                });
            }
        }
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Token not found in any chain'
            });
        }

        return res.json({
            success: true,
            count: result.length,
            results: result
        });

    } catch (err) {
        console.error('Error fetching token info:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error while searching token'
        });
    }
});



module.exports = router;

