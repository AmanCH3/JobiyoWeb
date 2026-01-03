import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store.js';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from '@/components/ui/sonner.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
 <React.StrictMode>
   <Provider store={store}>
     <PersistGate loading={null} persistor={persistor}>
       <SocketProvider>
         <BrowserRouter>
           <App />
           <Toaster richColors position="top-right" />
         </BrowserRouter>
       </SocketProvider>
     </PersistGate>
   </Provider>
 </React.StrictMode>
);