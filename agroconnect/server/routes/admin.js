const express = require('express');
const { auth, roleAuth } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Bid = require('../models/Bid');
const Equipment = require('../models/Equipment');

const router = express.Router();

// Get admin dashboard data
router.get('/dashboard', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalBids = await Bid.countDocuments();
    const totalEquipment = await Equipment.countDocuments();

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt');
    const activeProducts = await Product.find({ status: 'active' }).limit(5).populate('farmer', 'name');

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalBids,
        totalEquipment
      },
      recentUsers,
      activeProducts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all users
router.get('/users', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update user role
router.put('/users/:id/role', auth, roleAuth(['admin']), async (req, res) => {
  const { role } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all products
router.get('/products', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const products = await Product.find().populate('farmer', 'name');
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete product
router.delete('/products/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all equipment
router.get('/equipment', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const equipment = await Equipment.find().populate('owner', 'name');
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete equipment
router.delete('/equipment/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Equipment deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
