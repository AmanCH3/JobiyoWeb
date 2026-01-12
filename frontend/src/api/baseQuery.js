import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logOut, setCredentials } from '../redux/slices/userSlice';
import { Mutex } from 'async-mutex';

const mutex = new Mutex();
const VITE_API_BASE_URL = "/api/v1";

const baseQuery = fetchBaseQuery({
    baseUrl: VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = getState().user.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
    // wait until the mutex is available without locking it
    await mutex.waitForUnlock();
    
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // checking whether the mutex is locked
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                // Call refresh token endpoint (using standard fetch to avoid circular dependency loop with authApi)
                // Note: We use /api/v1/users/refresh-token explicitly.
                // We rely on browser sending the httpOnly refreshToken cookie.
                const refreshResult = await baseQuery(
                    { url: '/users/refresh-token', method: 'POST' },
                    api,
                    extraOptions
                );

                if (refreshResult.data) {
                    // Retry the initial query
                    // Update user store with new access token and user data if provided (backend sends { accessToken, refreshToken, user? })
                    // Based on our implementation: { accessToken, refreshToken }. user is likely derived or kept same.
                    // Actually passing the logic to userSlice to update credentials.
                     api.dispatch(setCredentials({ 
                        accessToken: refreshResult.data.data.accessToken, 
                        // If backend doesn't return full user obj on refresh, we might keep existing one or it might be in data.user if we updated backend.
                        // Backend: returns { accessToken, refreshToken: newRefreshToken } inside ApiResponse data.
                        // Wait, backend response structure: { statusCode: 200, data: { accessToken, refreshToken }, ... }
                        // So refreshResult.data.data is the payload.
                        // We need to keep the user! setCredentials expects { user, accessToken }.
                        user: api.getState().user.user 
                    }));

                    // Store new token in retry args if needed, but prepareHeaders pulls from state so we are good.
                    result = await baseQuery(args, api, extraOptions);
                } else {
                    // Refresh failed - log out
                    api.dispatch(logOut());
                    // window.location.href = '/login'; // Optional: force redirect
                }
            } finally {
                // release must be called once the mutex should be released again.
                release();
            }
        } else {
            // wait until the mutex is available without locking it
            await mutex.waitForUnlock();
            result = await baseQuery(args, api, extraOptions);
        }
    }
    return result;
};
