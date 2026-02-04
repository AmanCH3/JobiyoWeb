import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const recruiterDashboardApi = createApi({
    reducerPath: 'recruiterDashboardApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Application'],
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