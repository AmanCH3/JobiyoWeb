import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/userSlice';
import io from 'socket.io-client';
import { toast } from 'sonner';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const user = useSelector(selectCurrentUser);

    useEffect(() => {
        if (user) {
            const newSocket = io("http://localhost:8000", {
                withCredentials: true,
            });

            newSocket.on('connect', () => {
                newSocket.emit('setup', user._id);
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
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};