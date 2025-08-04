const mongoose = require('mongoose');

const watchSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['wallet', 'token'],
    required: true
  },
  address: { // for wallet tracking
    type: String,
    // Only needed if type is 'wallet'
    validate: {
      validator: function(v) {
        // Only validate when type is wallet
        if (this.type !== 'wallet') return true;
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: props => `${props.value} is not a valid EVM address for a wallet.`
    }
  },
  contractAddress: { // for token tracking
    type: String,
    // Only needed if type is 'token'
    validate: {
      validator: function(v) {
        if (this.type !== 'token') return true;
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: props => `${props.value} is not a valid EVM address for a token contract.`
    }
  },
  chain: {
    type: String,
    default: 'ETH',
    maxlength: 20
  },
  symbol: {
    type: String,
    maxlength: 50
  },
  name: {
    type: String,
    maxlength: 20 // enforce a max of 20 characters for wallet name
  },
  minMcap: Number, // for token
  // New filter field – allowed values can be adjusted as needed.
  filter: {
    type: String,
    enum: ['listed', 'pair', 'wallet']
  },
  chatId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Watch', watchSchema);
