const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  bidTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'won', 'lost', 'cancelled'],
    default: 'active'
  }
});

module.exports = mongoose.model('Bid', bidSchema);
