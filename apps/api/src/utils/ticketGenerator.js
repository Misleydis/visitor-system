const Visitor = require('../models/Visitor');

async function generateTicketNumber() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find the highest ticket number used today
  const lastVisitor = await Visitor.findOne({
    visitDate: { $gte: today, $lt: tomorrow }
  }).sort({ ticketNumber: -1 });

  let nextNumber = 1;
  if (lastVisitor) {
    const match = lastVisitor.ticketNumber.match(/V(\d+)/);
    if (match) nextNumber = parseInt(match[1]) + 1;
  }

  // Safety loop to skip any existing numbers (rare, but handles concurrency)
  let ticketNumber = `V${String(nextNumber).padStart(3, '0')}`;
  let exists = await Visitor.findOne({ ticketNumber });
  while (exists) {
    nextNumber++;
    ticketNumber = `V${String(nextNumber).padStart(3, '0')}`;
    exists = await Visitor.findOne({ ticketNumber });
  }

  return ticketNumber;
}

module.exports = generateTicketNumber;