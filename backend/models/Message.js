const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: String, // format: "user1_user2" sorted alphabetically to keep consistent chat rooms
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    trim: true,
    default: ''
  },
  attachments: [{
    type: String // URLs to files/images
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
