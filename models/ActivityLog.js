const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  action: { type: String, required: true }, // e.g., 'REGISTER_VISITOR', 'EDIT_VISITOR', 'DELETE_VISITOR', 'TIMEOUT_VISITOR', 'CANCEL_VISITOR'
  targetType: { type: String, required: true }, // 'visitor', 'user', etc.
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);