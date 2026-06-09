const Visitor = require('../../models/Visitor');
const { getAuthContext } = require('../../utils/authContext');
const { logActivity } = require('./activityHelper');

const ALLOWED_UPDATES = [
  'firstName', 'surname', 'nationalId', 'phoneNumber', 'address',
  'vehicleReg', 'site', 'personToVisit', 'personToVisitOther', 'purpose'
];

/*
 * PUT /api/visitors/:id
 * Updates allowed visitor fields and logs the changes
 */
exports.updateVisitor = async (req, res) => {
  try {
    const auth = await getAuthContext(req);
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ msg: 'Visitor not found' });

    const changes = [];
    ALLOWED_UPDATES.forEach((field) => {
      if (req.body[field] !== undefined && visitor[field] !== req.body[field]) {
        changes.push(`${field}: "${visitor[field]}" -> "${req.body[field]}"`);
        visitor[field] = req.body[field];
      }
    });

    if (changes.length === 0) return res.status(400).json({ msg: 'No changes detected' });

    await visitor.save();

    await logActivity(
      auth.id, auth.name, auth.role,
      'EDIT_VISITOR', 'visitor', visitor._id,
      `Edited visitor ${visitor.ticketNumber}: ${changes.join(', ')}`
    );

    const io = req.app.get('io');
    if (io) io.emit('visitor_updated', { visitor });

    res.json({ visitor, msg: 'Visitor updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
