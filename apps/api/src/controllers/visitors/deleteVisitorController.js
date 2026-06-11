const Visitor = require('../../models/Visitor');
const { getAuthContext } = require('../../utils/authContext');
const { logActivity } = require('./activityHelper');

/*
 * DELETE /api/visitors/:id
 * Permanently removes a visitor record
 */
exports.deleteVisitor = async (req, res) => {
  try {
    const auth = await getAuthContext(req);
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ msg: 'Visitor not found' });

    await logActivity(
      auth.id, auth.name, auth.role,
      'DELETE_VISITOR', 'visitor', visitor._id,
      `Deleted visitor ${visitor.ticketNumber} (${visitor.firstName} ${visitor.surname})`
    );

    await Visitor.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) io.emit('visitor_deleted', { id: req.params.id });

    res.json({ msg: 'Visitor deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

/*
 * DELETE /api/visitors/clear-all
 * Permanently removes all visitor records
 */
exports.clearAllVisitors = async (req, res) => {
  try {
    const auth = await getAuthContext(req);
    
    const result = await Visitor.deleteMany({});
    
    await logActivity(
      auth.id, auth.name, auth.role,
      'CLEAR_ALL_VISITORS', 'visitor', null,
      `Cleared all visitors (${result.deletedCount} records deleted)`
    );

    const io = req.app.get('io');
    if (io) io.emit('visitors_cleared', { count: result.deletedCount });

    res.json({ msg: `Cleared ${result.deletedCount} visitor records` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
