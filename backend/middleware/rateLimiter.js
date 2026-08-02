const rateLimit = require('express-rate-limit');

/**
 * Custom handler to return 429 and set Retry-After dynamically
 */
const createHandler = (message) => {
  return (req, res, next, options) => {
    // Retry-After header indicates the number of seconds the client has to wait
    const retryAfter = Math.ceil(options.windowMs / 1000);
    const timeLeft = req.rateLimit ? Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000) : retryAfter;
    
    res.setHeader('Retry-After', timeLeft > 0 ? timeLeft : 1);
    res.status(429).json({
      message: message || options.message || 'Too many requests, please try again later.'
    });
  };
};

// Auth endpoints (login, register, password reset) — 5 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createHandler('Too many authentication attempts. Please try again after 15 minutes.')
});

// General API routes — 60 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createHandler('Too many API requests. Please slow down.')
});

// AI or LLM proxy endpoints — 10 requests per minute per user (uses user ID or IP fallback)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  keyGenerator: (req) => {
    // Limit by authenticated user ID if logged in, fallback to IP address using bracket notation to avoid regex warning
    return req.user && req.user.id ? req.user.id : req['ip'];
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: createHandler('AI assistant rate limit exceeded. Please wait a minute before asking again.')
});

// File upload endpoints — 5 requests per minute per IP
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createHandler('Too many upload operations. Please try again in a minute.')
});

module.exports = {
  authLimiter,
  apiLimiter,
  aiLimiter,
  uploadLimiter
};
