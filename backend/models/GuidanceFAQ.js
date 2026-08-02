const mongoose = require('mongoose');

const guidanceFAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  order: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('GuidanceFAQ', guidanceFAQSchema);
