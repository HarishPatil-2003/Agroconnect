const express = require('express');
const { auth } = require('../middleware/auth');
const { validate, validateParams } = require('../middleware/validate');
const { mongoIdSchema } = require('../utils/validators');
const z = require('zod');
const Notification = require('../models/Notification');

const router = express.Router();

// @route   GET api/notifications
// @desc    Get all notifications for logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark a single notification as read
// @access  Private
router.put('/:id/read', auth, validateParams(z.object({ id: mongoIdSchema })), async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      console.warn(`🔒 [UNAUTHORIZED NOTIFICATION READ ATTEMPT] User ${req.user.id} tried to read notification ${req.params.id} owned by user ${notification.recipient}`);
      return res.status(403).json({ message: 'Forbidden: You do not own this notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notifications/read-all
// @desc    Mark all notifications of user as read
// @access  Private
router.put('/read-all/all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', auth, validateParams(z.object({ id: mongoIdSchema })), async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this notification' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/notifications/all/all
// @desc    Clear all notifications for user
// @access  Private
router.delete('/all/all', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

const ALLOWED_TYPES = ['bid_accepted', 'outbid', 'rental_approved', 'scheme', 'message', 'marketplace_update', 'other'];

// @route   POST api/notifications/test
// @desc    Create a mock notification for testing
// @access  Private
const testNotificationSchema = z.object({
  type: z.string().max(50).optional(),
  title: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
  link: z.string().max(200).optional()
});

router.post('/test', auth, validate(testNotificationSchema), async (req, res) => {
  const { type, title, message, link } = req.body;
  try {
    const resolvedType = ALLOWED_TYPES.includes(type) ? type : 'other';
    const notification = new Notification({
      recipient: req.user.id,
      type: resolvedType,
      title: title || 'Test Alert',
      message: message || 'This is a test notification from AgroConnect.',
      link: link || ''
    });

    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/notifications
// @desc    Create a new notification
// @access  Private
const createNotificationSchema = z.object({
  type: z.string().max(50).optional(),
  title: z.string().max(100),
  message: z.string().max(500),
  link: z.string().max(200).optional()
});

router.post('/', auth, validate(createNotificationSchema), async (req, res) => {
  const { type, title, message, link } = req.body;
  try {
    const resolvedType = ALLOWED_TYPES.includes(type) ? type : 'other';
    const notification = new Notification({
      recipient: req.user.id,
      type: resolvedType,
      title,
      message,
      link: link || ''
    });

    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
