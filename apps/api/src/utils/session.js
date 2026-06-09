const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');

// Token configuration
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY_DAYS = 30; // Refresh token valid for 30 days

/**
 * Generate a cryptographically secure random token
 */
const generateRandomToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Generate access token
 */
const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    type: 'access'
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });
};

/**
 * Generate refresh token and store in database
 */
const generateRefreshToken = async (userId) => {
  const token = generateRandomToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  
  // Revoke all existing refresh tokens for this user (single session per user)
  await RefreshToken.updateMany(
    { userId, revoked: false },
    { revoked: true, revokedAt: new Date() }
  );
  
  // Create new refresh token
  const refreshToken = await RefreshToken.create({
    token,
    userId,
    expiresAt
  });
  
  return refreshToken.token;
};

/**
 * Generate both access and refresh tokens
 */
const generateTokenPair = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);
  
  // Update user's last login
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
  
  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY
  };
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = async (token) => {
  const refreshToken = await RefreshToken.findOne({ token });
  
  if (!refreshToken) {
    throw new Error('Refresh token not found');
  }
  
  if (!refreshToken.isValid()) {
    throw new Error('Refresh token is invalid or expired');
  }
  
  return refreshToken;
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (refreshToken) => {
  const tokenDoc = await verifyRefreshToken(refreshToken);
  const user = await User.findById(tokenDoc.userId);
  
  if (!user || !user.isActive) {
    throw new Error('User not found or inactive');
  }
  
  // Generate new token pair
  const tokens = await generateTokenPair(user);
  
  // Mark old refresh token as replaced
  await RefreshToken.findByIdAndUpdate(tokenDoc._id, {
    revoked: true,
    revokedAt: new Date(),
    replacedByToken: tokens.refreshToken
  });
  
  return tokens;
};

/**
 * Revoke refresh token (logout)
 */
const revokeRefreshToken = async (token) => {
  const refreshToken = await RefreshToken.findOne({ token });
  
  if (refreshToken) {
    await RefreshToken.findByIdAndUpdate(refreshToken._id, {
      revoked: true,
      revokedAt: new Date()
    });
  }
  
  return true;
};

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 */
const revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany(
    { userId, revoked: false },
    { revoked: true, revokedAt: new Date() }
  );
  
  return true;
};

/**
 * Clean up expired refresh tokens (should be run periodically)
 */
const cleanupExpiredTokens = async () => {
  const result = await RefreshToken.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  
  return result.deletedCount;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanupExpiredTokens,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY_DAYS
};
