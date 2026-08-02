const express = require('express');
const { auth, roleAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { placeBidBuyerSchema } = require('../utils/validators');
const Product = require('../models/Product');
const Bid = require('../models/Bid');

const router = express.Router();

/**
 * GET Buyer Dashboard
 */
router.get('/dashboard', auth, roleAuth(['buyer']), async (req, res) => {
  try {
    // Buyer bids
    const myBids = await Bid.find({ buyer: req.user.id })
      .populate({
        path: 'product',
        select: 'name basePrice currentBid biddingEndTime status'
      });

    // 🔥 FIX: populate farmer here
    const activeProducts = await Product.find({
      status: 'active',
      biddingEndTime: { $gt: new Date() }
    }).populate('farmer', 'name');

    res.json({
      myBids,
      activeProducts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET All Active Products (optional separate API)
 */
router.get('/products', auth, roleAuth(['buyer']), async (req, res) => {
  try {
    const products = await Product.find({
      status: 'active',
      biddingEndTime: { $gt: new Date() }
    }).populate('farmer', 'name');

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Place a Bid
 */
router.post('/bids', auth, roleAuth(['buyer']), validate(placeBidBuyerSchema), async (req, res) => {
  const { productId, amount } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.farmer.toString() === req.user.id) {
      console.warn(`🔒 [UNAUTHORIZED SELF BID ATTEMPT] Farmer ${req.user.id} tried to bid on their own product ${product._id} via buyer bids`);
      return res.status(403).json({ message: 'Forbidden: You cannot bid on your own product' });
    }

    if (product.status !== 'active' || product.biddingEndTime < new Date()) {
      return res.status(400).json({ message: 'Bidding closed' });
    }

    if (amount <= product.currentBid) {
      return res.status(400).json({ message: 'Bid must be higher' });
    }

    let bid = await Bid.findOne({ product: productId, buyer: req.user.id });

    if (bid) {
      bid.amount = amount;
      bid.bidTime = new Date();
      await bid.save();
    } else {
      bid = await Bid.create({
        product: productId,
        buyer: req.user.id,
        amount
      });
    }

    product.currentBid = amount;
    await product.save();

    res.json({ message: 'Bid placed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get Buyer Bids
 */
router.get('/bids', auth, roleAuth(['buyer']), async (req, res) => {
  try {
    const bids = await Bid.find({ buyer: req.user.id })
      .populate('product', 'name basePrice currentBid biddingEndTime status');

    res.json(bids);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
