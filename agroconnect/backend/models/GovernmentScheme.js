const mongoose = require('mongoose');

const governmentSchemeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  eligibility: {
    type: String,
    trim: true
  },
  benefits: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Subsidies', 'Financial Aid', 'Insurance', 'Training', 'Technology', 'Other'],
    default: 'Other'
  },
  state: {
    type: String,
    default: 'All India'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GovernmentScheme', governmentSchemeSchema);
