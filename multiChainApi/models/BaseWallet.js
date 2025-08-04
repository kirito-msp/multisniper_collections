// models/Contract.js
const mongoose = require('mongoose');

const TokenTradeSchema = new mongoose.Schema({
    txHash: { type: String, unique: true, required: true },  
    block: { type: Number, required: true },
    timestamp: { type: Number, required: true },
    tokenIn: {},
    tokenOut: {}
  }, { _id: false });

const WalletSnapshotSchema = new mongoose.Schema({
  walletAddress: { type: String, unique: true, required: true },  
  totalValue: { type: String, required: true },
  trades: { type: [TokenTradeSchema], default: [] },
  updated: { type: Number, required: true, unique: true }
});


  module.exports = mongoose.model('BaseWallet', WalletSnapshotSchema);
