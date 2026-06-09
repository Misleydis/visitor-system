const OccurrenceBook = require('../../models/OccurrenceBook');
const User = require('../../models/User');

/*
 * POST /api/occurrence-book/sign-off
 * Admin signs off on all OB entries for a guard on a given date
 */
exports.signOff = async (req, res) => {
  try {
    const { securityId, date, initials } = req.body;
    const adminId = req.user.id;

    const user = await User.findById(adminId);
    if (!['admin', 'security_admin', 'it_admin'].includes(user.role)) {
      return res.status(403).json({ msg: 'Not authorized - only admin, IT admin or security admin can sign off' });
    }

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

    const signature = { adminId, adminInitials: initials, signedAt: new Date() };

    for (const entry of entries) {
      const alreadySigned = entry.adminSignatures.some(
        (sig) => sig.adminId.toString() === adminId.toString()
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
};
