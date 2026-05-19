const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  surname: { type: String, required: true },
  nationalId: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  department: { type: String, required: true },
  personToVisit: { type: String, required: true },
  purpose: { type: String, required: true },
  timeIn: { type: Date, default: Date.now },
  timeOut: { type: Date },
  visitDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed'], default: 'active' }
});

module.exports = mongoose.model('Visitor', visitorSchema);