const mongoose = require('mongoose');

const guidanceArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  summary: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Sowing',
      'Harvesting',
      'Irrigation',
      'Organic Farming',
      'Soil Health',
      'Crop Protection',
      'Weather',
      'Government Schemes',
      'Market Advice',
      'Machinery',
      'Pest Control',
      'Disease Management',
      'Post Harvest',
      'Storage',
      'Insurance',
      'Financial Assistance'
    ],
    default: 'Organic Farming'
  },
  author: {
    type: String,
    default: 'Dr. Harish Patil (Lead Agronomist)'
  },
  authorRole: {
    type: String,
    default: 'Senior Agricultural Scientist'
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'
  },
  tags: [{
    type: String
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 142
  },
  likes: {
    type: Number,
    default: 28
  },
  season: {
    type: String,
    enum: ['All', 'Kharif', 'Rabi', 'Zaid'],
    default: 'All'
  },
  recommendedCrops: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GuidanceArticle', guidanceArticleSchema);
