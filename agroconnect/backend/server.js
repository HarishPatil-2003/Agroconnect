// server.js
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
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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

// PHASE 3: SMTP NODEMAILER AUDIT
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

// Server port
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 AgroConnect Server running on port ${PORT}`);
});