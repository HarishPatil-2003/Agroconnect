const express = require('express');
const { auth } = require('../middleware/auth');
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

    // Attach bid stats
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const bids = await Bid.find({ product: product._id });

        const highestBid = bids.length
          ? Math.max(...bids.map(b => b.amount))
          : product.basePrice;

        return {
          ...product.toObject(),
          totalBids: bids.length,
          highestBid
        };
      })
    );

    res.json(enrichedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

/**
 * PLACE BID (BUYER ONLY)
 */
router.post('/products/:id/bid', auth, async (req, res) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ message: 'Only buyers can place bids' });
  }

  const { amount } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
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
