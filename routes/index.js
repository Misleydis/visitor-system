/**
 * Routes index file for easy imports
 */

const authRoutes = require('./auth');
const visitorRoutes = require('./visitors');
const userRoutes = require('./users');
const occurrenceBookRoutes = require('./occurrenceBook');

module.exports = {
  authRoutes,
  visitorRoutes,
  userRoutes,
  occurrenceBookRoutes
};
