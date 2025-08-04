// models/Contract.js
const mongoose = require('mongoose');

const PairSchema = new mongoose.Schema({
  pairAddress: { type: String },
  tokenAddress: { type: String },
  currencyAddress: { type: String },
  contractCreator: { type: String },
  block: { type: Number },
  timestamp: { type: Number },
  balances: {
    token: { type: String },
    currency: { type: String }
  },
  type: { type: String },
  chain: { type: Number },
  token0: { type: String },
  infoToken0: { type: Object },
  balToken0: { type: String },
  token1: { type: String },
  infoToken1: { type: Object },
  balToken1: { type: String },
  txHash: { type: String }
}, { _id: false });

const InfluencerCallSchema = new mongoose.Schema({
  caller: { type: String },
  timestamp: { type: Number },
  mcap: { type: Number }
}, { _id: false });

const contractSchema = new mongoose.Schema({
  // If you want to use contractAddress as the document _id, you can do this:
  _id: { type: String, required: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  decimals: { type: Number, required: true },
  totalSupply: { type: String, required: true },
  contractAddress: { type: String, unique: true, required: true },
  contractCreator: { type: String, required: true },
  txHash: { type: String, required: true },
  block: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  limits: {
    buytax: { type: String },
    selltax: { type: String },
    transfertax: { type: String },
    maxtransaction: { type: String },
    maxwallet: { type: String },
  },
  pairs: { type: [PairSchema], default: [] },
  launched: {
    status: { type: Boolean },
    txHash: { type: String},
    block: { type: Number},
    timestamp: { type: Number}
  },
  trading: {
    buy: { type: Boolean },
    sell: { type: Boolean }
  },
  socials: {
    web: { type: String, default: "none" },
    telegram: { type: String, default: "none" },
    twitter: { type: String, default: "none" },
    twitter_info: {
      created: { type: String, default: "none" },
      verified: { type: String, default: "none" },
      followers: { type: Number, default: 0 }
    }
  },
  twitter_calls: { type: [String], default: [] },
  influencers_calls: { type: [InfluencerCallSchema], default: [] },
  statistics: {
    price: { type: String },
    marketcap: { type: Number },
    initialMc: { type: Number },
    burned: { type: Number },
    block1supply: {
      total: { type: Number, default: 0 },
      freshWallets: { type: Number, default: 0 },
      clog: { type: Number, default: 0 }
    },
    ath: { type: String },
    five_min: {
      mcap: { type: Number },
      growth: { type: Number },
      ath: { type: Number },
    },
    thirty_min: {
      mcap: { type: Number },
      growth: { type: Number },
      ath: { type: Number },
    },
    sixty_min: {
      mcap: { type: Number },
      growth: { type: Number },
      ath: { type: Number },
    },
    six_hours: {
      mcap: { type: Number },
      growth: { type: Number },
      ath: { type: Number },
    },
    twelve_hours: {
      mcap: { type: Number },
      growth: { type: Number },
      ath: { type: Number },
    },
    twenty_four_hours: {
      mcap: { type: Number },
      growth: { type: Number },
      ath: { type: Number },
    },
  },
  hashCode: { type: String },
  isRug: { type: Boolean },
  messageId: { type: Number },
  updatePost: { type: Boolean },
}, { versionKey: false }); // Remove __v if desired


module.exports = mongoose.model('AvaxContract', contractSchema);
