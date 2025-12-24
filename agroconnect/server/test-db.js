const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  console.error('Full error:', err);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/buyers', require('./routes/buyers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/bidding', require('./routes/bidding'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/guidance', require('./routes/guidance'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});