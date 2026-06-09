const { z } = require('zod');
const { CREATABLE_ROLES, APPROVABLE_ROLES } = require('../constants/roles');

/*
 * Validation schemas (request body unless noted)
 *
 * role in BODY:  POST /users, PUT /users/approve/:id
 * role from JWT: all other protected routes (x-auth-token header)
 */

/* Auth schemas */
const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1).optional()
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(6).max(100)
});

/* User management schemas — role required in request body */
const createUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(CREATABLE_ROLES, { required_error: 'role is required', invalid_type_error: 'role is required' }),
  initials: z.string().max(10).optional()
});

const approveUserSchema = z.object({
  role: z.enum(APPROVABLE_ROLES, { required_error: 'role is required', invalid_type_error: 'role is required' }),
  initials: z.string().max(10).optional()
});

/* Visitor schemas */
const visitorSiteEnum = z.enum([
  'head office', 'phase I', 'phase II', 'phase III', 'phase IV', 'phase V',
  'phase VI', 'phase VII', 'phase VIII', 'phase IX', 'phase X', 'phase XI',
  'phase XII', 'the gate', '2 acres'
]);

const registerVisitorSchema = z.object({
  firstName: z.string().min(1).max(100),
  surname: z.string().min(1).max(100),
  nationalId: z.string().min(1).max(50),
  phoneNumber: z.string().min(10).max(15),
  address: z.string().min(1).max(200),
  vehicleReg: z.string().max(20).optional(),
  site: visitorSiteEnum,
  personToVisit: z.string().min(1).max(100),
  personToVisitOther: z.string().max(100).optional(),
  purpose: z.string().min(1).max(200)
});

const updateVisitorSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  surname: z.string().min(1).max(100).optional(),
  nationalId: z.string().min(1).max(50).optional(),
  phoneNumber: z.string().min(10).max(15).optional(),
  address: z.string().min(1).max(200).optional(),
  vehicleReg: z.string().max(20).optional(),
  site: visitorSiteEnum.optional(),
  personToVisit: z.string().min(1).max(100).optional(),
  personToVisitOther: z.string().max(100).optional(),
  purpose: z.string().min(1).max(200).optional()
});

/* Occurrence book schemas */
const createObEntrySchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  entryNumber: z.union([z.string(), z.number()]),
  occurrence: z.string().min(1).max(1000),
  site: z.string().min(1).max(100),
  initials: z.string().max(10).optional()
});

const signOffSchema = z.object({
  securityId: z.string().min(1),
  date: z.string().min(1),
  initials: z.string().min(1).max(10)
});

const obDateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  securityId: z.string().optional(),
  site: z.string().optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createUserSchema,
  approveUserSchema,
  registerVisitorSchema,
  updateVisitorSchema,
  createObEntrySchema,
  signOffSchema,
  obDateRangeSchema
};
