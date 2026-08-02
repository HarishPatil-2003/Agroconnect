const mongoose = require('mongoose');

const guidanceBookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GuidanceArticle',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can bookmark an article only once
guidanceBookmarkSchema.index({ user: 1, article: 1 }, { unique: true });

module.exports = mongoose.model('GuidanceBookmark', guidanceBookmarkSchema);
