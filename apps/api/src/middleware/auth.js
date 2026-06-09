const User = require('../models/User');
const { verifyAccessToken } = require('../utils/session');

/*
 * Auth middleware
 *
 * Role source: JWT access token in the x-auth-token header (not body/params).
 * The token payload includes: id, email, name, role, type.
 *
 * If an older token is missing role, the user record is loaded from the DB.
 */
module.exports = async (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = verifyAccessToken(token);
    const id = decoded.id || decoded._id;

    req.user = {
      ...decoded,
      id,
      _id: id
    };

    if (!req.user.role && id) {
      const user = await User.findById(id).select('role name email');
      if (!user) {
        return res.status(401).json({ msg: 'User not found' });
      }
      req.user.role = user.role;
      req.user.name = req.user.name || user.name;
      req.user.email = req.user.email || user.email;
    }

    if (!req.user.role) {
      return res.status(401).json({ msg: 'Role not found — please log in again' });
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
