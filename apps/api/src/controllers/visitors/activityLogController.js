const ActivityLog = require('../../models/ActivityLog');
const { getAuthContext } = require('../../utils/authContext');

/*
 * GET /api/visitors/logs
 * Requesting user role: JWT header (x-auth-token)
 */
exports.getActivityLogs = async (req, res) => {
  try {
    const auth = await getAuthContext(req);
    let query = {};

    if (auth.role === 'security_admin') {
      query = { userRole: { $nin: ['it_admin', 'super_admin'] } };
    }

    const logs = await ActivityLog.find(query).sort({ timestamp: -1 }).limit(500);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
