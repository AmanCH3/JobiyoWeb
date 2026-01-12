import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const chatbotApi = createApi({
    reducerPath: 'chatbotApi',
    baseQuery: baseQueryWithReauth,
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