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