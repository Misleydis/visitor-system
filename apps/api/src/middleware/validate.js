const { z } = require('zod');

/*
 * Data validator middleware factory
 * Validates req.body, req.query, or req.params against a Zod schema
 *
 * Usage: validate(schema)           -> validates req.body (default)
 *        validate(schema, 'query')  -> validates req.query
 *        validate(schema, 'params') -> validates req.params
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          msg: 'Validation Error',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};

module.exports = validate;
