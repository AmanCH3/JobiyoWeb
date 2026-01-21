/**
 * Frontend password policy validation matching backend rules.
 * Provides real-time validation feedback for users.
 */

export const PASSWORD_MIN_LENGTH = 8;

const COMMON_PASSWORDS = [
    'password', '12345678', 'qwertyuiop', 'admin123', 
    'letmein', 'welcome', 'monkey', 'dragon', 'master', 'abc123'
];

/**
 * Validates password against security policy.
 * @param {string} password - The password to validate
 * @param {object} userInfo - Optional user info { fullName, email }
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
export const validatePasswordPolicy = (password, userInfo = {}) => {
    const errors = [];
    
    if (!password) {
        return { isValid: false, errors: ['Password is required.'] };
    }

    // Length check
    if (password.length < PASSWORD_MIN_LENGTH) {
        errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`);
    }

    // Complexity checks
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter.');
    }
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number.');
    }
    if (!/[!@#$%^&*(),.?":{}`|<>]/.test(password)) {
        errors.push('Password must contain at least one special character.');
    }

    // Common password check
    if (COMMON_PASSWORDS.some(cp => password.toLowerCase().includes(cp))) {
        errors.push('Password is too common. Please choose a more unique password.');
    }

    // Email username check
    if (userInfo.email) {
        const emailUsername = userInfo.email.split('@')[0].toLowerCase();
        if (emailUsername.length >= 3 && password.toLowerCase().includes(emailUsername)) {
            errors.push('Password cannot contain your email username.');
        }
    }

    // Full name check
    if (userInfo.fullName) {
        const nameParts = userInfo.fullName.split(/[\s-]+/).filter(part => part.length >= 3);
        for (const part of nameParts) {
            if (password.toLowerCase().includes(part.toLowerCase())) {
                errors.push('Password cannot contain parts of your name.');
                break;
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Get password requirements as a list (for display).
 * @returns {object[]} - Array of { label, regex } for each requirement
 */
export const getPasswordRequirements = () => [
    { id: 'length', label: `At least ${PASSWORD_MIN_LENGTH} characters`, check: (p) => p.length >= PASSWORD_MIN_LENGTH },
    { id: 'uppercase', label: 'One uppercase letter (A-Z)', check: (p) => /[A-Z]/.test(p) },
    { id: 'lowercase', label: 'One lowercase letter (a-z)', check: (p) => /[a-z]/.test(p) },
    { id: 'number', label: 'One number (0-9)', check: (p) => /\d/.test(p) },
    { id: 'special', label: 'One special character (!@#$%^&*)', check: (p) => /[!@#$%^&*(),.?":{}`|<>]/.test(p) },
];
