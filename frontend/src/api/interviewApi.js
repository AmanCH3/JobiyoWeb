import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

const VITE_API_BASE_URL = "/api/v1";

export const interviewApi = createApi({
    reducerPath: 'interviewApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Interview'],
    endpoints: (builder) => ({
        scheduleInterview: builder.mutation({
            query: (interviewData) => ({
                url: '/interviews/schedule',
                method: 'POST',
                body: interviewData,
            }),
            invalidatesTags: ['Interview'],
        }),
        getMyInterviews: builder.query({
            query: () => '/interviews/my-interviews',
            transformResponse: (response) => response.data,
            providesTags: ['Interview'],
        }),
    }),
});

export const {
    useScheduleInterviewMutation,
    useGetMyInterviewsQuery,
} = interviewApi;