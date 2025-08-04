const mongoose = require('mongoose');


const WalletsSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  chain: { type: Number, default: 1 },
  contractAddress: { type: String, required: true },
  initialMc: { type: Number, default: 0 },
  ath: { type: Number, default: 0 },
  count: { type: Number, default: 0 },
  value: { type: Number, default: 0 },
}, { versionKey: false }); 


  module.exports = mongoose.model('FreshWallets', WalletsSchema);
