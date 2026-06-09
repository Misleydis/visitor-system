const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { msg: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { msg: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { msg: 'Too many password reset attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimiter, apiLimiter, passwordResetLimiter };
