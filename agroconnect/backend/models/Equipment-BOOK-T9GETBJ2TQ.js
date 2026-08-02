const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['tractor', 'harvester', 'plow', 'sprayer', 'seeder', 'other']
  },
  rentalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  priceUnit: {
    type: String,
    enum: ['per hour', 'per day', 'per acre'],
    default: 'per day'
  },
  availability: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  specifications: {
    type: Map,
    of: String
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  rentedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rentalStartDate: {
    type: Date
  },
  rentalEndDate: {
    type: Date
  },
  rentalCost: {
    type: Number
  }
});

module.exports = mongoose.model('Equipment', equipmentSchema);
