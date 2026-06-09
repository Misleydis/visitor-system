const {
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  verifyAccessToken
} = require('../../utils/session');

/*
 * POST /api/auth/refresh
 * Issues a new access token using a valid refresh token
 */
exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const tokens = await refreshAccessToken(refreshToken);
    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn
    });
  } catch (err) {
    res.status(401).json({ msg: err.message || 'Invalid or expired refresh token' });
  }
};

/*
 * POST /api/auth/logout
 * Revokes the provided refresh token
 */
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (refreshToken) await revokeRefreshToken(refreshToken);
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

/*
 * POST /api/auth/logout-all
 * Revokes all refresh tokens for the authenticated user
 */
exports.logoutAll = async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    const decoded = verifyAccessToken(token);
    await revokeAllUserTokens(decoded.id);

    res.json({ msg: 'Logged out from all devices successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
