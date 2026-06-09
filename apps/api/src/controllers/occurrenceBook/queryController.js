const OccurrenceBook = require('../../models/OccurrenceBook');
const User = require('../../models/User');

/*
 * GET /api/occurrence-book/my-entries
 * Returns OB entries for the authenticated security guard
 */
exports.getMyEntries = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const securityId = req.user.id;

    let query = { securityId };

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const entries = await OccurrenceBook.find(query)
      .populate('adminSignatures.adminId', 'name initials')
      .sort({ date: -1, time: -1 });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

/*
 * GET /api/occurrence-book/all
 * Returns all OB entries with optional filters (admin)
 */
exports.getAllEntries = async (req, res) => {
  try {
    const { startDate, endDate, securityId, site } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (securityId) query.securityId = securityId;
    if (site) query.site = site;

    const entries = await OccurrenceBook.find(query)
      .populate('securityId', 'name initials')
      .populate('adminSignatures.adminId', 'name initials')
      .sort({ date: -1, time: -1 });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

/*
 * GET /api/occurrence-book/security-guards
 * Returns the list of security guard users
 */
exports.getSecurityGuards = async (req, res) => {
  try {
    const guards = await User.find({ role: 'security' }).select('name email initials');
    res.json(guards);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
