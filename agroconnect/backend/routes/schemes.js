const express = require('express');
const { auth, roleAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { schemeSchema } = require('../utils/validators');
const GovernmentScheme = require('../models/GovernmentScheme');

const router = express.Router();

// @route   GET api/schemes
// @desc    Get all government schemes
// @access  Public (or Private)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { eligibility: { $regex: search, $options: 'i' } }
      ];
    }

    const schemes = await GovernmentScheme.find(query).sort({ createdAt: -1 });
    res.json(schemes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/schemes
// @desc    Create a government scheme
// @access  Private (Admin Only)
router.post('/', [auth, roleAuth(['admin'])], validate(schemeSchema), async (req, res) => {
  const { title, description, eligibility, benefits, link, category, state } = req.body;

  try {
    const scheme = new GovernmentScheme({
      title,
      description,
      eligibility,
      benefits,
      link,
      category,
      state
    });

    await scheme.save();
    res.json(scheme);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
