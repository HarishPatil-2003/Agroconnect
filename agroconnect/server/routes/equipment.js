const express = require('express');
const { auth, roleAuth } = require('../middleware/auth');
const Equipment = require('../models/Equipment');

const router = express.Router();

// Get all available equipment
router.get('/', async (req, res) => {
  try {
    const equipment = await Equipment.find({ availability: true }).populate('owner', 'name');
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get equipment by ID
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate('owner', 'name phone');
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add new equipment (farmers and admins)
router.post('/', auth, roleAuth(['farmer', 'admin']), async (req, res) => {
  const { name, description, category, rentalPrice, priceUnit, location, images, specifications, condition } = req.body;

  try {
    const equipment = new Equipment({
      owner: req.user.id,
      name,
      description,
      category,
      rentalPrice,
      priceUnit,
      location,
      images,
      specifications,
      condition
    });

    await equipment.save();
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update equipment (owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOne({ _id: req.params.id, owner: req.user.id });
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found or not authorized' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      equipment[key] = updates[key];
    });

    await equipment.save();
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete equipment (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found or not authorized' });
    }

    res.json({ message: 'Equipment deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get equipment owned by user
router.get('/my/equipment', auth, roleAuth(['farmer', 'admin']), async (req, res) => {
  try {
    const equipment = await Equipment.find({ owner: req.user.id });
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Rent equipment
router.post('/:id/rent', auth, roleAuth(['farmer', 'buyer']), async (req, res) => {
  const { days } = req.body;

  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (!equipment.availability) {
      return res.status(400).json({ message: 'Equipment is not available' });
    }

    // Mark equipment as rented
    equipment.availability = false;
    await equipment.save();

    res.json({ message: 'Equipment rented successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
