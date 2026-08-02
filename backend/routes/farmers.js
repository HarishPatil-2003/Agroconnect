const express = require('express');
const { auth, roleAuth } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { productCreateSchema } = require('../utils/validators');
const Product = require('../models/Product');
const Bid = require('../models/Bid');

const router = express.Router();

// Get farmer dashboard data
router.get('/dashboard', auth, roleAuth(['farmer']), async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user.id });
    const activeBids = await Bid.find({
      product: { $in: products.map(p => p._id) }
    })
      .populate('buyer', 'name')
      .populate('product', 'name');

    res.json({
      products,
      activeBids
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ✅ Create new product for bidding (FIXED)
router.post('/products', auth, roleAuth(['farmer']), uploadLimiter, validate(productCreateSchema), async (req, res) => {
  const {
    name,
    description,
    category,
    quantity,
    unit,
    basePrice,
    biddingEndTime,
    images,
    image,
    location
  } = req.body;

  try {
    const product = new Product({
      farmer: req.user.id,
      name,
      description,
      category,
      quantity,
      unit,
      basePrice,
      currentBid: basePrice,   
      biddingEndTime,
      images,
      image,
      location,
      status: 'active'          
    });

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get farmer's products
router.get('/products', auth, roleAuth(['farmer']), async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user.id });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update product
router.put('/products/:id', auth, roleAuth(['farmer']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.farmer.toString() !== req.user.id) {
      console.warn(`🔒 [UNAUTHORIZED UPDATE ATTEMPT] User ${req.user.id} tried to update product ${req.params.id} owned by farmer ${product.farmer}`);
      return res.status(403).json({ message: 'Forbidden: You do not own this product' });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete product
router.delete('/products/:id', auth, roleAuth(['farmer']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.farmer.toString() !== req.user.id) {
      console.warn(`🔒 [UNAUTHORIZED DELETE ATTEMPT] User ${req.user.id} tried to delete product ${req.params.id} owned by farmer ${product.farmer}`);
      return res.status(403).json({ message: 'Forbidden: You do not own this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
