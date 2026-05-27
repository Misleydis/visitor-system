/**
 * Models index file for easy imports
 */

const User = require('./User');
const Visitor = require('./Visitor');
const ActivityLog = require('./ActivityLog');
const ResetCode = require('./ResetCode');
const RefreshToken = require('./RefreshToken');

module.exports = {
  User,
  Visitor,
  ActivityLog,
  ResetCode,
  RefreshToken
};
