// server.js
// Force IPv4 DNS resolution before ANY network imports.
// Render (and many cloud providers) default to IPv6-first resolution, which can
// cause SMTP connections to smtp.gmail.com to time out because Gmail's SMTP
// servers only accept connections on IPv4 addresses.
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const cookieParser = require('cookie-parser');
const dotenv   = require('dotenv');
const compression = require('compression');
const { verifySmtpConnection } = require('./utils/email');

// Load environment variables from .env
dotenv.config();

const app = express();

// Trust reverse proxy (Render, Vercel, etc.) to get correct client IP for rate limiting
app.set('trust proxy', 1);

// Gzip/Brotli HTTP response compression middleware for JSON and text payloads (>1KB threshold)
app.use(compression({
  threshold: 1024, // 1 KB threshold
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    const cleanOrigin = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(allowed => allowed.replace(/\/$/, '') === cleanOrigin)
      || cleanOrigin.endsWith('.vercel.app');
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`❌ [CORS BLOCKED] Origin: ${origin} not in allowed origins list:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// PHASE 2: ENVIRONMENT AUDIT & VERIFICATION
console.log('🔍 Executing Environment & System Audit...');
if (!process.env.MONGODB_URI) {
  console.error('❌ CRITICAL ERROR: MONGODB_URI is missing in .env!');
} else {
  console.log('✅ MONGODB_URI verified');
}

if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL ERROR: JWT_SECRET is missing in .env!');
} else {
  console.log('✅ JWT_SECRET verified');
}

if (!process.env.REFRESH_SECRET) {
  console.error('❌ CRITICAL ERROR: REFRESH_SECRET is missing in .env!');
} else {
  console.log('✅ REFRESH_SECRET verified');
}

if (!process.env.EMAIL_USER && !process.env.SMTP_USER) {
  console.error('❌ CRITICAL ERROR: EMAIL_USER (or SMTP_USER) is missing in .env — OTP emails will NOT be sent!');
} else {
  console.log(`✅ EMAIL_USER verified: ${process.env.EMAIL_USER || process.env.SMTP_USER}`);
}

if (!process.env.EMAIL_PASS && !process.env.SMTP_PASS) {
  console.error('❌ CRITICAL ERROR: EMAIL_PASS (or SMTP_PASS) is missing in .env — OTP emails will NOT be sent!');
} else {
  console.log('✅ EMAIL_PASS verified');
}

// PHASE 3: SMTP NODEMAILER AUDIT — live connection test
verifySmtpConnection();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB connected successfully');
  
  // Seed Government Schemes if collection is empty
  const GovernmentScheme = require('./models/GovernmentScheme');
  const count = await GovernmentScheme.countDocuments();
  if (count === 0) {
    console.log('🌱 Seeding Government Schemes...');
    await GovernmentScheme.insertMany([
      {
        title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        description: 'An initiative by the government of India providing all landholding farmer families an income support of ₹6,000 per year in three equal installments.',
        eligibility: 'All small and marginal landholding farmer families who own cultivable land.',
        benefits: 'Direct financial assistance of ₹6,000 per annum, directly credited into bank accounts.',
        category: 'Financial Aid',
        state: 'All India',
        link: 'https://pmkisan.gov.in/'
      },
      {
        title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        description: 'An yield-based crop insurance scheme that protects farmers from financial losses arising due to natural calamities, pests, or disease outbreaks.',
        eligibility: 'All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers.',
        benefits: 'Low premium rates (1.5% to 5%) with complete financial coverage for crop damages.',
        category: 'Insurance',
        state: 'All India',
        link: 'https://pmfby.gov.in/'
      },
      {
        title: 'Subsidies on Micro Irrigation Systems (Per Drop More Crop)',
        description: 'Promotes micro-irrigation technologies like drip and sprinkler irrigation systems to conserve water resources and boost crop yields.',
        eligibility: 'All categories of farmers, with special preference given to small/marginal and women farmers.',
        benefits: 'Up to 55% financial subsidy for small/marginal farmers and up to 45% for other farmers.',
        category: 'Subsidies',
        state: 'All India',
        link: 'https://pmksy.gov.in/'
      },
      {
        title: 'Rashtriya Krishi Vikas Yojana (RKVY) Training',
        description: 'Comprehensive agricultural education and technology-handling workshop designed to train rural youths in organic farming and smart-tech practices.',
        eligibility: 'Young farmers and agricultural entrepreneurs wanting to adopt smart technologies.',
        benefits: 'Free certifications, hands-on training equipment, and ₹10,000 bootstrap grants.',
        category: 'Training',
        state: 'All India',
        link: 'https://rkvy.nic.in/'
      }
    ]);
    console.log('✅ Seeding completed!');
  }
})
.catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
});

// Routes
const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api', apiLimiter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/buyers', require('./routes/buyers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/bidding', require('./routes/bidding'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/guidance', require('./routes/guidance'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/stats', require('./routes/stats'));

// ── Diagnostic: GET /api/test-email ─────────────────────────────────────────
// Temporary endpoint to verify SMTP connectivity from inside Render's network.
// Call it with: GET https://<render-url>/api/test-email?to=you@gmail.com
// Remove or protect with auth middleware before shipping to production users.
const { sendOtpEmail } = require('./utils/email');
app.get('/api/test-email', async (req, res) => {
  const to = req.query.to || (process.env.EMAIL_USER || process.env.SMTP_USER);
  if (!to) {
    return res.status(400).json({ ok: false, message: 'Pass ?to=your@email.com or set EMAIL_USER.' });
  }

  console.log(`\n📧 [TEST EMAIL] Sending test OTP to: ${to}`);
  const testOtp = '0000'; // fixed placeholder — not stored anywhere
  try {
    const result = await sendOtpEmail(to, testOtp, 'Test User', 'registration');
    console.log(`✅ [TEST EMAIL] Delivered successfully to ${to}`);
    return res.json({ ok: true, message: `Test email delivered to ${to}`, result });
  } catch (err) {
    // Expose the full SMTP error object so we can diagnose infrastructure blocks
    const detail = {
      message : err.message,
      code    : err.code    || null,   // e.g. ETIMEDOUT, ECONNREFUSED, ESOCKET
      errno   : err.errno   || null,
      address : err.address || null,   // resolved IP — confirms IPv4 vs IPv6
      port    : err.port    || null,
      command : err.command || null,   // SMTP command that failed (e.g. CONNECT)
      response: err.response || null,  // raw SMTP server response line
    };
    console.error(`❌ [TEST EMAIL] Delivery failed to ${to}:`, detail);
    return res.status(502).json({ ok: false, error: detail });
  }
});

// Server port
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 AgroConnect Server running on port ${PORT}`);
});