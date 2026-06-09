const User = require('../../models/User');
const { getAuthContext } = require('../../utils/authContext');

/*
 * DELETE /api/users/:id
 * Requesting user role: JWT header (x-auth-token)
 */
exports.deleteUser = async (req, res) => {
  try {
    const auth = await getAuthContext(req);
    const requestingUser = await User.findById(auth.id);
    const userToDelete = await User.findById(req.params.id);

    if (requestingUser && ['it_admin', 'admin'].includes(requestingUser.role)) {
      if (userToDelete && userToDelete.role === 'super_admin') {
        return res.status(403).json({ msg: 'Cannot delete super admin' });
      }
    } else if (requestingUser && requestingUser.role === 'security_admin') {
      if (userToDelete && ['it_admin', 'super_admin'].includes(userToDelete.role)) {
        return res.status(403).json({ msg: 'Security admin cannot delete IT admin or super admin' });
      }
    } else if (!requestingUser) {
      console.warn('Warning: requestingUser is null, proceeding with user deletion');
    } else {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error('Error in DELETE /users/:id:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
