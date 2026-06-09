/* @deprecated — use ../validators/schemas and ../middleware/validate instead */
const schemas = require('../validators/schemas');
const validate = require('../middleware/validate');

module.exports = { ...schemas, validate };
