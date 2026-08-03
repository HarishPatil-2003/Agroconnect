const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendOtpEmail } = require('../utils/email');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema
} = require('../utils/validators');

const router = express.Router();

// Helper: Password Policy Matcher (8-64 chars, min 1 upper, 1 lower, 1 digit, 1 special)
const validatePasswordPolicy = (password) => {
  if (!password || password.length < 8 || password.length > 64) return false;
  const hasUpper   = /[A-Z]/.test(password);
  const hasLower   = /[a-z]/.test(password);
  const hasNumber  = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return hasUpper && hasLower && hasNumber && hasSpecial;
};

// Helper: 10-Digit Indian Phone Number Validator
const validateIndianPhone = (phone) => {
  if (!phone) return false;
  const clean = phone.replace(/[^0-9]/g, '');
  return /^[6-9]\d{9}$/.test(clean);
};

/* =========================================
   POST /api/auth/register
   ========================================= */
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  async (req, res) => {
    console.log(`\n📥 [AUTH REQ] POST /api/auth/register - Email: ${req.body.email}`);
    
    const { name, email, phone, password, role, address } = req.body;
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    try {
      // Double-ensure email normalization
      const normalizedEmail = email.trim().toLowerCase();

      // Check Duplicate Email
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        console.warn(`❌ [DUPLICATE] Email already registered: ${normalizedEmail}`);
        return res.status(400).json({ message: 'Email address is already registered.' });
      }

      // Check Duplicate Phone
      const existingPhone = await User.findOne({ phone: cleanPhone });
      if (existingPhone) {
        console.warn(`❌ [DUPLICATE] Phone already registered: ${cleanPhone}`);
        return res.status(400).json({ message: 'Phone number is already registered.' });
      }

      // Hash Password using BCrypt (cost factor 12)
      const hashedPassword = await bcrypt.hash(password, 12);

      // Generate 6-Digit Verification OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      console.log(`🔐 [OTP GEN] Generated 6-Digit OTP: ${otp} for ${normalizedEmail} (Expires: 15 mins)`);

      const user = new User({
        name,
        email: normalizedEmail,
        phone: cleanPhone,
        password: hashedPassword,
        role: role || 'farmer',
        address: address || '',
        isVerified: false,
        otp,
        otpExpiry,
        otpAttempts: 0,
        otpResendCount: 0,
        otpLastSentAt: new Date()
      });

      await user.save();
      console.log(`💾 [MONGO WRITE SUCCESS] User registered with isVerified = false (ID: ${user._id})`);

      // Send OTP Email via Nodemailer
      const sendResult = await sendOtpEmail(normalizedEmail, otp, name, 'registration');
      console.log(`✉️ [SMTP SEND] Method: ${sendResult.method}`);

      res.status(201).json({
        message: 'Registration successful! A 6-digit verification code has been sent to your email.',
        email: user.email,
        requiresVerification: true,
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
      });
    } catch (err) {
      console.error(`💥 [REGISTRATION ERROR] Path: ${req.originalUrl} | Method: ${req.method} | Body:`, { ...req.body, password: req.body.password ? '***' : undefined }, `\nStack Trace:`, err.stack);
      res.status(500).json({ message: `Database write or server error: ${err.message}` });
    }
  }
);

/* =========================================
   POST /api/auth/verify-otp
   ========================================= */
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), async (req, res) => {
  const { email, otp } = req.body;
  console.log(`\n📥 [AUTH REQ] POST /api/auth/verify-otp - Email: ${email} | Code: ${otp}`);

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email address and 6-digit OTP code are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.warn(`❌ [OTP VERIFY FAILED] User not found: ${email}`);
      return res.status(404).json({ message: 'User account not found.' });
    }

    if (user.isVerified) {
      console.log(`ℹ️ [OTP VERIFY] User already verified.`);
      return res.status(400).json({ message: 'Account is already verified. Please sign in.' });
    }

    // Check Max Attempts (5)
    if (user.otpAttempts >= 5) {
      console.warn(`❌ [OTP VERIFY FAILED] Max failed attempts reached (${user.otpAttempts})`);
      return res.status(400).json({ message: 'Too many failed attempts. Please click Resend OTP for a new code.' });
    }

    // Check Expiry (5 mins)
    if (!user.otpExpiry || Date.now() > new Date(user.otpExpiry).getTime()) {
      console.warn(`❌ [OTP VERIFY FAILED] OTP Code Expired for ${email}`);
      return res.status(400).json({ message: 'OTP code has expired (valid for 5 minutes). Please click Resend OTP.' });
    }

    // Compare OTP
    if (user.otp !== otp.trim()) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      console.warn(`❌ [OTP VERIFY MISMATCH] Attempt ${user.otpAttempts}/5 for ${email}`);
      return res.status(400).json({ message: `Invalid OTP code. (${5 - user.otpAttempts} attempts remaining)` });
    }

    // OTP Verification Success!
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();
    console.log(`✅ [ACCOUNT ACTIVATED] User ${email} marked isVerified = true`);

    // Generate 7-Day JWT Token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Generate 60-Minute JWT Access Token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '60m' });
    console.log(`🔑 [JWT ISSUED] Access token generated for User ID: ${user.id}`);

    // Set Refresh Token in HttpOnly Cookie (SameSite=None for cross-site Render-Vercel)
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Account successfully verified and activated!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isVerified: true,
        profilePicture: user.profilePicture || ''
      }
    });
  } catch (err) {
    console.error(`💥 [VERIFICATION ERROR] Path: ${req.originalUrl} | Method: ${req.method} | Body:`, req.body, `\nStack Trace:`, err.stack);
    res.status(500).json({ message: 'Server error during OTP verification.' });
  }
});

/* =========================================
   POST /api/auth/resend-otp
   ========================================= */
router.post('/resend-otp', authLimiter, validate(resendOtpSchema), async (req, res) => {
  const { email } = req.body;
  console.log(`\n📥 [AUTH REQ] POST /api/auth/resend-otp - Email: ${email}`);

  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified. Please sign in.' });
    }

    // Check Max Resend Limit (3)
    if (user.otpResendCount >= 3) {
      return res.status(400).json({ message: 'Maximum OTP resend limit reached (3 times). Please re-register.' });
    }

    // Cooldown check: 60 seconds
    if (user.otpLastSentAt && (Date.now() - new Date(user.otpLastSentAt).getTime()) < 60 * 1000) {
      const remainingSec = Math.ceil((60000 - (Date.now() - new Date(user.otpLastSentAt).getTime())) / 1000);
      return res.status(400).json({ message: `Please wait ${remainingSec} seconds before requesting a new OTP.` });
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = newOtp;
    user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpResendCount = (user.otpResendCount || 0) + 1;
    user.otpLastSentAt = new Date();

    await user.save();
    console.log(`🔄 [OTP RESENT] New OTP: ${newOtp} for ${email} (Resend ${user.otpResendCount}/3)`);

    const sendResult = await sendOtpEmail(email, newOtp, user.name, 'resend');

    res.json({
      message: 'A new 6-digit OTP code has been sent to your email.',
      resendsRemaining: 3 - user.otpResendCount,
      devOtp: process.env.NODE_ENV !== 'production' ? newOtp : undefined
    });
  } catch (err) {
    console.error(`💥 [RESEND OTP ERROR] Path: ${req.originalUrl} | Method: ${req.method} | Body:`, req.body, `\nStack Trace:`, err.stack);
    res.status(500).json({ message: 'Failed to resend verification OTP code.' });
  }
});

/* =========================================
   POST /api/auth/login
   ========================================= */
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  async (req, res) => {
    console.log(`\n📥 [AUTH REQ] POST /api/auth/login - Email: ${req.body.email}`);

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.warn(`❌ [LOGIN FAILED] User not found: ${email}`);
        return res.status(400).json({ message: 'Invalid email or password.' });
      }

      // Check Account Lockout State
      if (user.lockUntil && user.lockUntil > Date.now()) {
        const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
        console.warn(`🔒 [LOGIN BLOCKED] Account ${email} is temporarily locked out. Minutes left: ${minutesLeft}`);
        return res.status(403).json({
          message: 'Invalid email or password.'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        if (user.loginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
          console.warn(`🔒 [ACCOUNT LOCKED] Too many failed logins. User: ${email} locked for 15 mins.`);
        }
        await user.save();

        console.warn(`❌ [LOGIN FAILED] Invalid password for: ${email}. Attempt ${user.loginAttempts}/5`);
        
        return res.status(400).json({ message: 'Invalid email or password.' });
      }

      // Successful password check: Reset lockouts
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();

      // Check Account Verification Status
      if (!user.isVerified) {
        console.warn(`⚠️ [LOGIN BLOCKED] Account ${email} is not verified. Generating fresh OTP.`);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
        user.otpAttempts = 0;
        await user.save();
        await sendOtpEmail(email, otp, user.name, 'login_verification');

        return res.status(403).json({
          message: 'Account not verified. A new verification code has been sent to your email.',
          requiresVerification: true,
          email: user.email,
          devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
        });
      }

      // Sign 60-Minute JWT Access Token
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '60m' });
      
      // Set Refresh Token in HttpOnly Cookie (SameSite=None for cross-site Render-Vercel)
      const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      console.log(`🔑 [LOGIN SUCCESS] Issued token for User ID: ${user.id} (${user.role})`);

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          profilePicture: user.profilePicture || '',
          isVerified: true
        }
      });
    } catch (err) {
      console.error(`💥 [LOGIN ERROR] Path: ${req.originalUrl} | Method: ${req.method} | Body:`, { ...req.body, password: req.body.password ? '***' : undefined }, `\nStack Trace:`, err.stack);
      res.status(500).json({ message: 'Server error during sign in.' });
    }
  }
);

/* =========================================
   POST /api/auth/forgot-password
   ========================================= */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), async (req, res) => {
  const { email } = req.body;
  console.log(`\n📥 [AUTH REQ] POST /api/auth/forgot-password - Email: ${email}`);

  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account registered with this email address.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save();

    await sendOtpEmail(email, otp, user.name, 'reset');

    res.json({
      message: 'Password reset code sent to your email.',
      email: user.email,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (err) {
    console.error(`💥 [FORGOT PW ERROR] Path: ${req.originalUrl} | Method: ${req.method} | Body:`, req.body, `\nStack Trace:`, err.stack);
    res.status(500).json({ message: 'Failed to process forgot password request.' });
  }
});

/* =========================================
   POST /api/auth/reset-password
   ========================================= */
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), async (req, res) => {
  const { email, otp, newPassword } = req.body;
  console.log(`\n📥 [AUTH REQ] POST /api/auth/reset-password - Email: ${email}`);

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
  }

  if (!validatePasswordPolicy(newPassword)) {
    return res.status(400).json({ message: 'New password does not satisfy security policy requirements.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    if (!user.otpExpiry || Date.now() > new Date(user.otpExpiry).getTime()) {
      return res.status(400).json({ message: 'OTP code has expired.' });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Incorrect OTP code.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    console.log(`✅ [PASSWORD RESET SUCCESS] Updated password for ${email}`);
    res.json({ message: 'Password updated successfully! You can now sign in with your new password.' });
  } catch (err) {
    console.error(`💥 [RESET PW ERROR] Path: ${req.originalUrl} | Method: ${req.method} | Body:`, { ...req.body, newPassword: req.body.newPassword ? '***' : undefined }, `\nStack Trace:`, err.stack);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
});

/* =========================================
   GET /api/auth/me
   ========================================= */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry -otpAttempts -otpResendCount -otpLastSentAt');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error loading profile' });
  }
});

/* =========================================
   PUT /api/auth/profile
   ========================================= */
router.put('/profile', auth, validate(profileUpdateSchema), async (req, res) => {
  const { name, phone, address } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        profilePicture: user.profilePicture || ''
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

/* =========================================
   POST /api/auth/refresh
   ========================================= */
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User account not found.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account is not verified.' });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({ message: 'Account is locked.' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '60m' });
    res.json({ token });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired refresh token. Please sign in.' });
  }
});

/* =========================================
   POST /api/auth/logout
   ========================================= */
router.post('/logout', async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.json({ message: 'Successfully signed out!' });
});

module.exports = router;
