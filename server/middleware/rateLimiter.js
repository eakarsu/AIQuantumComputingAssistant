const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

// General API rate limiter
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => ipKeyGenerator(req, res),
  validate: false,
});

// AI-specific rate limiter: 20 requests per hour, keyed by user ID or IP
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req, res) => {
    // Use user ID from JWT if available, else fall back to IPv6-safe IP key
    return req.user?.id ? `user_${req.user.id}` : ipKeyGenerator(req, res);
  },
  message: { error: 'AI rate limit exceeded. Maximum 20 AI requests per hour per user.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

module.exports = { apiRateLimiter, aiRateLimiter };
