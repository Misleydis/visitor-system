const express = require('express');
const router = express.Router();
const OccurrenceBook = require('../models/OccurrenceBook');
const SiteEntryCounter = require('../models/SiteEntryCounter');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get next entry number for a site
router.get('/next-entry/:site', auth, async (req, res) => {
  try {
    const { site } = req.params;
    
    let counter = await SiteEntryCounter.findOne({ site });
    
    if (!counter) {
      counter = new SiteEntryCounter({ site, currentEntryNumber: 0 });
      await counter.save();
    }
    
    let nextNumber = counter.currentEntryNumber + 1;
    if (nextNumber > 999) {
      nextNumber = 1;
    }
    
    res.json({ nextEntryNumber: nextNumber });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create OB entry
router.post('/', auth, async (req, res) => {
  try {
    const { date, time, entryNumber, occurrence, site, initials } = req.body;
    const securityId = req.user._id;
    
    // Convert entryNumber to number for comparison
    const numericEntryNumber = parseInt(entryNumber, 10);
    
    const user = await User.findById(securityId);
    
    // Use provided initials or generate from user name
    const entryInitials = initials || user.initials || user.name.split(' ').map(w => w[0]).join('').toUpperCase();
    if (!entryInitials) {
      return res.status(400).json({ msg: 'Could not determine initials' });
    }
    
    // Update counter
    let counter = await SiteEntryCounter.findOne({ site });
    if (!counter) {
      counter = new SiteEntryCounter({ site, currentEntryNumber: 0 });
      await counter.save();
    }
    
    if (numericEntryNumber !== counter.currentEntryNumber + 1 && counter.currentEntryNumber !== 999) {
      return res.status(400).json({ msg: 'Invalid entry number' });
    }
    
    counter.currentEntryNumber = numericEntryNumber === 999 ? 1 : numericEntryNumber;
    await counter.save();
    
    const obEntry = new OccurrenceBook({
      date: new Date(date),
      time,
      entryNumber: numericEntryNumber,
      occurrence,
      securityId,
      securityInitials: entryInitials,
      site
    });
    
    await obEntry.save();
    res.json(obEntry);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get OB entries for security guard (their own entries)
router.get('/my-entries', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const securityId = req.user._id;
    
    let query = { securityId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const entries = await OccurrenceBook.find(query)
      .populate('adminSignatures.adminId', 'name initials')
      .sort({ date: -1, time: -1 });
    
    res.json(entries);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all OB entries (for admins)
router.get('/all', auth, async (req, res) => {
  try {
    const { startDate, endDate, securityId, site } = req.query;
    
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (securityId) {
      query.securityId = securityId;
    }
    
    if (site) {
      query.site = site;
    }
    
    const entries = await OccurrenceBook.find(query)
      .populate('securityId', 'name initials')
      .populate('adminSignatures.adminId', 'name initials')
      .sort({ date: -1, time: -1 });
    
    res.json(entries);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Sign off on daily entries (for admin, security admin and IT admin)
router.post('/sign-off', auth, async (req, res) => {
  try {
    const { securityId, date, initials } = req.body;
    const adminId = req.user._id;
    
    // IT admin, security admin, and admin can sign off
    const user = await User.findById(adminId);
    if (!['admin', 'security_admin', 'it_admin'].includes(user.role)) {
      return res.status(403).json({ msg: 'Not authorized - only admin, IT admin or security admin can sign off' });
    }
    
    // Get all entries for that security guard on that date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const entries = await OccurrenceBook.find({
      securityId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    if (entries.length === 0) {
      return res.status(404).json({ msg: 'No entries found for this date' });
    }
    
    // Add signature to all entries
    const signature = {
      adminId,
      adminInitials: initials,
      signedAt: new Date()
    };
    
    for (const entry of entries) {
      // Check if this admin has already signed this entry
      const alreadySigned = entry.adminSignatures.some(
        sig => sig.adminId.toString() === adminId.toString()
      );
      
      if (!alreadySigned) {
        entry.adminSignatures.push(signature);
        await entry.save();
      }
    }
    
    res.json({ msg: 'Signed off successfully', entriesSigned: entries.length });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get security guards list (for admins)
router.get('/security-guards', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Return security guards for all admin roles
    let query = { role: 'security' };
    
    const guards = await User.find(query).select('name email initials');
    res.json(guards);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
