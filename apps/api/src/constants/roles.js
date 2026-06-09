/*
 * Role groups used by roleCheck middleware.
 * Passing 'admin' also allows security_admin, it_admin, and super_admin.
 */
const ROLE_EXPANSION = {
  admin: ['admin', 'security_admin', 'it_admin', 'super_admin']
};

const expandRoles = (...roles) => {
  const expanded = new Set();
  for (const role of roles) {
    if (ROLE_EXPANSION[role]) {
      ROLE_EXPANSION[role].forEach((r) => expanded.add(r));
    } else {
      expanded.add(role);
    }
  }
  return [...expanded];
};

const ALL_ROLES = [
  'security', 'reception', 'admin', 'super_admin', 'it_admin', 'security_admin', 'pending'
];

const CREATABLE_ROLES = ['admin', 'security', 'reception', 'security_admin'];
const APPROVABLE_ROLES = ['security', 'reception', 'admin', 'super_admin', 'it_admin', 'security_admin'];

module.exports = { ROLE_EXPANSION, expandRoles, ALL_ROLES, CREATABLE_ROLES, APPROVABLE_ROLES };
