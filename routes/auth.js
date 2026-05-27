const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const ResetCode = require('../models/ResetCode');
const logger = require('../utils/logger');
const {
  generateTokenPair,
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  verifyAccessToken
} = require('../utils/session');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashedPassword, role: 'pending', status: 'pending' });
    await user.save();
    res.status(201).json({ msg: 'Account created. Waiting for admin approval.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  logger.info('Login attempt', { email });
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('User not found', { email });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    logger.info('User found', { email, role: user.role, status: user.status, isActive: user.isActive });
    
    if (user.role !== 'admin' && (user.status !== 'active' || user.role === 'pending')) {
      logger.warn('Account not approved', { email, role: user.role, status: user.status });
      return res.status(403).json({ msg: 'Account not approved by admin yet.' });
    }
    if (!user.isActive) {
      logger.warn('Account deactivated', { email });
      return res.status(403).json({ msg: 'Account is deactivated.' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Invalid password', { email });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    logger.info('Password match, generating tokens', { email });
    
    // Generate token pair with refresh token
    const tokens = await generateTokenPair(user);
    
    logger.info('Tokens generated successfully', { email });
    
    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    logger.error('Login error', { error: err.message, stack: err.stack });
    res.status(500).json({ msg: 'Server error' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ msg: 'Refresh token is required' });
  }
  
  try {
    const tokens = await refreshAccessToken(refreshToken);
    
    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: err.message || 'Invalid or expired refresh token' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Logout from all devices
router.post('/logout-all', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    
    const decoded = verifyAccessToken(token);
    await revokeAllUserTokens(decoded.id);
    
    res.json({ msg: 'Logged out from all devices successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Request password reset (send code)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'Email not found' });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save code in database
    await ResetCode.deleteMany({ email }); // remove old codes
    await ResetCode.create({ email, code });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code',
      html: `<p>Your password reset code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
    });

    res.json({ msg: 'Verification code sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Verify code and reset password
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const resetEntry = await ResetCode.findOne({ email, code });
    if (!resetEntry) return res.status(400).json({ msg: 'Invalid or expired code' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    // Delete used code
    await ResetCode.deleteMany({ email });

    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;