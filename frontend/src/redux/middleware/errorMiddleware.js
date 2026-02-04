import { isRejectedWithValue } from '@reduxjs/toolkit';
import { toast } from 'sonner';
import { setPasswordExpired } from '../slices/userSlice';

/**
 * Log a warning and show a toast!
 */
export const rtkQueryErrorLogger = (api) => (next) => (action) => {
  // RTK Query uses `isRejectedWithValue` to check for internal rejections
  if (isRejectedWithValue(action)) {
    console.warn('We got a rejected action!', action.error);

    if (action.payload?.status === 403 && action.payload?.data?.code === 'PASSWORD_EXPIRED') {
        // Avoid infinite loop if we are already on the change password page
        if (window.location.pathname === '/change-password') {
            return next(action);
        }

        toast.error('Session expired. Please change your password.');
        
        // Dispatch action to update state
        api.dispatch(setPasswordExpired(true));

        // Redirect to change password
        window.location.href = '/change-password';
    }
  }

  return next(action);
};
