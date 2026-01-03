import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import userReducer from "./slices/userSlice";
import { authApi } from '../api/authApi';
import { companyApi } from '../api/companyApi';
import { jobApi } from '../api/jobApi';
import { applicationApi } from "@/api/applicationApi";
import { recruiterDashboardApi } from "@/api/recruiterDashboardApi";
import { adminApi } from "@/api/adminApi";
import { chatApi } from "@/api/chatApi";
import { interviewApi } from "@/api/interviewApi";
import { chatbotApi } from "@/api/chatbotApi";
import chatNotificationReducer from './slices/chatNotificationSlice';
const persistConfig = {
 key: 'root',
 version: 1,
 storage,
 whitelist: ['user'],
};

const rootReducer = combineReducers({
   user: userReducer,
   chatNotifications:chatNotificationReducer,
   [authApi.reducerPath]: authApi.reducer,
   [companyApi.reducerPath]: companyApi.reducer,
   [jobApi.reducerPath]: jobApi.reducer,
   [applicationApi.reducerPath]: applicationApi.reducer,
   [recruiterDashboardApi.reducerPath]: recruiterDashboardApi.reducer,
   [adminApi.reducerPath]: adminApi.reducer,
   [chatApi.reducerPath]: chatApi.reducer,
   [interviewApi.reducerPath]: interviewApi.reducer,
   [chatbotApi.reducerPath]: chatbotApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
 reducer: persistedReducer,
 middleware: (getDefaultMiddleware) =>
   getDefaultMiddleware({
     serializableCheck: {
       ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
     },
   }).concat(
       authApi.middleware,
       companyApi.middleware,
       jobApi.middleware,
       applicationApi.middleware,
       recruiterDashboardApi.middleware,
       adminApi.middleware,
       chatApi.middleware,
       interviewApi.middleware,
       chatbotApi.middleware,
   ),
});

export const persistor = persistStore(store);