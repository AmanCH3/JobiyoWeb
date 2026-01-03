import { describe, it, expect } from 'vitest';
import userReducer, { setCredentials, logOut } from '@/redux/slices/userSlice';

describe('userSlice', () => {
    const initialState = { user: null, token: null };

    it('should return the initial state when passed an empty action', () => {
        expect(userReducer(undefined, { type: '' })).toEqual(initialState);
    });

    it('should handle setCredentials by adding user and token to state', () => {
        const payload = { user: { id: 1, name: 'Nikesh' }, accessToken: 'fake-token' };
        const nextState = userReducer(initialState, setCredentials(payload));
        expect(nextState.user).toEqual(payload.user);
        expect(nextState.token).toEqual(payload.accessToken);
    });

    it('should handle logOut by clearing user and token from state', () => {
        const filledState = { user: { id: 1, name: 'Nikesh' }, token: 'fake-token' };
        const nextState = userReducer(filledState, logOut());
        expect(nextState.user).toBeNull();
        expect(nextState.token).toBeNull();
    });

    it('setCredentials should correctly replace existing credentials', () => {
        const initialState = { user: { id: 1, name: 'Old User' }, token: 'old-token' };
        const payload = { user: { id: 2, name: 'New User' }, accessToken: 'new-token' };
        const nextState = userReducer(initialState, setCredentials(payload));
        expect(nextState.user.id).toBe(2);
        expect(nextState.token).toBe('new-token');
    });

    it('setCredentials should handle a null access token', () => {
        const payload = { user: { id: 1, name: 'Nikesh' }, accessToken: null };
        const nextState = userReducer(initialState, setCredentials(payload));
        expect(nextState.user).toEqual(payload.user);
        expect(nextState.token).toBeNull();
    });
});