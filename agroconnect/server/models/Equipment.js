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
  category: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    default: 'Mahindra'
  },
  model: {
    type: String,
    default: '2025'
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'
  },
  images: [{
    type: String
  }],
  dailyPrice: {
    type: Number,
    required: true,
    min: 0
  },
  hourlyPrice: {
    type: Number,
    default: 0
  },
  weeklyPrice: {
    type: Number,
    default: 0
  },
  monthlyPrice: {
    type: Number,
    default: 0
  },
  securityDeposit: {
    type: Number,
    default: 1000
  },
  operatorIncluded: {
    type: Boolean,
    default: false
  },
  fuelIncluded: {
    type: Boolean,
    default: false
  },
  minDuration: {
    type: Number,
    default: 1
  },
  maxDuration: {
    type: Number,
    default: 30
  },
  pickupAvailable: {
    type: Boolean,
    default: true
  },
  deliveryAvailable: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    required: true
  },
  village: {
    type: String,
    default: 'Nashik'
  },
  district: {
    type: String,
    default: 'Nashik'
  },
  state: {
    type: String,
    default: 'Maharashtra'
  },
  latitude: {
    type: Number,
    default: 19.9975
  },
  longitude: {
    type: Number,
    default: 73.7898
  },
  availability: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 4.8
  },
  reviewsCount: {
    type: Number,
    default: 12
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Equipment', equipmentSchema);
