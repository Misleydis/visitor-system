const { z } = require('zod');

/**
 * Validation schemas using Zod
 */

// Auth schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be less than 100 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().length(6, 'Code must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be less than 100 characters')
});

// Visitor schemas
const visitorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone must be less than 15 digits'),
  purpose: z.string().min(2, 'Purpose must be at least 2 characters').max(200, 'Purpose must be less than 200 characters'),
  hostName: z.string().min(2, 'Host name must be at least 2 characters').max(100, 'Host name must be less than 100 characters'),
  company: z.string().optional(),
  checkInTime: z.date().optional(),
  checkOutTime: z.date().optional(),
  status: z.enum(['checked-in', 'checked-out', 'cancelled']).optional()
});

const visitorUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  purpose: z.string().min(2).max(200).optional(),
  hostName: z.string().min(2).max(100).optional(),
  company: z.string().optional(),
  status: z.enum(['checked-in', 'checked-out', 'cancelled']).optional()
});

// User schemas (admin)
const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be less than 100 characters'),
  role: z.enum(['security', 'reception', 'admin'])
});

const approveUserSchema = z.object({
  role: z.enum(['security', 'reception', 'admin'])
});

/**
 * Validation middleware factory
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          msg: 'Validation Error',
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  visitorSchema,
  visitorUpdateSchema,
  createUserSchema,
  approveUserSchema,
  validate
};
