const mongoose = require('mongoose');

const occurrenceBookSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  entryNumber: { type: Number, required: true },
  occurrence: { type: String, required: true },
  securityId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  securityInitials: { type: String, required: true },
  site: {
    type: String,
    required: true,
    enum: ['head office', 'phase I', 'phase II', 'phase III', 'phase IV', 'phase V', 'phase VI', 'phase VII', 'phase VIII', 'phase IX', 'phase X', 'phase XI', 'phase XII', 'the gate', '2 acres']
  },
  adminSignatures: [{
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminInitials: { type: String, required: true },
    signedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Index for faster queries
occurrenceBookSchema.index({ site: 1, entryNumber: 1 });
occurrenceBookSchema.index({ securityId: 1, date: 1 });
occurrenceBookSchema.index({ date: 1 });

module.exports = mongoose.model('OccurrenceBook', occurrenceBookSchema);
