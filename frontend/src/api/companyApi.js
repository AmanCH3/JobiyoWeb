import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VITE_API_BASE_URL = "http://localhost:8000/api/v1";

export const companyApi = createApi({
    reducerPath: 'companyApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/v1', 
        credentials: 'include',
    }),
    tagTypes: ['Company'],
    endpoints: (builder) => ({
        getMyCompanies: builder.query({
            query: () => '/companies',
            transformResponse: (response) => response.data,
            providesTags: ['Company'],
        }),
        getCompanyById: builder.query({
            query: (id) => `/companies/${id}`,
            transformResponse: (response) => response.data,
            providesTags: (result, error, id) => [{ type: 'Company', id }],
        }),
        createCompany: builder.mutation({
            query: (formData) => ({
                url: '/companies',
                method: 'POST',
                body: formData, 
            }),
            invalidatesTags: ['Company'],
        }),
        updateCompany: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/companies/${id}`,
                method: 'PATCH',
                body: formData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Company', id }, 'Company'],
        }),
        deleteCompany: builder.mutation({
            query: (id) => ({
                url: `/companies/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Company'],
        }),
        getPublicCompanies: builder.query({
            query: () => '/companies/public',
            transformResponse: (response) => response.data,
            providesTags: ['PublicCompany'],
        }),
        getCompanyDetailPublic: builder.query({
    query: (companyId) => `/companies/public/${companyId}`,
    transformResponse: (response) => response.data,
    providesTags: (result, error, id) => [{ type: 'PublicCompany', id }],
}),
    }),
});

export const { 
    useGetMyCompaniesQuery,
    useGetCompanyByIdQuery,
    useCreateCompanyMutation,
    useUpdateCompanyMutation,
    useGetPublicCompaniesQuery,
    useGetCompanyDetailPublicQuery,
    useDeleteCompanyMutation
} = companyApi;