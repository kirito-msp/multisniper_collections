const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  address: { type: String },
  name: { type: String },
  symbol: { type: String },
  chain: { type: String }
}, { _id: false });

const RecurenceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  count: { type: Number, required: true },
  contracts: { type: [ContractSchema], default: [] },
  timestamp: { type: Number, required: true },
  messageId: { type: Number, default: 0 }
}, { versionKey: false }); 


module.exports = mongoose.model('Recurence', RecurenceSchema);
