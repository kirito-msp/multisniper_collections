const ethers = require('ethers');
require('events').EventEmitter.defaultMaxListeners = 50;
let websocketURL = "ws://127.0.0.1:8548";
const provider = new ethers.providers.WebSocketProvider(websocketURL);
console.log("----------------------- Starting BOT ------------------------");

provider.on('pending', (tx) => {
    provider.getTransaction(tx).then(async transaction => {
        if (transaction.data.includes("0x57fb096f")) {
            console.log(
                "\x1b[32m%s\x1b[0m",
                "PBull users==> " +
                transaction.from.toLowerCase() +
                " " +
                Number(ethers.utils.formatEther(transaction.value)).toFixed(4) +
                "BNB " +
                transaction.gasPrice.toNumber() / 10 ** 9 +
                "GW " +
                transaction.gasLimit.toNumber() +
                ":" +
                leftTime
            );
        }

        if (transaction.data.includes("0x57fb096f") && transaction.value >= 1 * 10 ** 18)
            console.log(
                "PBull users==> " +
                transaction.from.toLowerCase() +
                " " +
                Number(ethers.utils.formatEther(transaction.value)).toFixed(4) +
                "BNB " +
                transaction.gasPrice.toNumber() / 10 ** 9 +
                "GW " +
                transaction.gasLimit.toNumber() +
                ":" +
                leftTime
            );



        if (transaction.data.includes("0xaa6b873a")) {
            console.log(
                "\x1b[31m%s\x1b[0m",
                "PBear users==> " +
                transaction.from.toLowerCase() +
                " " +
                Number(ethers.utils.formatEther(transaction.value)).toFixed(4) +
                "BNB " +
                transaction.gasPrice.toNumber() / 10 ** 9 +
                "GW " +
                transaction.gasLimit.toNumber() +
                ":" +
                leftTime
            );
        }

        if (transaction.data.includes("0xaa6b873a") && transaction.value >= 1 * 10 ** 18)
            console.log(
                "PBear users==> " +
                transaction.from.toLowerCase() +
                " " +
                Number(ethers.utils.formatEther(transaction.value)).toFixed(4) +
                "BNB " +
                transaction.gasPrice.toNumber() / 10 ** 9 +
                "GW " +
                transaction.gasLimit.toNumber() +
                ":" +
                leftTime
            );

    })
});