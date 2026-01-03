import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const chatbotApi = createApi({
    reducerPath: 'chatbotApi',
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1", credentials: 'include' }),
    endpoints: (builder) => ({
        sendChatQuery: builder.mutation({
            query: ({ query, history }) => ({
                url: '/chatbot/query',
                method: 'POST',
                body: { query, history },
            }),
            transformResponse: (response) => response.data,
        }),
    }),
});

export const { useSendChatQueryMutation } = chatbotApi;