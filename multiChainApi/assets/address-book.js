module.exports = {
    bsc: {
      scanner: "https://bscscan.com/",
      currency: {
        BNB: {
          name: "BNB",
          decimals: 18,
          address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
        },
        BUSD: {
          name: "BUSD",
          decimals: 18,
          address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
        },
        USDT: {
          name: "UDST",
          decimals: 18,
          address: "0x55d398326f99059fF775485246999027B3197955"
        },
        USDC: {
          name: "USDC",
          decimals: 18,
          address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
        },
        DAI: {
          name: "DAI",
          decimals: 18,
          address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3"
        }
      },
      dex: {
        PancakeSwapV2: {
          name: "PancakeSwapV2",
          router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
          factory: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        },
        PancakeSwapV3: {
          name: "PancakeSwapV3",
          router: "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4",
          factory: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
          pairFunctionAbi: "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
          pairEventAbi: "PoolCreated(address,address,uint24,int24,address)",
          hasFeePair: true,
          fee: [100, 500, 2500, 10000]
        },
        UniSwapV2: {
          name: "UniSwapV2",
          router: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
          factory: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        },
        UniSwapV3: {
          name: "UniSwapV3",
          router: "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2",
          factory: "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7",
          pairFunctionAbi: "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
          pairEventAbi: "PoolCreated(address,address,uint24,int24,address)",
          hasFeePair: true,
          fee: [500, 3000, 10000]
        },
        ApeSwap: {
          name: "ApeSwap",
          router: "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",
          factory: "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        },
        SushiSwap: {
          name: "SushiSwap",
          router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
          factory: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        }
      }
  
    },
    eth: {
      scanner: "https://etherscan.io/",
      currency: {
        ETH: {
          name: "ETH",
          decimals: 18,
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        },
        USDT: {
          name: "USDT",
          decimals: 6,
          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        },
        USDC: {
          name: "USDC",
          decimals: 6,
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        },
        DAI: {
          name: "DAI",
          decimals: 18,
          address: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
        }
      },
      dex: {
        UniSwapV2: {
          name: "UniSwapV2",
          router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
          factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        },
        UniSwapV3: {
          name: "UniSwapV3",
          router: "0xE592427A0AEce92De3Edee1F18E0157C05861564", 
          factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
          pairFunctionAbi: "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
          pairEventAbi: "PoolCreated(address,address,uint24,int24,address)",
          hasFeePair: true,
          fee: [500, 3000, 10000]
        },
        PancakeSwapV3: {
          name: "PancakeSwapV3",
          router: "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4",
          factory: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
          pairFunctionAbi: "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
          pairEventAbi: "PoolCreated(address,address,uint24,int24,address)",
          hasFeePair: true,
          fee: [100, 500, 2500, 10000]
        },
        SushiSwap: {
          name: "SushiSwap",
          router: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
          factory: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        }
      }
    },
    arbitrum: {
      scanner: "https://arbiscan.io/",
      currency: {
        ETH: {
          name: "ETH",
          decimals: 18,
          address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
        },
        USDT: {
          name: "USDT",
          decimals: 6,
          address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
        },
        USDC: {
          name: "USDC",
          decimals: 6,
          address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
        },
        DAI: {
          name: "DAI",
          decimals: 18,
          address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"
        }
      },    
      dex: {
        Camelot: {
          name: "Camelot",
          router: "0xc873fEcbd354f5A56E00E710B90EF4201db2448d",
          factory: "0x6EcCab422D763aC031210895C81787E87B43A652",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        },
        UniSwapV3: {
          name: "UniSwapV3",
          router: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
          factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
          pairFunctionAbi: "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
          pairEventAbi: "PoolCreated(address,address,uint24,int24,address)",
          hasFeePair: true,
          fee: [500, 3000, 10000]
        }
      }
    },
    polygon: {
      scanner: "https://polygonscan.com/",
      currency: {
        MATIC: {
          name: "MATIC",
          decimals: 18,
          address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
        },
        USDT: {
          name: "USDT",
          decimals: 6,
          address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
        },
        USDC: {
          name: "USDC",
          decimals: 6,
          address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
        },
        DAI: {
          name: "DAI",
          decimals: 18,
          address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
        }
      },
      dex: {
        QuickSwap: {
          name: "QuickSwap",
          router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
          factory: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        },
        SushiSwap: {
          name: "SushiSwap",
          router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
          factory: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        },
        UniSwapV3: {
          name: "UniSwapV3",
          router: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
          factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
          pairFunctionAbi: "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
          pairEventAbi: "PoolCreated(address,address,uint24,int24,address)",
          hasFeePair: true,
          fee: [500, 3000, 10000]
        }
      }
    },
    blast: {
      scanner: "https://blastscan.io/",
      currency: {
        ETH: {
          name: "ETH",
          decimals: 18,
          address: "0x4300000000000000000000000000000000000004"
        },
        USDT: {
          name: "USDT",
          decimals: 18,
          address: "0x4300000000000000000000000000000000000003"
        }      
      },
      dex: {
        DyorSwap: {
          name: "DyorSwap",
          router: "0xE470699f6D0384E3eA68F1144E41d22C6c8fdEEf",
          factory: "0xA1da7a7eB5A858da410dE8FBC5092c2079B58413",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        },
        TrusterSwap: {
          name: "TrusterSwap",
          router: "0x98994a9A7a2570367554589189dC9772241650f6",
          factory: "0xb4A7D971D0ADea1c73198C97d7ab3f9CE4aaFA13",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        }
      }
    },
    base: {
      scanner: "https://basescan.org",
      currency: {
        ETH: {
          name: "ETH",
          decimals: 18,
          address: "0x4200000000000000000000000000000000000006"
        },
        USDT: {
          name: "USDT",
          decimals: 6,
          address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2"
        },
        USDC: {
          name: "USDC",
          decimals: 6,
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
        },
        DAI: {
          name: "DAI",
          decimals: 18,
          address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
        }       
      },
      dex: {
        UniSwapV2: {
          name: "UniSwapV2",
          router: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
          factory: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        },
        UniSwapV3: {
            name: "UniSwapV3",
            router: "0x2626664c2603336E57B271c5C0b26F421741e481",
            factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
            pairFunctionAbi: "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
            pairEventAbi: "PoolCreated(address,address,uint24,int24,address)",
            hasFeePair: true,
            fee: [100, 500, 3000, 10000]
          },
          SushiSwap: {
              name: "SushiSwap",
              router: "0x0389879e0156033202C44BF784ac18fC02edeE4f",
              factory: "0x71524B4f93c58fcbF659783284E38825f0622859",
              pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
              pairEventAbi: "PairCreated(address,address,address,uint256)",
              hasFeePair: false,
              fee: null
            }
      }
    },
    avax: {
      scanner: "https://snowscan.xyz",
      currency: {
        AVAX: {
          name: "AVAX",
          decimals: 18,
          address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"
        },
        USDT: {
          name: "USDT",
          decimals: 6,
          address: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118"
        },
        USDt: {
          name: "USDt",
          decimals: 6,
          address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"
        },
        USDC: {
          name: "USDC",
          decimals: 6,
          address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"
        },
        DAI: {
          name: "DAI",
          decimals: 18,
          address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70"
        }          
      },
      dex: {
        TraderJoe: {
          name: "TraderJoe",
          router: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
          factory: "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        },
        TraderJoeV21: {
          name: "TraderJoeV2.1",
          router: "0x18556DA13313f3532c54711497A8FedAC273220E",
          factory: "0x8e42f2F4101563bF679975178e880FD87d3eFd4e",
          pairFunctionAbi: "function getAllLBPairs(address tokenX, address tokenY) external view returns (tuple(uint16 binStep, address LBPair, bool createdByOwner, bool ignoredForRouting)[] lbPairsAvailable)",
          pairEventAbi: "LBPairCreated(IERC20 indexed tokenX, IERC20 indexed tokenY, uint256 indexed binStep, ILBPair LBPair, uint256 pid)",
          hasFeePair: false,
          fee: null
        },
        TraderJoeV22: {
          name: "TraderJoeV2.2",
          router: "0x18556DA13313f3532c54711497A8FedAC273220E",
          factory: "0xb43120c4745967fa9b93E79C149E66B0f2D6Fe0c",
          pairFunctionAbi: "function getAllLBPairs(address tokenX, address tokenY) external view returns (tuple(uint16 binStep, address LBPair, bool createdByOwner, bool ignoredForRouting)[] lbPairsAvailable)",
          pairEventAbi: "LBPairCreated(IERC20 indexed tokenX, IERC20 indexed tokenY, uint256 indexed binStep, ILBPair LBPair, uint256 pid)",
          hasFeePair: false,
          fee: null
        },
        UniSwapV2: {
          name: "UniSwapV2",
          router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
          factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        },
        UniSwapV3: {
          name: "UniSwapV3",
          router: "0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE",
          factory: "0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD",
          pairFunctionAbi: "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
          pairEventAbi: "PoolCreated(address,address,uint24,int24,address)",
          hasFeePair: true,
          fee: [100, 500, 3000, 10000]
        },
        PharaohV3: {
          name: "PharaohV3",
          router: "0xAAAE99091Fbb28D400029052821653C1C752483B",
          factory: "0xAAA32926fcE6bE95ea2c51cB4Fcb60836D320C42",
          pairFunctionAbi: "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
          pairEventAbi: "PoolCreated(address,address,uint24,int24,address)",
          hasFeePair: true,
          fee: [100, 500, 3000, 10000]
        },
        PharaohV2: {
          name: "PharaohV2",
          router: "0xAAA45c8F5ef92a000a121d102F4e89278a711Faa",
          factory: "0xAAA16c016BF556fcD620328f0759252E29b1AB57",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB, bool stable) external view returns (address)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: true,
          fee: null
        } 
      }
    },      
    sonic: {
      scanner: "https://sonicscan.org",
      currency: {
        SONIC: {
          name: "SONIC",
          decimals: 18,
          address: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38"
        },
        WETH: {
          name: "WETH",
          decimals: 18,
          address: "0x309C92261178fA0CF748A855e90Ae73FDb79EBc7"
        },
        USDC: {
          name: "USDC",
          decimals: 6,
          address: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894"
        }        
      },
      dex: {
        DyorSwap: {
          name: "DyorSwap",
          router: "0x591cf6942c422fA53E8D81c62a9692D7BeA72F61",
          factory: "0xd8863d794520285185197F97215c8B8AD04E8815",
          pairFunctionAbi: "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          pairEventAbi: "PairCreated(address,address,address,uint256)",
          hasFeePair: false,
          fee: null
        }
      }
    },
    extra: {
      dead: '0x000000000000000000000000000000000000dead',
      zero: '0x0000000000000000000000000000000000000000'
    }
  }