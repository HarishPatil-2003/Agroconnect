/**
 * Zod validation middleware for Express
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    console.warn(`⚠️ [VALIDATION FAILED] Path: ${req.originalUrl} | Method: ${req.method} | IP: ${req.ip} | Errors: ${errorDetails}`);
    return res.status(400).json({
      message: result.error.issues[0].message,
      errors: result.error.issues
    });
  }
  // Replace req.body with parsed & sanitized (e.g. normalized types) values
  req.body = result.data;
  next();
};

const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    const errorDetails = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    console.warn(`⚠️ [PARAM VALIDATION FAILED] Path: ${req.originalUrl} | Method: ${req.method} | IP: ${req.ip} | Errors: ${errorDetails}`);
    return res.status(400).json({
      message: result.error.issues[0].message,
      errors: result.error.issues
    });
  }
  req.params = result.data;
  next();
};

module.exports = {
  validate,
  validateParams
};
