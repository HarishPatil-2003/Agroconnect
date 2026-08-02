const express = require('express');
const { auth, roleAuth } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { equipmentCreateSchema, bookingCreateSchema } = require('../utils/validators');
const Equipment       = require('../models/Equipment');
const RentalBooking   = require('../models/RentalBooking');
const EquipmentReview = require('../models/EquipmentReview');
const Notification    = require('../models/Notification');
const User            = require('../models/User');

const router = express.Router();

// Auto-seed initial agricultural machinery fleet if MongoDB collection is empty
const seedEquipmentDB = async () => {
  try {
    const count = await Equipment.countDocuments();
    if (count === 0) {
      console.log('🚜 Seeding Peer-to-Peer Agricultural Equipment Fleet...');
      
      // Find or create default admin/farmer owner
      let owner = await User.findOne({ role: 'farmer' });
      if (!owner) {
        owner = await User.findOne({});
      }

      const ownerId = owner ? owner._id : null;
      if (!ownerId) return;

      await Equipment.insertMany([
        {
          owner: ownerId,
          name: 'Mahindra Novo 605 DI 4WD Tractor',
          category: 'Tractor',
          brand: 'Mahindra',
          model: '2025 Model (60 HP)',
          description: '60 HP heavy duty 4WD tractor equipped with AC cabin, power steering, dual clutch, and high torque output. Ideal for heavy deep tillage, rotavator, and haulage.',
          image: 'https://images.unsplash.com/photo-1530267981608-bc34111dd461?auto=format&fit=crop&w=800&q=80',
          dailyPrice: 1800,
          hourlyPrice: 350,
          weeklyPrice: 11000,
          monthlyPrice: 40000,
          securityDeposit: 2000,
          operatorIncluded: true,
          fuelIncluded: false,
          pickupAvailable: true,
          deliveryAvailable: true,
          location: 'Nashik, Maharashtra',
          village: 'Pimpalgaon',
          district: 'Nashik',
          state: 'Maharashtra',
          availability: true,
          rating: 4.9,
          reviewsCount: 18,
          isVerified: true
        },
        {
          owner: ownerId,
          name: 'Kubota Harvester DC-68G Combine',
          category: 'Harvester',
          brand: 'Kubota',
          model: '2024 Paddy & Wheat Special',
          description: 'High-speed paddy and wheat combine harvester with rubber crawler tracks. Minimal grain loss and excellent performance in muddy wetland conditions.',
          image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
          dailyPrice: 4500,
          hourlyPrice: 850,
          weeklyPrice: 28000,
          monthlyPrice: 95000,
          securityDeposit: 5000,
          operatorIncluded: true,
          fuelIncluded: true,
          pickupAvailable: true,
          deliveryAvailable: true,
          location: 'Jalgaon, Maharashtra',
          village: 'Bhadgaon',
          district: 'Jalgaon',
          state: 'Maharashtra',
          availability: true,
          rating: 4.8,
          reviewsCount: 14,
          isVerified: true
        },
        {
          owner: ownerId,
          name: 'Shaktiman 7 Feet Heavy Duty Rotavator',
          category: 'Rotavator',
          brand: 'Shaktiman',
          model: 'Regular Series (Boron Steel)',
          description: '7 feet wide boron steel tiller blades. Perfect for rapid secondary tillage, seedbed preparation, and incorporating crop residue into soil.',
          image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=800&q=80',
          dailyPrice: 850,
          hourlyPrice: 180,
          weeklyPrice: 5000,
          monthlyPrice: 18000,
          securityDeposit: 1000,
          operatorIncluded: false,
          fuelIncluded: false,
          pickupAvailable: true,
          deliveryAvailable: true,
          location: 'Sangli, Maharashtra',
          village: 'Tasgaon',
          district: 'Sangli',
          state: 'Maharashtra',
          availability: true,
          rating: 4.7,
          reviewsCount: 9,
          isVerified: true
        },
        {
          owner: ownerId,
          name: 'Agronomy Autonomous Crop Spraying Drone (16L)',
          category: 'Drone',
          brand: 'DJI Agriculture',
          model: 'Agras T20P (16 Liter Tank)',
          description: 'Precision autonomous GPS spray drone. Covers 1 acre in 7 minutes with ultra-fine droplet nozzle spray. Includes certified drone pilot operator.',
          image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
          dailyPrice: 2500,
          hourlyPrice: 600,
          weeklyPrice: 15000,
          monthlyPrice: 50000,
          securityDeposit: 3000,
          operatorIncluded: true,
          fuelIncluded: true,
          pickupAvailable: false,
          deliveryAvailable: true,
          location: 'Nashik, Maharashtra',
          village: 'Dindori',
          district: 'Nashik',
          state: 'Maharashtra',
          availability: true,
          rating: 4.9,
          reviewsCount: 22,
          isVerified: true
        }
      ]);
      console.log('✅ Equipment fleet seeded!');
    }
  } catch (err) {
    console.error('Error seeding equipment fleet:', err);
  }
};

seedEquipmentDB();

/* =========================================
   GET /api/equipment (Search & Filter)
   ========================================= */
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, operator, fuel, availability, sort } = req.query;
    let filter = {};

    if (category && category !== 'All') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (availability === 'true') {
      filter.availability = true;
    }

    if (operator === 'true') {
      filter.operatorIncluded = true;
    }

    if (fuel === 'true') {
      filter.fuelIncluded = true;
    }

    if (maxPrice) {
      filter.dailyPrice = { $lte: Number(maxPrice) };
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { model: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { village: { $regex: q, $options: 'i' } },
        { district: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ];
    }

    let query = Equipment.find(filter).populate('owner', 'name email phone role profilePicture');

    if (sort === 'price-low') {
      query = query.sort({ dailyPrice: 1 });
    } else if (sort === 'price-high') {
      query = query.sort({ dailyPrice: -1 });
    } else if (sort === 'rating') {
      query = query.sort({ rating: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const equipment = await query.exec();
    res.json(equipment);
  } catch (err) {
    console.error('Error fetching equipment list:', err);
    res.status(500).json({ message: 'Server error loading equipment' });
  }
});

/* =========================================
   GET /api/equipment/categories
   ========================================= */
router.get('/categories', async (req, res) => {
  try {
    const categoriesInUse = await Equipment.distinct('category');
    res.json(['All', ...categoriesInUse]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

/* =========================================
   GET /api/equipment/my-listings (Owner Dashboard)
   ========================================= */
router.get('/my-listings', auth, roleAuth(['farmer', 'admin']), async (req, res) => {
  try {
    const myListings = await Equipment.find({ owner: req.user.id }).sort({ createdAt: -1 });
    const rentalRequests = await RentalBooking.find({ owner: req.user.id })
      .populate('equipment')
      .populate('renter', 'name email phone role profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      listings: myListings,
      requests: rentalRequests
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch owner listings & requests' });
  }
});

/* =========================================
   GET /api/equipment/my-bookings (Renter Dashboard)
   ========================================= */
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await RentalBooking.find({ renter: req.user.id })
      .populate('equipment')
      .populate('owner', 'name email phone profilePicture')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch renter bookings' });
  }
});

/* =========================================
   GET /api/equipment/:id (Details + Owner + Reviews)
   ========================================= */
router.get('/:id', async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id).populate('owner', 'name email phone role profilePicture');
    if (!item) {
      return res.status(404).json({ message: 'Machinery not found' });
    }
    const reviews = await EquipmentReview.find({ equipment: item._id }).sort({ createdAt: -1 });
    res.json({ item, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch machinery details' });
  }
});

/* =========================================
   POST /api/equipment (Farmers & Admins create machinery)
   ========================================= */
router.post('/', auth, roleAuth(['farmer', 'admin']), uploadLimiter, validate(equipmentCreateSchema), async (req, res) => {
  try {
    const {
      name, category, brand, model, description, image, images,
      dailyPrice, hourlyPrice, weeklyPrice, monthlyPrice, securityDeposit,
      operatorIncluded, fuelIncluded, pickupAvailable, deliveryAvailable,
      village, district, state, latitude, longitude
    } = req.body;

    const newEquipment = new Equipment({
      owner: req.user.id,
      name,
      category,
      brand: brand || 'Generic',
      model: model || '2025',
      description,
      image: image || (images && images[0]) || 'https://images.unsplash.com/photo-1530267981608-bc34111dd461?auto=format&fit=crop&w=800&q=80',
      images: images || [],
      dailyPrice: Number(dailyPrice),
      hourlyPrice: Number(hourlyPrice) || 0,
      weeklyPrice: Number(weeklyPrice) || 0,
      monthlyPrice: Number(monthlyPrice) || 0,
      securityDeposit: Number(securityDeposit) || 1000,
      operatorIncluded: Boolean(operatorIncluded),
      fuelIncluded: Boolean(fuelIncluded),
      pickupAvailable: Boolean(pickupAvailable),
      deliveryAvailable: Boolean(deliveryAvailable),
      location: `${village || 'Nashik'}, ${district || 'Nashik'}, ${state || 'Maharashtra'}`,
      village: village || 'Nashik',
      district: district || 'Nashik',
      state: state || 'Maharashtra',
      latitude: Number(latitude) || 19.9975,
      longitude: Number(longitude) || 73.7898
    });

    await newEquipment.save();
    const populated = await Equipment.findById(newEquipment._id).populate('owner', 'name email phone role');
    res.json(populated);
  } catch (err) {
    console.error('Failed to create machinery listing:', err);
    res.status(500).json({ message: `Failed to create machinery listing: ${err.message}` });
  }
});

/* =========================================
   POST /api/equipment/book (Farmers book rental)
   ========================================= */
router.post('/book', auth, roleAuth(['farmer', 'admin']), validate(bookingCreateSchema), async (req, res) => {
  try {
    const {
      equipmentId, startDate, endDate, rentalType,
      needOperator, needFuel, needDelivery, renterVillage, renterDistrict, farmSize
    } = req.body;

    const item = await Equipment.findById(equipmentId);
    if (!item) {
      return res.status(404).json({ message: 'Machinery not found' });
    }

    if (!item.availability) {
      return res.status(400).json({ message: 'This machinery is currently rented or unavailable' });
    }

    if (item.owner.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot rent your own equipment' });
    }

    const start = new Date(startDate);
    const end   = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Calculate Dynamic Pricing Formula
    let basePrice = item.dailyPrice;
    if (rentalType === 'hourly' && item.hourlyPrice > 0) {
      basePrice = item.hourlyPrice * 8; // 8 hours day standard
    } else if (rentalType === 'weekly' && item.weeklyPrice > 0) {
      basePrice = item.weeklyPrice / 7;
    }

    const baseRental = basePrice * days;
    const distanceKm = 15; // Calculated distance
    const distanceCharge = needDelivery ? distanceKm * 15 : 0;
    const deliveryCharge = needDelivery ? 500 : 0;
    const operatorCharge = needOperator ? (item.operatorIncluded ? 0 : 600 * days) : 0;
    const fuelCharge = needFuel ? (item.fuelIncluded ? 0 : 800 * days) : 0;
    const securityDeposit = item.securityDeposit || 1000;

    const totalCost = baseRental + distanceCharge + deliveryCharge + operatorCharge + fuelCharge + securityDeposit;

    const booking = new RentalBooking({
      equipment: item._id,
      renter: req.user.id,
      owner: item.owner,
      startDate: start,
      endDate: end,
      rentalType: rentalType || 'daily',
      days,
      baseRental,
      distanceCharge,
      deliveryCharge,
      operatorCharge,
      fuelCharge,
      securityDeposit,
      totalCost,
      status: 'Pending',
      renterVillage: renterVillage || '',
      renterDistrict: renterDistrict || '',
      farmSize: farmSize || ''
    });

    await booking.save();

    // Create Notification for Machinery Owner
    try {
      const renterUser = await User.findById(req.user.id);
      const notif = new Notification({
        user: item.owner,
        title: '🚜 New Equipment Rental Request!',
        message: `${renterUser.name} requested to rent your ${item.name} for ${days} day(s).`,
        type: 'rental_request',
        link: '/equipment?tab=my-listings'
      });
      await notif.save();
    } catch (e) {
      // notification silent catch
    }

    const populatedBooking = await RentalBooking.findById(booking._id)
      .populate('equipment')
      .populate('owner', 'name email phone');

    res.json(populatedBooking);
  } catch (err) {
    console.error('Failed to create rental booking:', err);
    res.status(500).json({ message: `Failed to process rental booking: ${err.message}` });
  }
});

/* =========================================
   PUT /api/equipment/booking/:id/status (Accept / Reject / Complete)
   ========================================= */
router.put('/booking/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await RentalBooking.findById(req.params.id).populate('equipment');
    if (!booking) {
      return res.status(404).json({ message: 'Rental booking not found' });
    }

    // Only owner or admin or renter (for cancellation) can update status
    if (booking.owner.toString() !== req.user.id && req.user.role !== 'admin' && booking.renter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to modify booking status' });
    }

    booking.status = status;
    await booking.save();

    // If accepted or completed, update machinery availability
    if (status === 'Accepted' || status === 'Active') {
      await Equipment.findByIdAndUpdate(booking.equipment._id, { availability: false });
    } else if (status === 'Completed' || status === 'Rejected' || status === 'Cancelled') {
      await Equipment.findByIdAndUpdate(booking.equipment._id, { availability: true });
    }

    // Notify renter of status change
    try {
      const ownerUser = await User.findById(req.user.id);
      const notif = new Notification({
        user: booking.renter,
        title: `🚜 Rental Booking ${status}`,
        message: `Your booking for ${booking.equipment.name} has been marked as ${status} by ${ownerUser.name}.`,
        type: 'rental_status',
        link: '/equipment?tab=my-bookings'
      });
      await notif.save();
    } catch (e) {
      // silent catch
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update booking status' });
  }
});

/* =========================================
   DELETE /api/equipment/:id
   ========================================= */
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Machinery not found' });
    }

    if (item.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this listing' });
    }

    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Machinery listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete listing' });
  }
});

module.exports = router;
