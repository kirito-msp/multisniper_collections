// models/Contract.js
const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
     creatorAddress: { type: String, unique: true, required: true },
     count: { type: Number },
});

module.exports = mongoose.model('Creators', contractSchema);
