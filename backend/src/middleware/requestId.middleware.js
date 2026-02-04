
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to assign a unique Request ID to each incoming request.
 * This ID is used for log tracing and audit trails.
 */
export const requestId = (req, res, next) => {
    // Check if client sent a request ID (useful for distributed tracing), otherwise generate one
    const id = req.headers['x-request-id'] || uuidv4();
    
    // Attach to request object
    req.requestId = id;
    
    // Set response header
    res.setHeader('X-Request-Id', id);
    
    next();
};
