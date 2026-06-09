const Visitor = require('../../models/Visitor');

/*
 * GET /api/visitors/ticket/:ticketNumber
 * Looks up a visitor by their ticket number
 */
exports.getByTicket = async (req, res) => {
  try {
    const visitor = await Visitor.findOne({ ticketNumber: req.params.ticketNumber });
    if (!visitor) return res.status(404).json({ msg: 'Visitor not found' });
    res.json(visitor);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

/*
 * GET /api/visitors/today
 * Returns all visitors registered today
 */
exports.getTodayVisitors = async (req, res) => {
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
};

/*
 * GET /api/visitors
 * Returns all visitor records (admin / security)
 */
exports.getAllVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ visitDate: -1 });
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

/*
 * GET /api/visitors/returning
 * Returns visitors whose national ID appears more than once
 */
exports.getReturningVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.aggregate([
      { $group: { _id: '$nationalId', count: { $sum: 1 }, visits: { $push: '$$ROOT' } } },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
