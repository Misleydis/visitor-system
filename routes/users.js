const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user._id);
    
    let query = {};
    
    // Security admin cannot see it_admin and super_admin
    // Admin can see all users except it_admin and super_admin
    if (requestingUser && (requestingUser.role === 'security_admin' || requestingUser.role === 'admin')) {
      query = { role: { $nin: ['it_admin', 'super_admin'] } };
    }
    
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error in GET /users:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.get('/pending', auth, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user._id);
    
    // IT admin, security admin, and admin can see pending users
    if (!['it_admin', 'security_admin', 'admin'].includes(requestingUser.role)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    const pendingUsers = await User.find({ status: 'pending', role: 'pending' }).select('-password');
    res.json(pendingUsers);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  const { name, email, password, role, initials } = req.body;
  try {
    const requestingUser = await User.findById(req.user._id);
    
    // IT admin and security admin can create admin, security, reception, security_admin
    if (requestingUser.role === 'it_admin' || requestingUser.role === 'security_admin') {
      if (!['admin', 'security', 'reception', 'security_admin'].includes(role)) {
        return res.status(403).json({ msg: 'Can only create admin, security, reception, or security admin' });
      }
    } else {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashedPassword, role, initials: initials || '', status: 'active' });
    await user.save();
    res.json({ user: { id: user.id, name, email, role, initials } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/approve/:id', auth, async (req, res) => {
  const { role, initials } = req.body;
  const validRoles = ['security', 'reception', 'admin', 'super_admin', 'it_admin', 'security_admin'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ msg: 'Valid role required' });
  }
  try {
    const requestingUser = await User.findById(req.user._id);
    
    // IT admin and security admin can approve admin, security, reception, security_admin
    if (requestingUser.role === 'it_admin' || requestingUser.role === 'security_admin') {
      if (!['admin', 'security', 'reception', 'security_admin'].includes(role)) {
        return res.status(403).json({ msg: 'Can only approve admin, security, reception, or security admin' });
      }
    } else {
      return res.status(403).json({ msg: 'Not authorized' });
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
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user._id);
    
    // IT admin and security admin can delete admin, security, reception, security_admin
    // But security admin cannot delete it_admin or super_admin
    if (requestingUser.role === 'it_admin') {
      // Can delete anyone except super_admin
      const userToDelete = await User.findById(req.params.id);
      if (userToDelete && userToDelete.role === 'super_admin') {
        return res.status(403).json({ msg: 'Cannot delete super admin' });
      }
    } else if (requestingUser.role === 'security_admin') {
      const userToDelete = await User.findById(req.params.id);
      if (userToDelete && ['it_admin', 'super_admin'].includes(userToDelete.role)) {
        return res.status(403).json({ msg: 'Security admin cannot delete IT admin or super admin' });
      }
    } else {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;