import { Server } from "socket.io";

const initSocketIO = (httpServer) => {
    const io = new Server(httpServer, {
        pingTimeout: 60000,
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on('setup', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their personal room.`);
            socket.emit('connected');
        });

        socket.on('joinChat', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined chat room: ${roomId}`);
        });

        socket.on('callUser', ({ userToCall, signalData, from }) => {
            io.to(userToCall).emit('callIncoming', { signal: signalData, from });
        });

        socket.on('answerCall', (data) => {
            io.to(data.to).emit('callAccepted', data.signal);
        });

        socket.on("disconnect", () => {
            console.log(" A user disconnected:", socket.id);
        });
    });

    return io;
};

export { initSocketIO };