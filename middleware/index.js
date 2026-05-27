/**
 * Middleware index file for easy imports
 */

const auth = require('./auth');
const roleCheck = require('./roleCheck');
const { errorHandler, notFound } = require('./errorHandler');
const { authLimiter, apiLimiter, passwordResetLimiter } = require('./rateLimiter');

module.exports = {
  auth,
  roleCheck,
  errorHandler,
  notFound,
  authLimiter,
  apiLimiter,
  passwordResetLimiter
};
