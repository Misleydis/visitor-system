const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const logger = require('../../utils/logger');
const { generateTokenPair } = require('../../utils/session');

/*
 * POST /api/auth/login
 * Authenticates a user and returns access + refresh tokens
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  logger.info('Login attempt', { email });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('User not found', { email });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (user.role !== 'admin' && (user.status !== 'active' || user.role === 'pending')) {
      return res.status(403).json({ msg: 'Account not approved by admin yet.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ msg: 'Account is deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const tokens = await generateTokenPair(user);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    logger.error('Login error', { error: err.message });
    res.status(500).json({ msg: 'Server error' });
  }
};
