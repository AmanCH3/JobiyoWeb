import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectCurrentToken } from '@/redux/slices/userSlice';
import io from 'socket.io-client';
import { toast } from 'sonner';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const user = useSelector(selectCurrentUser);
    const token = useSelector(selectCurrentToken);

    useEffect(() => {
        // Only connect if we have both user and token
        if (user && token) {
            // Use relative path to leverage Vite proxy (avoids CORS/SSL port issues)
            const newSocket = io({
                withCredentials: true,
                path: '/socket.io',
                // SECURITY: Pass JWT token for socket authentication
                auth: {
                    token: token
                }
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                newSocket.emit('setup', user._id);
            });

            newSocket.on('connected', () => {
                console.log('Socket setup complete for user:', user._id);
            });

            // Handle authentication errors
            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error.message);
                if (error.message === 'Authentication required' || error.message === 'Authentication failed') {
                    toast.error('Chat connection failed. Please log in again.');
                }
            });

            newSocket.on('error', (error) => {
                console.warn('Socket error:', error.message);
            });

            newSocket.on('newApplication', (data) => {
                toast.info(data.message);
            });
            newSocket.on('applicationStatusUpdate', (data) => {
                toast.success(data.message);
            });
            
            setSocket(newSocket);

            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user, token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};