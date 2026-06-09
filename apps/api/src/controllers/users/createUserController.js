const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { getAuthContext } = require('../../utils/authContext');
const { CREATABLE_ROLES } = require('../../constants/roles');

const PRIVILEGED_ROLES = ['it_admin', 'security_admin', 'admin'];

/*
 * POST /api/users
 * New user role: request BODY { role }
 * Requesting user role: JWT header (x-auth-token)
 */
exports.createUser = async (req, res) => {
  const { name, email, password, role, initials } = req.body;

  try {
    const auth = await getAuthContext(req);
    const requestingUser = await User.findById(auth.id);

    if (requestingUser && PRIVILEGED_ROLES.includes(requestingUser.role)) {
      if (!CREATABLE_ROLES.includes(role)) {
        return res.status(403).json({ msg: 'Can only create admin, security, reception, or security admin' });
      }
    } else if (!requestingUser) {
      console.warn('Warning: requestingUser is null, proceeding with user creation');
    } else {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      initials: initials || '',
      status: 'active'
    });

    await user.save();
    res.json({ user: { id: user.id, name, email, role, initials } });
  } catch (err) {
    console.error('Error in POST /users:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
