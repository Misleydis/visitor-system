const auth = require('./auth');
const validate = require('./validate');
const roleCheck = require('./roleCheck');
const { errorHandler, notFound } = require('./errorHandler');
const { authLimiter, apiLimiter, passwordResetLimiter } = require('./rateLimiter');

module.exports = {
  auth,
  validate,
  roleCheck,
  errorHandler,
  notFound,
  authLimiter,
  apiLimiter,
  passwordResetLimiter
};
