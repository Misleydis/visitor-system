const User = require('../../models/User');
const { getAuthContext } = require('../../utils/authContext');

/*
 * GET /api/users
 * Requesting user role: JWT header (x-auth-token)
 */
exports.getUsers = async (req, res) => {
  try {
    const auth = await getAuthContext(req);
    const requestingUser = await User.findById(auth.id);

    let query = {};
    if (requestingUser && ['security_admin', 'admin'].includes(requestingUser.role)) {
      query = { role: { $nin: ['it_admin', 'super_admin'] } };
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error in GET /users:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

/*
 * GET /api/users/pending
 * Returns users awaiting admin approval
 */
exports.getPendingUsers = async (req, res) => {
  try {
    const auth = await getAuthContext(req);
    const requestingUser = await User.findById(auth.id);

    if (!requestingUser) return res.status(404).json({ msg: 'User not found' });
    if (requestingUser.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

    const pendingUsers = await User.find({ status: 'pending', role: 'pending' }).select('-password');
    res.json(pendingUsers);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
