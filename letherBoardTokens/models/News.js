const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  categories: {
    type: [String],
    required: true
  },
  post_link: {
    type: String,
    required: true,
    unique: true
  },
  related_topics: {
    type: [String],
    required: false
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('News', newsSchema); // Export the model correctly
