import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VITE_API_BASE_URL = "/api/v1";

export const authApi = createApi({
   reducerPath: 'authApi',
   baseQuery: fetchBaseQuery({
       baseUrl: VITE_API_BASE_URL,
   }),
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
    useChangePasswordMutation
} = authApi;