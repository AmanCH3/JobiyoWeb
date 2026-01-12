import { isPasswordReused, pushPasswordHistory, PASSWORD_HISTORY_COUNT } from '../src/utils/passwordUtils.js';
import bcrypt from 'bcryptjs';

describe('Password Reuse Prevention', () => {
    let user;

    beforeEach(() => {
        user = {
            passwordHistory: [],
            password: 'currentHashedPassword' 
        };
    });

    test('should detect reuse from history', async () => {
        const plainPassword = 'Password123!';
        const hash = await bcrypt.hash(plainPassword, 10);
        user.passwordHistory.push({ hash, createdAt: new Date() });

        const isReused = await isPasswordReused(user, plainPassword);
        expect(isReused).toBe(true);
    });

    test('should not detect reuse if not in history', async () => {
        const plainPassword = 'NewPassword123!';
        const isReused = await isPasswordReused(user, plainPassword);
        expect(isReused).toBe(false);
    });

    test('should limit history to 5 items', async () => {
        for (let i = 0; i < 10; i++) {
            const hash = await bcrypt.hash(`Pass${i}`, 10);
            pushPasswordHistory(user, hash);
        }
        expect(user.passwordHistory.length).toBe(PASSWORD_HISTORY_COUNT);
        // The most recent one (Pass9) should be at index 0 (assuming unshift)
        // Verify specifically if needed, but length check confirms limit.
    });
});
