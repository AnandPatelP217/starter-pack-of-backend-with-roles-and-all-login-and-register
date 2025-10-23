/**
 * ---------------------------
 * VALIDATION MIDDLEWARE
 * ---------------------------
 * Validates request body against Joi schema
 */

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown fields from the body
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

// Legacy middleware - kept for backward compatibility
export const requireFields = (fields) => (req, res, next) => {
  const body = req.body || {};
  const missing = fields.filter(
    (f) => !(f in body) || body[f] === undefined || body[f] === null || (typeof body[f] === 'string' && body[f].trim() === '')
  );
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
  }
  next();
};