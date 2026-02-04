import { ApiError } from "../utils/ApiError.js";

const rateStore = new Map();

/**
 * Simple in-memory rate limiter middleware.
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Max number of requests per window
 * @returnsMiddleware function
 */
export const rateLimit = (windowMs, max) => (req, res, next) => {
    const ip = req.ip; // Or req.headers['x-forwarded-for'] if behind proxy (app.set('trust proxy', 1) handles this usually)
    const now = Date.now();

    const record = rateStore.get(ip);

    if (!record) {
        rateStore.set(ip, { count: 1, startTime: now });
        return next();
    }

    if (now - record.startTime > windowMs) {
        // Window expired, reset
        rateStore.set(ip, { count: 1, startTime: now });
        return next();
    }

    // Within window
    record.count += 1;
    
    if (record.count > max) {
        throw new ApiError(429, "Too many requests, please try again later.");
    }

    return next();
};

// Clean up old entries periodically to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateStore.entries()) {
        if (now - value.startTime > 60 * 60 * 1000) { // 1 hour cleanup
            rateStore.delete(key);
        }
    }
}, 60 * 60 * 1000); // Run every hour
