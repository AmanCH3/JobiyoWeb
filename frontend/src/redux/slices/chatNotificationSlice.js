import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notifications: [],
};

const chatNotificationSlice = createSlice({
    name: 'chatNotifications',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            const existingIndex = state.notifications.findIndex(
                (notif) => notif.chat._id === action.payload.chat._id
            );
            if (existingIndex !== -1) {
                state.notifications[existingIndex] = action.payload;
            } else {
                state.notifications.unshift(action.payload);
            }
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
});

export const { addNotification, clearNotifications } = chatNotificationSlice.actions;

export const selectNotifications = (state) => state.chatNotifications.notifications;

export default chatNotificationSlice.reducer;