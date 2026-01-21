import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const authApi = createApi({
   reducerPath: 'authApi',
   baseQuery: baseQueryWithReauth,
   tagTypes: ['User'],
   endpoints: (builder) => ({
       register: builder.mutation({
           query: (credentials) => ({
               url: '/users/register',
               method: 'POST',
               body: credentials,
           }),
       }),
       login: builder.mutation({
           query: (credentials) => ({
               url: '/users/login',
               method: 'POST',
               body: credentials,
           }),
       }),
       updateProfile: builder.mutation({
           query: (formData) => ({
               url: '/users/update-profile',
               method: 'PATCH',
               body: formData,
           }),
           invalidatesTags: ['User'],
       }),
       getUserPublicProfile: builder.query({
           query: (userId) => `/users/profile/${userId}`,
           transformResponse: (response) => response.data,
           providesTags: (result, error, id) => [{ type: 'User', id }],
       }),
       forgotPassword: builder.mutation({
           query: (data) => ({
               url: '/users/forgot-password',
               method: 'POST',
               body: data,
           }),
       }),
       verifyOtp: builder.mutation({
           query: (data) => ({
               url: '/users/verify-otp',
               method: 'POST',
               body: data,
           }),
       }),
       resetPassword: builder.mutation({
           query: (data) => ({
               url: '/users/reset-password',
               method: 'POST',
               body: data,
           }),
       }),
       googleAuth: builder.mutation({
           query: (data) => ({
               url: '/users/auth/google',
               method: 'POST',
               body: data,
           }),
       }),
       changePassword: builder.mutation({
           query: (data) => ({
               url: '/users/change-password',
               method: 'POST',
               body: data,
           }),
       }),
       logout: builder.mutation({
           query: () => ({
               url: '/users/logout',
               method: 'POST',
           }),
       }),
       refreshToken: builder.mutation({
           query: () => ({
               url: '/users/refresh-token',
               method: 'POST',
           }),
       }),
       verifyLoginOtp: builder.mutation({
           query: (data) => ({
               url: '/users/verify-login-otp',
               method: 'POST',
               body: data,
           }),
       }),
       toggle2FA: builder.mutation({
           query: () => ({
               url: '/users/toggle-2fa',
               method: 'POST',
           }),
       }),
       verifyEmail: builder.mutation({
           query: (data) => ({
               url: '/users/verify-email',
               method: 'POST',
               body: data,
           }),
       }),
   }),
});

export const { 
    useRegisterMutation,
    useLoginMutation, 
    useUpdateProfileMutation,
    useGetUserPublicProfileQuery,
    useForgotPasswordMutation,
    useVerifyOtpMutation,
    useResetPasswordMutation,
    useGoogleAuthMutation,
    useChangePasswordMutation,
    useLogoutMutation,
    useRefreshTokenMutation,
    useVerifyLoginOtpMutation,
    useToggle2FAMutation,
    useVerifyEmailMutation
} = authApi;