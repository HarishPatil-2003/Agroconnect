const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  village: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    default: 'Prefer not to say'
  },
  dateOfBirth: {
    type: Date
  },
  role: {
    type: String,
    enum: ['farmer', 'buyer', 'admin'],
    required: true
  },
  bio: {
    type: String,
    trim: true
  },
  preferredLanguage: {
    type: String,
    default: 'English'
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  // Farmer Specific Fields
  farmSize: {
    type: Number, // in acres
    default: 0
  },
  primaryCrops: [{
    type: String
  }],
  equipmentOwned: [{
    type: String
  }],
  // Buyer Specific Fields
  businessName: {
    type: String,
    trim: true
  },
  gstNumber: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Profile', profileSchema);
