const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// Get all users (admin only)
router.get('/', auth, roleCheck('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create user (admin only)
router.post('/', auth, roleCheck('admin'), async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.json({ user: { id: user.id, name, email, role } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});
// Get all pending users (admin only)
router.get('/pending', auth, roleCheck('admin'), async (req, res) => {
    try {
      const pendingUsers = await User.find({ status: 'pending', role: null }).select('-password');
      res.json(pendingUsers);
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  });
  
  // Approve a user (admin assigns role: 'security' or 'reception')
  router.put('/approve/:id', auth, roleCheck('admin'), async (req, res) => {
    const { role } = req.body; // 'security' or 'reception'
    if (!role || !['security', 'reception'].includes(role)) {
      return res.status(400).json({ msg: 'Valid role (security/reception) required' });
    }
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });
      if (user.status === 'active') return res.status(400).json({ msg: 'User already approved' });
  
      user.role = role;
      user.status = 'active';
      await user.save();
  
      res.json({ msg: `User approved as ${role}` });
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  }); 
  
module.exports = router;