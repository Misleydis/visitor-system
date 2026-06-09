const bcrypt = require('bcryptjs');
const User = require('../../models/User');

/*
 * POST /api/auth/register
 * Self-registration — creates a pending account awaiting admin approval
 */
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'pending',
      status: 'pending'
    });

    await user.save();
    res.status(201).json({ msg: 'Account created. Waiting for admin approval.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
