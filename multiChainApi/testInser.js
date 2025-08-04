const { ethers, providers } = require('ethers');
const tokenInfoABI = require('./abis/tokenInfo.json');
const config = require('./config.json');
const provider = new providers.WebSocketProvider(config.ethereum.rpcWsUrl);

async function getContractInfo(contractAddress) {
    const contract = new ethers.Contract(contractAddress, tokenInfoABI, provider);
    let name = "unknown";
    let symbol = "unknown";
    let decimals = 0;
    let totalSupply = "0";
    try {
        name = await contract.name()
    } catch (e) {}
    try {
        symbol = await contract.symbol();
    } catch (e) {}
    try {
        decimals = await contract.decimals();
    } catch (e) {}
    try {
        totalSupply = (await contract.totalSupply()).toString();
    } catch (e) {}

    return {
        name: name,
        symbol: symbol,
        decimals: decimals,
        totalSupply: totalSupply
    };
}

async function main(){
let contract = "0x57e114B691Db790C35207b2e685D4A43181e6061"
let info = await getContractInfo(contract)
console.log(info)
}

main()