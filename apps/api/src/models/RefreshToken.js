const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  revoked: { type: Boolean, default: false },
  revokedAt: { type: Date },
  replacedByToken: { type: String }
}, { 
  timestamps: true 
});

// Index for cleanup of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if token is expired
refreshTokenSchema.methods.isExpired = function() {
  return Date.now() >= this.expiresAt.getTime();
};

// Method to check if token is revoked
refreshTokenSchema.methods.isRevoked = function() {
  return this.revoked === true;
};

// Method to check if token is valid
refreshTokenSchema.methods.isValid = function() {
  return !this.isExpired() && !this.isRevoked();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
