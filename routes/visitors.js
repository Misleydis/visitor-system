const express = require('express');
const Visitor = require('../models/Visitor');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const generateTicketNumber = require('../utils/ticketGenerator');
const sendSMS = require('../utils/sms');
const router = express.Router();

// Helper to log activity
async function logActivity(userId, userName, userRole, action, targetType, targetId, details) {
  const log = new ActivityLog({ userId, userName, userRole, action, targetType, targetId, details });
  await log.save();
}

// Register visitor (security only)
router.post('/', auth, roleCheck('security'), async (req, res) => {
  try {
    const {
      firstName, surname, nationalId, phoneNumber, address, vehicleReg,
      site, personToVisit, personToVisitOther, purpose
    } = req.body;

    const ticketNumber = await generateTicketNumber();

    const visitor = new Visitor({
      ticketNumber, firstName, surname, nationalId, phoneNumber, address, vehicleReg,
      site, personToVisit, personToVisitOther, purpose
    });

    await visitor.save();

    // Log activity
    await logActivity(req.user.id, req.user.name, req.user.role, 'REGISTER_VISITOR', 'visitor', visitor._id, `Registered ${firstName} ${surname} (${ticketNumber})`);

    sendSMS(phoneNumber, ticketNumber, firstName);
    const io = req.app.get('io');
    if (io) io.emit('visitor_registered', { visitor });

    res.json({ visitor, msg: 'Visitor registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Edit visitor (security only) - allowed fields
router.put('/:id', auth, roleCheck('security'), async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ msg: 'Visitor not found' });
    const allowedUpdates = ['firstName', 'surname', 'nationalId', 'phoneNumber', 'address', 'vehicleReg', 'site', 'personToVisit', 'personToVisitOther', 'purpose'];
    let changes = [];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined && visitor[field] !== req.body[field]) {
        changes.push(`${field}: "${visitor[field]}" -> "${req.body[field]}"`);
        visitor[field] = req.body[field];
      }
    });
    if (changes.length === 0) return res.status(400).json({ msg: 'No changes detected' });
    await visitor.save();
    await logActivity(req.user.id, req.user.name, req.user.role, 'EDIT_VISITOR', 'visitor', visitor._id, `Edited visitor ${visitor.ticketNumber}: ${changes.join(', ')}`);
    const io = req.app.get('io');
    if (io) io.emit('visitor_updated', { visitor });
    res.json({ visitor, msg: 'Visitor updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete visitor (security and admin)
router.delete('/:id', auth, roleCheck('security', 'admin'), async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ msg: 'Visitor not found' });
    await logActivity(req.user.id, req.user.name, req.user.role, 'DELETE_VISITOR', 'visitor', visitor._id, `Deleted visitor ${visitor.ticketNumber} (${visitor.firstName} ${visitor.surname})`);
    await visitor.remove();
    const io = req.app.get('io');
    if (io) io.emit('visitor_deleted', { id: req.params.id });
    res.json({ msg: 'Visitor deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Record time-out (security and admin)
router.put('/:id/timeout', auth, roleCheck('security', 'admin'), async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ msg: 'Visitor not found' });
    visitor.timeOut = new Date();
    visitor.status = 'completed';
    await visitor.save();
    await logActivity(req.user.id, req.user.name, req.user.role, 'TIMEOUT_VISITOR', 'visitor', visitor._id, `Timed out ${visitor.firstName} ${visitor.surname} (${visitor.ticketNumber})`);
    const io = req.app.get('io');
    if (io) io.emit('visitor_checked_out', { visitorId: req.params.id, visitor });
    res.json({ visitor, msg: 'Time-out recorded' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Cancel visitor (security and admin)
router.put('/:id/cancel', auth, roleCheck('security', 'admin'), async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ msg: 'Visitor not found' });
    visitor.status = 'cancelled';
    visitor.cancelledAt = new Date();
    await visitor.save();
    await logActivity(req.user.id, req.user.name, req.user.role, 'CANCEL_VISITOR', 'visitor', visitor._id, `Cancelled visitor ${visitor.firstName} ${visitor.surname} (${visitor.ticketNumber})`);
    res.json({ msg: 'Visitor cancelled' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get activity logs (admin only)
router.get('/logs', auth, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user._id);
    let query = {};
    
    // Security admin cannot see logs from it_admin and super_admin
    if (requestingUser.role === 'security_admin') {
      query = { userRole: { $nin: ['it_admin', 'super_admin'] } };
    }
    
    const logs = await ActivityLog.find(query).sort({ timestamp: -1 }).limit(500);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ... keep existing routes: /ticket/:ticketNumber, /today, /, /returning

// Register visitor (security only)
router.post('/', auth, roleCheck('security'), async (req, res) => {
  try {
    const {
      firstName, surname, nationalId, phoneNumber, address, vehicleReg,
      site, personToVisit, personToVisitOther, purpose
    } = req.body;

    const ticketNumber = await generateTicketNumber();

    const visitor = new Visitor({
      ticketNumber, firstName, surname, nationalId, phoneNumber, address, vehicleReg,
      site, personToVisit, personToVisitOther, purpose
    });

    await visitor.save();

    // Send SMS (async)
    sendSMS(phoneNumber, ticketNumber, firstName);

    // Emit real‑time event for reception
    const io = req.app.get('io');
    if (io) io.emit('visitor_registered', { visitor });

    res.json({ visitor, msg: 'Visitor registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get visitor by ticket number (reception, admin, security)
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

    const io = req.app.get('io');
    if (io) io.emit('visitor_checked_out', { visitorId: req.params.id, visitor });

    res.json({ visitor, msg: 'Time-out recorded' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Cancel visitor (security only)
router.put('/:id/cancel', auth, roleCheck('security'), async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ msg: 'Visitor not found' });
    visitor.status = 'cancelled';
    visitor.cancelledAt = new Date();
    await visitor.save();
    res.json({ msg: 'Visitor cancelled' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Edit visitor (security only)
router.put('/:id', auth, roleCheck('security'), async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ msg: 'Visitor not found' });
    const allowedUpdates = ['firstName', 'surname', 'nationalId', 'phoneNumber', 'address', 'vehicleReg', 'site', 'personToVisit', 'personToVisitOther', 'purpose'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) visitor[field] = req.body[field];
    });
    await visitor.save();
    res.json(visitor);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get today's visitors (admin, security, reception)
router.get('/today', auth, roleCheck('admin', 'security', 'reception'), async (req, res) => {
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

// Get all visitors (admin, security)
router.get('/', auth, roleCheck('admin', 'security'), async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ visitDate: -1 });
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get returning visitors (nationalId appears more than once)
router.get('/returning', auth, roleCheck('security', 'admin'), async (req, res) => {
  try {
    const visitors = await Visitor.aggregate([
      { $group: { _id: "$nationalId", count: { $sum: 1 }, visits: { $push: "$$ROOT" } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;