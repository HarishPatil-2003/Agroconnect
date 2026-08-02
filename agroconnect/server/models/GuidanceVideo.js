const mongoose = require('mongoose');

const guidanceVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: '8:45'
  },
  category: {
    type: String,
    default: 'Organic Farming'
  },
  views: {
    type: Number,
    default: 350
  },
  author: {
    type: String,
    default: 'AgroConnect Media'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GuidanceVideo', guidanceVideoSchema);
