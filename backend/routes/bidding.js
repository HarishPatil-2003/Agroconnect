const express = require('express');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { placeBidSchema } = require('../utils/validators');
const Product = require('../models/Product');
const Bid = require('../models/Bid');

const router = express.Router();

/**
 * GET PRODUCTS FOR BIDDING PAGE
 * - Buyer: all active products
 * - Farmer: only own products with bid stats
 */
router.get('/products', auth, async (req, res) => {
  try {
    let products;

    if (req.user.role === 'farmer') {
      // Farmer: only their products
      products = await Product.find({
        farmer: req.user.id
      }).populate('farmer', 'name');
    } else {
      // Buyer: all active products
      products = await Product.find({
        status: 'active',
        biddingEndTime: { $gt: new Date() }
      }).populate('farmer', 'name');
    }

    // Attach bid stats via single batched aggregation query
    const productIds = products.map(p => p._id);
    const bidStats = await Bid.aggregate([
      { $match: { product: { $in: productIds } } },
      {
        $group: {
          _id: '$product',
          totalBids: { $sum: 1 },
          highestBid: { $max: '$amount' }
        }
      }
    ]);

    const statsMap = new Map();
    bidStats.forEach(stat => {
      statsMap.set(stat._id.toString(), stat);
    });

    const enrichedProducts = products.map(product => {
      const stat = statsMap.get(product._id.toString());
      return {
        ...product.toObject(),
        totalBids: stat ? stat.totalBids : 0,
        highestBid: stat ? stat.highestBid : product.basePrice
      };
    });

    res.json(enrichedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

/**
 * PLACE BID (BUYER ONLY)
 */
router.post('/products/:id/bid', auth, validate(placeBidSchema), async (req, res) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ message: 'Only buyers can place bids' });
  }

  const { amount } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.farmer.toString() === req.user.id) {
      console.warn(`🔒 [UNAUTHORIZED SELF BID ATTEMPT] Farmer ${req.user.id} tried to bid on their own product ${product._id}`);
      return res.status(403).json({ message: 'Forbidden: You cannot bid on your own product' });
    }

    if (product.biddingEndTime < new Date()) {
      return res.status(400).json({ message: 'Bidding closed' });
    }

    if (amount <= product.currentBid) {
      return res.status(400).json({ message: 'Bid must be higher than current bid' });
    }

    await Bid.create({
      product: product._id,
      buyer: req.user.id,
      amount
    });

    product.currentBid = amount;
    await product.save();

    res.json({ message: 'Bid placed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
