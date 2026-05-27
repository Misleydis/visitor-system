const mongoose = require('mongoose');

const siteEntryCounterSchema = new mongoose.Schema({
  site: {
    type: String,
    required: true,
    unique: true,
    enum: ['head office', 'phase I', 'phase II', 'phase III', 'phase IV', 'phase V', 'phase VI', 'phase VII', 'phase VIII', 'phase IX', 'phase X', 'phase XI', 'phase XII', 'the gate', '2 acres']
  },
  currentEntryNumber: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('SiteEntryCounter', siteEntryCounterSchema);
