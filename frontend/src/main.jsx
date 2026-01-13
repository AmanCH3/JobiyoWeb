import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store.js';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastProvider } from './context/ToastContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
 <React.StrictMode>
   <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
     <Provider store={store}>
       <PersistGate loading={null} persistor={persistor}>
         <SocketProvider>
           <ToastProvider>
             <BrowserRouter>
               <App />
             </BrowserRouter>
           </ToastProvider>
         </SocketProvider>
       </PersistGate>
     </Provider>
   </GoogleOAuthProvider>
 </React.StrictMode>
);