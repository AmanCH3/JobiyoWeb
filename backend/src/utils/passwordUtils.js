import bcrypt from 'bcryptjs';

// Constants
export const PASSWORD_MIN_LEN = 8;
export const PASSWORD_HISTORY_COUNT = 5;
export const PASSWORD_EXPIRE_DAYS = 90;

/**
 * Validates password against policy:
 * - Minimum length (8)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Not in common blocklist
 * - Does not contain parts of user's full name
 * @param {string} password 
 * @param {object} [user] - User object containing fullName (optional)
 * @returns {object} { isValid: boolean, message: string }
 */
export const validatePasswordPolicy = (password, user = null) => {
    const details = [];
    
    if (!password || password.length < PASSWORD_MIN_LEN) {
        details.push(`Password must be at least ${PASSWORD_MIN_LEN} characters long.`);
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) details.push("Password must contain at least one uppercase letter.");
    if (!hasLowerCase) details.push("Password must contain at least one lowercase letter.");
    if (!hasNumbers) details.push("Password must contain at least one number.");
    if (!hasSpecialChar) details.push("Password must contain at least one special character.");

    const commonPasswords = ['password', '12345678', 'qwertyuiop', 'admin123']; 
    if (commonPasswords.some(cp => password.toLowerCase().includes(cp))) {
         details.push("Password is too common or easily guessable.");
    }

    // Check if password contains parts of full name
    if (user && user.fullName) {
        const nameParts = user.fullName.split(/[\s-]+/).filter(part => part.length >= 3); 
        for (const part of nameParts) {
            if (password.toLowerCase().includes(part.toLowerCase())) {
                 details.push("Password cannot contain parts of your name.");
                 break;
            }
        }
    }

    if (details.length > 0) {
        return { isValid: false, message: "Password does not meet policy.", details };
    }

    return { isValid: true, message: "Password is valid." };
};

/**
 * Checks if the new password matches any in the history.
 * @param {object} user - User document
 * @param {string} newPassword - Plain text new password
 * @returns {Promise<boolean>} - True if reused, false otherwise
 */
export const isPasswordReused = async (user, newPassword) => {
    if (!user.passwordHistory || user.passwordHistory.length === 0) {
        return false;
    }

    // Check current password as well if needed (though usually history covers it if we push before save)
    // But typically we check history.
    for (const historyItem of user.passwordHistory) {
        const isMatch = await bcrypt.compare(newPassword, historyItem.hash);
        if (isMatch) return true;
    }

    // Also check current password if it's not in history yet (legacy data)
    if (user.password) {
        const isCurrentMatch = await bcrypt.compare(newPassword, user.password);
        if (isCurrentMatch) return true;
    }

    return false;
};

/**
 * Pushes new password hash to history and trims to limit.
 * NOTE: This mutates the user object but doesn't save it.
 * @param {object} user - User document
 * @param {string} newHash - Hashed new password
 */
export const pushPasswordHistory = (user, newHash) => {
    if (!user.passwordHistory) {
        user.passwordHistory = [];
    }

    user.passwordHistory.unshift({
        hash: newHash,
        createdAt: new Date()
    });

    if (user.passwordHistory.length > PASSWORD_HISTORY_COUNT) {
        user.passwordHistory = user.passwordHistory.slice(0, PASSWORD_HISTORY_COUNT);
    }
};

/**
 * Computes expiry date based on change date.
 * @param {Date} passwordChangedAt 
 * @returns {Date}
 */
export const computePasswordExpiry = (passwordChangedAt) => {
    const expiry = new Date(passwordChangedAt);
    expiry.setDate(expiry.getDate() + PASSWORD_EXPIRE_DAYS);
    return expiry;
};
