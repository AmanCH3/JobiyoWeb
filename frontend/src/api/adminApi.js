import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VITE_API_BASE_URL = "/api/v1";

export const adminApi = createApi({
   reducerPath: 'adminApi',
   baseQuery: fetchBaseQuery({
       baseUrl: VITE_API_BASE_URL,
       credentials: 'include'
   }),
   tagTypes: ['AdminCompany', 'AdminUser', 'PublicCompany', 'ChatbotSettings'],
   endpoints: (builder) => ({
       getCompaniesForAdmin: builder.query({
           query: () => '/admin/companies',
           transformResponse: (response) => response.data,
           providesTags: ['AdminCompany'],
       }),
      
       getAllUsersForAdmin: builder.query({
           query: () => '/admin/users',
           transformResponse: (response) => response.data,
           providesTags: ['AdminUser'],
       }),

       toggleCompanyVerification: builder.mutation({
           query: (companyId) => ({
               url: `/admin/companies/${companyId}/toggle-verification`,
               method: 'PATCH',
           }),
           invalidatesTags: ['AdminCompany', 'PublicCompany'],
       }),

       getChatbotSettings: builder.query({
           query: () => '/admin/chatbot-settings',
           transformResponse: (response) => response.data,
           providesTags: ['ChatbotSettings'],
       }),

       updateChatbotSettings: builder.mutation({
           query: ({ systemPrompt }) => ({
               url: '/admin/chatbot-settings',
               method: 'PUT',
               body: { systemPrompt },
           }),
           invalidatesTags: ['ChatbotSettings'],
       }),
   }),
});

export const {
   useGetCompaniesForAdminQuery,
   useGetAllUsersForAdminQuery,
   useGetChatbotSettingsQuery,
   useUpdateChatbotSettingsMutation,
   useToggleCompanyVerificationMutation,
} = adminApi;