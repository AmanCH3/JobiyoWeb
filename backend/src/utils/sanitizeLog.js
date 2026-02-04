
/**
 * Utility to sanitize log payloads by masking sensitive data and truncating long strings.
 * This ensures compliance with Data Minimization policies.
 */

const SENSITIVE_KEYS = [
    'password',
    'passwordConfirm',
    'password_confirmation',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'cookie',
    'otp',
    'secret',
    'apiKey',
    'creditCard',
    'cardNumber',
    'cvc',
    'cvv'
];

const MAX_STRING_LENGTH = 2048; // 2KB

export const sanitizePayload = (data) => {
    if (!data) return data;

    if (typeof data === 'string') {
        if (data.length > MAX_STRING_LENGTH) {
            return data.substring(0, MAX_STRING_LENGTH) + '...[TRUNCATED]';
        }
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => sanitizePayload(item));
    }

    if (typeof data === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            // Check if key is sensitive (case-insensitive partial match for safety)
            const lowerKey = key.toLowerCase();
            const isSensitive = SENSITIVE_KEYS.some(k => lowerKey.includes(k.toLowerCase()));

            if (isSensitive) {
                sanitized[key] = '***MASKED***';
            } else {
                sanitized[key] = sanitizePayload(value);
            }
        }
        return sanitized;
    }

    return data;
};
