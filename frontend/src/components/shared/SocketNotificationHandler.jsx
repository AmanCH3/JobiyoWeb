import { useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '@/redux/slices/chatNotificationSlice';
import { selectCurrentUser } from '@/redux/slices/userSlice';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const SocketNotificationHandler = () => {
    const socket = useSocket();
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);
    const location = useLocation();

    useEffect(() => {
        if (!socket || !currentUser) return;

        const messageHandler = (newMessage) => {
            if (location.pathname === '/chat') return;

            if (newMessage.sender?._id !== currentUser._id) {
                dispatch(addNotification(newMessage));
                toast.info(`New message from ${newMessage.sender.fullName}`, {
                    description: newMessage.content,
                    duration: 5000,
                });
            }
        };

        socket.on('messageReceived', messageHandler);

        return () => {
            socket.off('messageReceived', messageHandler);
        };
    }, [socket, currentUser, dispatch, location.pathname]);

    return null;
};

export default SocketNotificationHandler;