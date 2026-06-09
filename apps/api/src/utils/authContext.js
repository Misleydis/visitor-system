const User = require('../models/User');

/*
 * Resolves the authenticated user's id from req.user (JWT payload).
 * JWT stores the id field; some legacy code may use _id.
 */
const getUserId = (req) => req.user?.id || req.user?._id;

/*
 * Resolves role for the current request.
 * Priority: JWT payload (x-auth-token) -> optional DB lookup if missing.
 */
const getUserRole = async (req) => {
  if (req.user?.role) return req.user.role;

  const userId = getUserId(req);
  if (!userId) return null;

  const user = await User.findById(userId).select('role');
  if (user?.role) {
    req.user.role = user.role;
  }
  return user?.role || null;
};

/*
 * Returns a normalized auth context object for controllers.
 * role/name come from the JWT; DB is queried only when role is absent.
 */
const getAuthContext = async (req) => {
  const id = getUserId(req);
  let role = req.user?.role;

  if (!role && id) {
    const user = await User.findById(id).select('role name email');
    if (user) {
      role = user.role;
      req.user.role = user.role;
      req.user.name = req.user.name || user.name;
      req.user.email = req.user.email || user.email;
    }
  }

  return {
    id,
    _id: id,
    role,
    name: req.user?.name,
    email: req.user?.email
  };
};

module.exports = { getUserId, getUserRole, getAuthContext };
