import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

const VITE_API_BASE_URL = "/api/v1";

export const chatApi = createApi({
    reducerPath: 'chatApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Chat', 'Message'],
    endpoints: (builder) => ({
        accessChat: builder.mutation({
            query: (userId) => ({
                url: '/chats',
                method: 'POST',
                body: { userId },
            }),
            transformResponse: (response) => response.data,
            invalidatesTags: ['Chat'],
        }),
        fetchMyChats: builder.query({
            query: () => '/chats',
            transformResponse: (response) => response.data,
            providesTags: ['Chat'],
        }),
        fetchMessages: builder.query({
            query: (chatId) => `/chats/messages/${chatId}`,
            transformResponse: (response) => response.data,
            providesTags: (result, error, arg) => [{ type: 'Message', id: arg }],
        }),
        sendMessage: builder.mutation({
            query: ({ content, chatId }) => ({
                url: '/chats/messages',
                method: 'POST',
                body: { content, chatId },
            }),
        }),
    }),
});

export const {
    useAccessChatMutation,
    useFetchMyChatsQuery,
    useFetchMessagesQuery,
    useSendMessageMutation,
} = chatApi;