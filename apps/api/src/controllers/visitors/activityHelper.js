const ActivityLog = require('../../models/ActivityLog');

/*
 * Shared helper — records a user action in the activity log
 */
async function logActivity(userId, userName, userRole, action, targetType, targetId, details) {
  const log = new ActivityLog({ userId, userName, userRole, action, targetType, targetId, details });
  await log.save();
}

module.exports = { logActivity };
