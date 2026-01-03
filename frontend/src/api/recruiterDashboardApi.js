import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const recruiterDashboardApi = createApi({
    reducerPath: 'recruiterDashboardApi',
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1", credentials: 'include' }),
    endpoints: (builder) => ({
        getStats: builder.query({
            query: () => '/recruiter-dashboard/stats',
            transformResponse: (response) => response.data,
        }),
        getRecentApplicants: builder.query({
           query: () => '/recruiter-dashboard/recent-applicants',
           transformResponse: (response) => response.data,
           providesTags: ['Application'], 
       }),
    }),
});

export const { useGetStatsQuery,useGetRecentApplicantsQuery } = recruiterDashboardApi;