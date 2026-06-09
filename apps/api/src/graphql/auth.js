const User = require('../models/User');
const { verifyAccessToken } = require('../utils/session');
const { expandRoles } = require('../constants/roles');

async function createContext({ req }) {
  const token = req.headers['x-auth-token'];
  let user = null;

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const id = decoded.id || decoded._id;
      user = { ...decoded, id, _id: id };

      if (!user.role && id) {
        const dbUser = await User.findById(id).select('role name email');
        if (dbUser) {
          user.role = dbUser.role;
          user.name = user.name || dbUser.name;
          user.email = user.email || dbUser.email;
        }
      }
    } catch {
      user = null;
    }
  }

  return { user, token, req, app: req.app };
}

function requireAuth(context) {
  if (!context.user?.role) {
    const error = new Error('No token, authorization denied');
    error.extensions = { code: 'UNAUTHENTICATED' };
    throw error;
  }
}

function requireRoles(context, ...roles) {
  requireAuth(context);
  const allowed = expandRoles(...roles);
  if (!allowed.includes(context.user.role)) {
    const error = new Error('Access denied');
    error.extensions = { code: 'FORBIDDEN' };
    throw error;
  }
}

module.exports = { createContext, requireAuth, requireRoles };
