const express = require('express');
const Visitor = require('../models/Visitor');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const generateTicketNumber = require('../utils/ticketGenerator');
const sendSMS = require('../utils/sms');
const router = express.Router();

// Register visitor (security only)
router.post('/', auth, roleCheck('security'), async (req, res) => {
  try {
    const { firstName, surname, nationalId, phoneNumber, department, personToVisit, purpose } = req.body;
    
    const ticketNumber = await generateTicketNumber();
    
    const visitor = new Visitor({
      ticketNumber,
      firstName,
      surname,
      nationalId,
      phoneNumber,
      department,
      personToVisit,
      purpose
    });
    
    await visitor.save();
    
    // Send SMS to visitor
    await sendSMS(phoneNumber, ticketNumber, firstName);
    
    res.json({ visitor, msg: 'Visitor registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get visitor by ticket number (reception only)
router.get('/ticket/:ticketNumber', auth, roleCheck('reception', 'admin', 'security'), async (req, res) => {
  try {
    const visitor = await Visitor.findOne({ ticketNumber: req.params.ticketNumber });
    if (!visitor) return res.status(404).json({ msg: 'Visitor not found' });
    res.json(visitor);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Record time-out (security only)
router.put('/:id/timeout', auth, roleCheck('security'), async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ msg: 'Visitor not found' });
    
    visitor.timeOut = new Date();
    visitor.status = 'completed';
    await visitor.save();
    
    res.json({ visitor, msg: 'Time-out recorded' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get today's visitors (admin, security)
router.get('/today', auth, roleCheck('admin', 'security'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const visitors = await Visitor.find({
      visitDate: { $gte: today, $lt: tomorrow }
    }).sort({ timeIn: -1 });
    
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all visitors (admin only)
router.get('/', auth, roleCheck('admin'), async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ visitDate: -1 });
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;