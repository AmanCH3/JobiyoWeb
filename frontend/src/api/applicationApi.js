import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const applicationApi = createApi({
   reducerPath: 'applicationApi',
   baseQuery: baseQueryWithReauth,
   tagTypes: ['Application', 'Applicant', 'Job', 'PublicCompany'],
   endpoints: (builder) => ({
       applyForJob: builder.mutation({
           query: (jobId) => ({
               url: `/applications/apply/${jobId}`,
               method: 'POST',
           }),
           invalidatesTags: ['Job'],
       }),
       getMyApplications: builder.query({
           query: () => '/applications/my-applications',
           transformResponse: (response) => response.data,
           providesTags: ['Application'],
       }),
       getJobApplicants: builder.query({
           query: (jobId) => `/applications/job/${jobId}/applicants`,
           transformResponse: (response) => response.data,
           providesTags: ['Applicant'],
       }),
       updateApplicationStatus: builder.mutation({
           query: ({ applicationId, status }) => ({
               url: `/applications/${applicationId}/status`,
               method: 'PATCH',
               body: { status },
           }),
           invalidatesTags: ['Applicant'],
       }),
   }),
});

export const {
   useApplyForJobMutation,
   useGetMyApplicationsQuery,
   useGetJobApplicantsQuery,
   useUpdateApplicationStatusMutation,
} = applicationApi;