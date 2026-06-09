const Visitor = require('../../models/Visitor');
const { getAuthContext } = require('../../utils/authContext');
const { logActivity } = require('./activityHelper');

/*
 * PUT /api/visitors/:id/timeout
 * Records a visitor check-out time
 */
exports.timeoutVisitor = async (req, res) => {
  try {
    const auth = await getAuthContext(req);
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ msg: 'Visitor not found' });

    visitor.timeOut = new Date();
    visitor.status = 'completed';
    await visitor.save();

    await logActivity(
      auth.id, auth.name, auth.role,
      'TIMEOUT_VISITOR', 'visitor', visitor._id,
      `Timed out ${visitor.firstName} ${visitor.surname} (${visitor.ticketNumber})`
    );

    const io = req.app.get('io');
    if (io) io.emit('visitor_checked_out', { visitorId: req.params.id, visitor });

    res.json({ visitor, msg: 'Time-out recorded' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

/*
 * PUT /api/visitors/:id/cancel
 * Marks a visitor visit as cancelled
 */
exports.cancelVisitor = async (req, res) => {
  try {
    const auth = await getAuthContext(req);
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ msg: 'Visitor not found' });

    visitor.status = 'cancelled';
    visitor.cancelledAt = new Date();
    await visitor.save();

    await logActivity(
      auth.id, auth.name, auth.role,
      'CANCEL_VISITOR', 'visitor', visitor._id,
      `Cancelled visitor ${visitor.firstName} ${visitor.surname} (${visitor.ticketNumber})`
    );

    res.json({ msg: 'Visitor cancelled' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
