import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VITE_API_BASE_URL = "/api/v1";

export const jobApi = createApi({
   reducerPath: 'jobApi',
   baseQuery: fetchBaseQuery({
       baseUrl: VITE_API_BASE_URL,
       credentials: 'include',
   }),
   tagTypes: ['Job', 'PublicJob'],
   endpoints: (builder) => ({
       getMyPostedJobs: builder.query({
           query: () => '/jobs',
           transformResponse: (response) => response.data,
           providesTags: ['Job'],
       }),
       getJobById: builder.query({
           query: (id) => `/jobs/${id}`,
           transformResponse: (response) => response.data,
           providesTags: (result, error, id) => [{ type: 'Job', id }],
       }),
       postJob: builder.mutation({
           query: (jobData) => ({
               url: '/jobs',
               method: 'POST',
               body: jobData,
           }),
           invalidatesTags: ['Job'],
       }),
       updateJob: builder.mutation({
           query: ({ id, jobData }) => ({
               url: `/jobs/${id}`,
               method: 'PATCH',
               body: jobData,
           }),
           invalidatesTags: (result, error, { id }) => [{ type: 'Job', id }, 'Job'],
       }),
       deleteJob: builder.mutation({
           query: (id) => ({
               url: `/jobs/${id}`,
               method: 'DELETE',
           }),
           invalidatesTags: ['Job'],
       }),
       getPublicJobs: builder.query({
           query: (filters) => {
               const params = new URLSearchParams(filters);
               return `/jobs/public?${params.toString()}`;
           },
           transformResponse: (response) => response.data,
           providesTags: ['PublicJob'],
       }),
       getPublicJobById: builder.query({
           query: (id) => `/jobs/public/${id}`,
           transformResponse: (response) => response.data,
           providesTags: (result, error, id) => [{ type: 'Job', id }],
       }),
       getJobRecommendations: builder.query({
           query: () => '/users/recommendations',
           transformResponse: (response) => response.data,
       }),
   }),
});

export const {
   useGetMyPostedJobsQuery,
   useGetJobByIdQuery,
   usePostJobMutation,
   useUpdateJobMutation,
   useDeleteJobMutation,
   useGetPublicJobsQuery,     
   useGetPublicJobByIdQuery,
   useGetJobRecommendationsQuery,
} = jobApi;