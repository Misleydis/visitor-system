const Visitor = require('../models/Visitor');

async function generateTicketNumber() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await Visitor.countDocuments({
    visitDate: { $gte: today, $lt: tomorrow }
  });

  const nextNumber = count + 1;
  return `V${String(nextNumber).padStart(3, '0')}`;
}

module.exports = generateTicketNumber;