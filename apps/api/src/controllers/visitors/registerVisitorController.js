const Visitor = require('../../models/Visitor');
const generateTicketNumber = require('../../utils/ticketGenerator');
const sendSMS = require('../../utils/sms');
const { getAuthContext } = require('../../utils/authContext');
const { logActivity } = require('./activityHelper');

/*
 * POST /api/visitors
 * Visitor data: request BODY
 * Requesting user role: JWT header (x-auth-token)
 */
exports.registerVisitor = async (req, res) => {
  try {
    const auth = await getAuthContext(req);
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

    await logActivity(
      auth.id, auth.name, auth.role,
      'REGISTER_VISITOR', 'visitor', visitor._id,
      `Registered ${firstName} ${surname} (${ticketNumber})`
    );

    sendSMS(phoneNumber, ticketNumber, firstName);

    const io = req.app.get('io');
    if (io) io.emit('visitor_registered', { visitor });

    res.json({ visitor, msg: 'Visitor registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
