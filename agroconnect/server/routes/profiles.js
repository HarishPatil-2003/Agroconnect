const express = require('express');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { profileCreateSchema, changePasswordSchema } = require('../utils/validators');
const User = require('../models/User');
const Profile = require('../models/Profile');

const router = express.Router();

// @route   GET api/profiles/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email', 'role']);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/profiles
// @desc    Create or update user profile
// @access  Private
router.post(
  '/',
  uploadLimiter,
  auth,
  validate(profileCreateSchema),
  async (req, res) => {
    const {
      fullName,
      email,
      phone,
      address,
      state,
      district,
      village,
      pincode,
      gender,
      dateOfBirth,
      role,
      bio,
      preferredLanguage,
      profilePhoto,
      farmSize,
      primaryCrops,
      equipmentOwned,
      businessName,
      gstNumber
    } = req.body;

    // Build profile object
    const profileFields = {
      user: req.user.id,
      fullName,
      email,
      phone,
      address,
      state,
      district,
      village,
      pincode,
      gender,
      dateOfBirth,
      role,
      bio,
      preferredLanguage,
      profilePhoto
    };

    if (role === 'farmer') {
      profileFields.farmSize = farmSize || 0;
      profileFields.primaryCrops = Array.isArray(primaryCrops)
        ? primaryCrops
        : primaryCrops ? primaryCrops.split(',').map(crop => crop.trim()) : [];
      profileFields.equipmentOwned = Array.isArray(equipmentOwned)
        ? equipmentOwned
        : equipmentOwned ? equipmentOwned.split(',').map(eq => eq.trim()) : [];
      profileFields.businessName = undefined;
      profileFields.gstNumber = undefined;
    } else if (role === 'buyer') {
      profileFields.businessName = businessName;
      profileFields.gstNumber = gstNumber;
      profileFields.farmSize = 0;
      profileFields.primaryCrops = [];
      profileFields.equipmentOwned = [];
    }

    try {
      console.log(`[PROFILE_UPDATE] Updating profile for User ID: ${req.user.id}, FullName: ${fullName}`);

      // Sync User document in MongoDB
      await User.findByIdAndUpdate(req.user.id, {
        name: fullName,
        profilePicture: profilePhoto,
        phone: phone,
        address: address
      });

      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).populate('user', ['name', 'email', 'role']);
        console.log(`[PROFILE_UPDATE] Successfully updated existing profile for User ID: ${req.user.id}`);
        return res.json(profile);
      }

      // Create
      profile = new Profile(profileFields);
      await profile.save();
      const populatedProfile = await Profile.findById(profile._id).populate('user', ['name', 'email', 'role']);
      console.log(`[PROFILE_UPDATE] Successfully created new profile for User ID: ${req.user.id}`);
      res.json(populatedProfile);
    } catch (err) {
      console.error('[PROFILE_UPDATE_ERROR]', err);
      res.status(500).json({ message: `Server error saving profile: ${err.message}` });
    }
  }
);

// @route   PUT api/profiles/change-password
// @desc    Change user password
// @access  Private
router.put(
  '/change-password',
  auth,
  validate(changePasswordSchema),
  async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid old password' });
      }

      user.password = await bcrypt.hash(newPassword, 12);
      await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/profiles
// @desc    Delete profile & user account
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove profile
    await Profile.findOneAndDelete({ user: req.user.id });
    // Remove user
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
