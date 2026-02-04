import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from './baseQuery';

export const securityLogApi = createApi({
    reducerPath: "securityLogApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["SecurityLogs"],
    endpoints: (builder) => ({
        getMySecurityLogs: builder.query({
            query: ({ page = 1, limit = 10, eventType = "", from = "", to = "" }) => {
                let queryString = `security-logs/me?page=${page}&limit=${limit}`;
                if (eventType && eventType !== "ALL") queryString += `&eventType=${eventType}`;
                if (from) queryString += `&from=${from}`;
                if (to) queryString += `&to=${to}`;
                return queryString;
            },
            providesTags: ["SecurityLogs"],
        }),
        getSecurityLogs: builder.query({ 
            query: (params = {}) => {
                 let queryString = `security-logs?`;
                 if (params.userId) queryString += `userId=${params.userId}&`;
                 if (params.email) queryString += `email=${params.email}&`;
                 if (params.page) queryString += `page=${params.page}&`;
                 if (params.limit) queryString += `limit=${params.limit}&`;
                 if (params.eventType && params.eventType !== 'ALL') queryString += `eventType=${params.eventType}&`;
                 
                 return queryString;
            },
             providesTags: ["SecurityLogs"],
        }),
        flagSuspiciousActivity: builder.mutation({
            query: (id) => ({
                url: `security-logs/${id}/flag`,
                method: "POST",
            }),
            invalidatesTags: ["SecurityLogs"],
        }),
    }),
});

export const { useGetMySecurityLogsQuery, useFlagSuspiciousActivityMutation, useGetSecurityLogsQuery } = securityLogApi;
