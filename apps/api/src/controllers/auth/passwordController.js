const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../../models/User');
const ResetCode = require('../../models/ResetCode');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/*
 * POST /api/auth/forgot-password
 * Sends a 6-digit verification code to the user's email
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'Email not found' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await ResetCode.deleteMany({ email });
    await ResetCode.create({ email, code });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code',
      html: `<p>Your password reset code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`
    });

    res.json({ msg: 'Verification code sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

/*
 * POST /api/auth/reset-password
 * Verifies the code and updates the user's password
 */
exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const resetEntry = await ResetCode.findOne({ email, code });
    if (!resetEntry) return res.status(400).json({ msg: 'Invalid or expired code' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await ResetCode.deleteMany({ email });
    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
