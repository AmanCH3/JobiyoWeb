import xss from 'xss';

const sanitizeObject = (data) => {
    if (typeof data === 'string') {
        return xss(data);
    }
    if (Array.isArray(data)) {
        return data.map(item => sanitizeObject(item));
    }
    if (data !== null && typeof data === 'object') {
        const cleaned = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                cleaned[key] = sanitizeObject(data[key]);
            }
        }
        return cleaned;
    }
    return data;
};

export const cleanInput = (req, res, next) => {
    try {
        if (req.body) req.body = sanitizeObject(req.body);
        if (req.query) req.query = sanitizeObject(req.query);
        if (req.params) req.params = sanitizeObject(req.params);
        next();
    } catch (error) {
        console.error("XSS Sanitization Error:", error);
        next(); // Proceed even if sanitization fails to avoid crashing everything, or next(error) if strict.
        // For now, let's proceed but log it.
    }
};
