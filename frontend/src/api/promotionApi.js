import { baseQueryWithReauth } from './baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';

export const promotionApi = createApi({
    reducerPath: 'promotionApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Promotion', 'Job'], // Invalidate Job to refresh badges
    endpoints: (builder) => ({
        createCheckoutSession: builder.mutation({
            query: (data) => ({
                url: '/promotions/checkout-session',
                method: 'POST',
                body: data, // { jobId, planId }
            }),
        }),
        getActivePromotions: builder.query({
            query: () => '/promotions/active',
            transformResponse: (response) => response.data,
            providesTags: ['Promotion'],
        }),
    }),
});

export const { useCreateCheckoutSessionMutation, useGetActivePromotionsQuery } = promotionApi;
