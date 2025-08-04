// models/Contract.js
const mongoose = require('mongoose');

const TokenTradeSchema = new mongoose.Schema({
  tokenAddress: { type: String, required: true },
  total: { type: Number, required: true },
  buys: { type: Number, required: true },
  buyVol: { type: Number, required: true },
  sells: { type: Number, required: true },
  sellVol: { type: Number, required: true }
}, { _id: false });

const TradeSnapshotSchema = new mongoose.Schema({
  block: { type: Number, required: true },
  timestamp: { type: Number, required: true, unique: true },
  trades: { type: [TokenTradeSchema], default: [] }
});


  module.exports = mongoose.model('BaseVolume', TradeSnapshotSchema);
