const User = require('../../models/User');
const { getAuthContext } = require('../../utils/authContext');
const { APPROVABLE_ROLES } = require('../../constants/roles');

const ADMIN_ASSIGNABLE = ['admin', 'security', 'reception', 'security_admin'];

/*
 * PUT /api/users/approve/:id
 * Assigned role: request BODY { role }
 * Requesting user role: JWT header (x-auth-token)
 */
exports.approveUser = async (req, res) => {
  const { role, initials } = req.body;

  try {
    const auth = await getAuthContext(req);
    const requestingUser = await User.findById(auth.id);

    if (!requestingUser) return res.status(404).json({ msg: 'User not found' });
    if (requestingUser.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });
    if (!ADMIN_ASSIGNABLE.includes(role)) {
      return res.status(403).json({ msg: 'Can only approve admin, security, reception, or security admin' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.role = role;
    user.status = 'active';
    if (initials) user.initials = initials;
    await user.save();

    res.json({ msg: `User approved as ${role}` });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
