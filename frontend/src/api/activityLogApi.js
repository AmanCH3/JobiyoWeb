import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const activityLogApi = createApi({
  reducerPath: 'activityLogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1',
    prepareHeaders: (headers) => {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('accessToken='))
        ?.split('=')[1];
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['ActivityLog'],
  endpoints: (builder) => ({
    getActivityLogs: builder.query({
      query: (params) => ({
        url: '/activity-logs',
        params,
      }),
      providesTags: ['ActivityLog'],
    }),
    getMyActivityLogs: builder.query({
      query: (params) => ({
        url: '/activity-logs/my-logs',
        params,
      }),
      providesTags: ['ActivityLog'],
    }),
    getActivityLogById: builder.query({
      query: (id) => `/activity-logs/${id}`,
      providesTags: (result, error, id) => [{ type: 'ActivityLog', id }],
    }),
  }),
});

export const {
  useGetActivityLogsQuery,
  useGetMyActivityLogsQuery,
  useGetActivityLogByIdQuery,
} = activityLogApi;
