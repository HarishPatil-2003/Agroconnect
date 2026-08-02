const express = require('express');
const { auth } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { sendMessageSchema } = require('../utils/validators');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// Helper to construct consistent chatId
const getChatId = (user1, user2) => {
  return [user1.toString(), user2.toString()].sort().join('_');
};

// @route   GET api/chats/messages/:otherUserId
// @desc    Get all messages between current user and another user
// @access  Private
router.get('/messages/:otherUserId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.otherUserId;
    const chatId = getChatId(currentUserId, otherUserId);

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name profilePicture')
      .populate('recipient', 'name profilePicture');

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/chats/recent
// @desc    Get recent chat conversations list
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all messages involving the user
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    }).sort({ createdAt: -1 });

    const contactLastMsgMap = new Map();
    for (const msg of messages) {
      const contactId = msg.sender.toString() === userId ? msg.recipient.toString() : msg.sender.toString();
      if (!contactLastMsgMap.has(contactId)) {
        contactLastMsgMap.set(contactId, {
          lastMessage: msg.text,
          isRead: msg.sender.toString() === userId ? true : msg.isRead,
          updatedAt: msg.createdAt
        });
      }
    }

    const uniqueContactIds = Array.from(contactLastMsgMap.keys());
    // Single batched query for all contact users
    const contactUsers = await User.find({ _id: { $in: uniqueContactIds } }).select('name email role profilePicture');
    const userMap = new Map(contactUsers.map(u => [u._id.toString(), u]));

    const recentChats = uniqueContactIds
      .map(id => {
        const contactUser = userMap.get(id);
        const lastMsgInfo = contactLastMsgMap.get(id);
        if (!contactUser || !lastMsgInfo) return null;
        return {
          contact: contactUser,
          lastMessage: lastMsgInfo.lastMessage,
          isRead: lastMsgInfo.isRead,
          updatedAt: lastMsgInfo.updatedAt
        };
      })
      .filter(Boolean);

    res.json(recentChats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/chats/messages
// @desc    Send a message to another user
// @access  Private
router.post('/messages', auth, uploadLimiter, validate(sendMessageSchema), async (req, res) => {
  const { recipientId, text, attachments } = req.body;
  const senderId = req.user.id;

  try {
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const chatId = getChatId(senderId, recipientId);

    const newMessage = new Message({
      chatId,
      sender: senderId,
      recipient: recipientId,
      text,
      attachments: attachments || []
    });

    await newMessage.save();

    const populatedMsg = await Message.findById(newMessage._id)
      .populate('sender', 'name profilePicture')
      .populate('recipient', 'name profilePicture');

    res.json(populatedMsg);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/chats/read/:otherUserId
// @desc    Mark all messages from another user as read
// @access  Private
router.put('/read/:otherUserId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.otherUserId;
    const chatId = getChatId(currentUserId, otherUserId);

    await Message.updateMany(
      { chatId, sender: otherUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
