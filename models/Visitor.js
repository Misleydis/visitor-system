// visitor-system/models/Visitor.js
const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true },
  firstName: { type: String, required: true },
  surname: { type: String, required: true },
  nationalId: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  vehicleReg: { type: String, default: '' },
  site: { 
    type: String, 
    required: true,
    enum: ['head office', 'phase I', 'phase II', 'phase III', 'phase IV', 'phase V', 'phase VI', 'phase VII', 'phase VIII', 'phase IX', 'phase X', 'phase XI', 'phase XII', 'the gate', '2 acres']
  },
  personToVisit: { 
    type: String,
    required: true
  },
  personToVisitOther: { type: String, default: '' }, // for "Other" option
  purpose: { type: String, required: true },
  timeIn: { type: Date, default: Date.now },
  timeOut: { type: Date },
  visitDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  cancelledAt: { type: Date }
});

visitorSchema.index({ ticketNumber: 1, visitDate: 1 }, { unique: true });

module.exports = mongoose.model('Visitor', visitorSchema);