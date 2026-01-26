import { z } from 'zod';

/**
 * Recursive function to detect dangerous keys.
 * Returns true if dangerous key found.
 */
const hasDangerousKeys = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  
  for (const key in obj) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return true;
    }
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (hasDangerousKeys(obj[key])) return true;
    }
  }
  return false;
};

/**
 * Middleware factory to validate request against Zod schema.
 * 
 * @param {z.ZodSchema} schema - The Zod schema to validate against (object with body, query, params)
 */
const validateRequest = (schema) => async (req, res, next) => {
  try {
    // 1. Pre-validation security check for prototype poisoning keys
    // Zod .strict() usually catches this, but this is a defense-in-depth 
    // for cases where schemas might use .passthrough() or z.record().
    if (hasDangerousKeys(req.body) || hasDangerousKeys(req.query) || hasDangerousKeys(req.params)) {
        return res.status(400).json({ 
            error: "Bad Request", 
            message: "Malicious payload detected." 
        });
    }

    // 2. Parse and Validate
    // schema.parse usually expects { body, query, params }
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // 3. Sanitize / Replace
    // Replace req.body/query/params with the parsed (sanitized) result.
    // This strips unknown keys if schema uses .strict() (or default behavior depending on usage)
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation Error",
        details: e.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
        }))
      });
    }
    next(e);
  }
};

export default validateRequest;
