const { expandRoles } = require('../constants/roles');

/*
 * Role check middleware
 *
 * Uses req.user.role from the JWT (set by auth middleware).
 * Does NOT read role from request body, params, or query.
 */
module.exports = (...roles) => {
  const allowed = expandRoles(...roles);

  return (req, res, next) => {
    const role = req.user?.role;

    if (!role) {
      return res.status(401).json({ msg: 'Role not found — please log in again' });
    }

    if (!allowed.includes(role)) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    next();
  };
};
