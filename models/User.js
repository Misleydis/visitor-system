const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  initials: { type: String, default: '' },
  role: {
    type: String,
    enum: ['security', 'reception', 'admin', 'super_admin', 'it_admin', 'security_admin', 'pending'],
    default: 'pending'
  },
  status: { type: String, enum: ['pending', 'active'], default: 'pending' },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model('User', userSchema);