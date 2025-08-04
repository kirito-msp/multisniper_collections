// models/Contract.js
const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    tokenId: { type: Number, required: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    decimals: { type: Number, required: true },
    totalSupply: { type: String, required: true },
    contractAddress: { type: String, unique: true, required: true },
    contractCreator: { type: String, required: true },
    pairAddress: { type: String, required: true },
    lpDeployed: { type: String, required: true },
    lpPercent: { type: String, required: true },
    salePercent: { type: String, required: true },
    xHandle: { type: String, required: true },
    xFollowers: { type: String, required: true },
    creationTime: { type: Number, required: true },
    boundingCurve: { type: Number, required: true },
});

module.exports = mongoose.model('Contract', contractSchema);
