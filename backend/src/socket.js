import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Chat } from "./models/chat.model.js";

// ============================================
// SECURITY: Rate Limiting Configuration
// ============================================
const RATE_LIMIT = {
    windowMs: 60000,        // 1 minute window
    maxEvents: 30,          // max 30 events per window
    blockDurationMs: 300000 // block for 5 mins if exceeded
};

// Store for rate limiting (in production, use Redis)
const rateLimitStore = new Map();
const blockedSockets = new Map();

// ============================================
// SECURITY: Allowed Events Whitelist
// ============================================
const ALLOWED_EVENTS = [
    'setup',
    'joinChat', 
    'leaveChat',
    'typing',
    'stopTyping',
    'callUser',
    'answerCall',
    'endCall',
    'disconnect'
];

// ============================================
// HELPER: Rate Limit Check
// ============================================
const checkRateLimit = (socketId) => {
    // Check if socket is blocked
    const blockExpiry = blockedSockets.get(socketId);
    if (blockExpiry && Date.now() < blockExpiry) {
        return { allowed: false, blocked: true };
    } else if (blockExpiry) {
        blockedSockets.delete(socketId);
    }

    const now = Date.now();
    const windowStart = now - RATE_LIMIT.windowMs;
    
    // Get or create event timestamps for this socket
    let events = rateLimitStore.get(socketId) || [];
    
    // Filter to only events in current window
    events = events.filter(timestamp => timestamp > windowStart);
    
    if (events.length >= RATE_LIMIT.maxEvents) {
        // Block the socket
        blockedSockets.set(socketId, now + RATE_LIMIT.blockDurationMs);
        rateLimitStore.delete(socketId);
        return { allowed: false, blocked: true };
    }
    
    // Add current event
    events.push(now);
    rateLimitStore.set(socketId, events);
    
    return { allowed: true, blocked: false };
};

// ============================================
// HELPER: Validate MongoDB ObjectId format
// ============================================
const isValidObjectId = (id) => {
    return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
};

// ============================================
// MAIN: Initialize Socket.IO with Security
// ============================================
const initSocketIO = (httpServer) => {
    const io = new Server(httpServer, {
        pingTimeout: 60000,
        maxHttpBufferSize: 1e6, // 1MB max message size
        cors: {
            origin: process.env.CORS_ORIGIN === "*" ? "https://localhost:5173" : process.env.CORS_ORIGIN,
            credentials: true,
        },
    });

    // ============================================
    // SECURITY: JWT Authentication Middleware
    // ============================================
    io.use(async (socket, next) => {
        try {
            // Get token from auth object or query (fallback)
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            
            if (!token) {
                console.log("Socket auth failed: No token provided");
                return next(new Error("Authentication required"));
            }

            // Verify JWT token
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            
            if (!decoded?._id) {
                return next(new Error("Invalid token payload"));
            }

            // Attach verified user info to socket
            socket.userId = decoded._id;
            socket.userRole = decoded.role;
            
            console.log(`Socket authenticated: User ${decoded._id}`);
            next();
        } catch (error) {
            console.log("Socket auth error:", error.message);
            return next(new Error("Authentication failed"));
        }
    });

    // ============================================
    // CONNECTION HANDLER
    // ============================================
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.userId} (socket: ${socket.id})`);

        // ============================================
        // SECURITY: Event Whitelist & Rate Limiting
        // ============================================
        socket.onAny((eventName, ...args) => {
            // Check rate limit
            const rateCheck = checkRateLimit(socket.id);
            if (!rateCheck.allowed) {
                console.warn(`Rate limit exceeded for socket ${socket.id}`);
                socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
                if (rateCheck.blocked) {
                    socket.disconnect(true);
                }
                return;
            }

            // Check event whitelist (excluding built-in events)
            if (!eventName.startsWith('disconnect') && !ALLOWED_EVENTS.includes(eventName)) {
                console.warn(`Blocked unauthorized event: ${eventName} from ${socket.id}`);
                socket.emit('error', { message: 'Invalid event' });
                return;
            }
        });

        // ============================================
        // SETUP: Join personal room (SECURED)
        // ============================================
        socket.on('setup', (userId) => {
            // SECURITY: Only allow joining own room
            if (userId !== socket.userId) {
                console.warn(`Security: User ${socket.userId} tried to join room of ${userId}`);
                socket.emit('error', { message: 'Unauthorized room access' });
                return;
            }
            
            socket.join(socket.userId);
            console.log(`User ${socket.userId} joined their personal room.`);
            socket.emit('connected');
        });

        // ============================================
        // JOIN CHAT: With authorization check (SECURED)
        // ============================================
        socket.on('joinChat', async (roomId) => {
            // Validate roomId format
            if (!isValidObjectId(roomId)) {
                socket.emit('error', { message: 'Invalid room ID' });
                return;
            }

            try {
                // SECURITY: Verify user is a participant of this chat
                const chat = await Chat.findOne({
                    _id: roomId,
                    users: socket.userId
                });

                if (!chat) {
                    console.warn(`Security: User ${socket.userId} denied access to chat ${roomId}`);
                    socket.emit('error', { message: 'You are not a member of this chat' });
                    return;
                }

                socket.join(roomId);
                console.log(`User ${socket.userId} joined chat room: ${roomId}`);
                socket.emit('joinedChat', { roomId });
            } catch (error) {
                console.error('Error joining chat:', error);
                socket.emit('error', { message: 'Failed to join chat' });
            }
        });

        // ============================================
        // LEAVE CHAT
        // ============================================
        socket.on('leaveChat', (roomId) => {
            if (!isValidObjectId(roomId)) return;
            socket.leave(roomId);
            console.log(`User ${socket.userId} left chat room: ${roomId}`);
        });

        // ============================================
        // TYPING INDICATORS
        // ============================================
        socket.on('typing', (roomId) => {
            if (!isValidObjectId(roomId)) return;
            socket.to(roomId).emit('typing', { userId: socket.userId });
        });

        socket.on('stopTyping', (roomId) => {
            if (!isValidObjectId(roomId)) return;
            socket.to(roomId).emit('stopTyping', { userId: socket.userId });
        });

        // ============================================
        // VIDEO CALL: Initiate call (SECURED)
        // ============================================
        socket.on('callUser', async ({ userToCall, signalData, from }) => {
            // Validate target user ID
            if (!isValidObjectId(userToCall)) {
                socket.emit('error', { message: 'Invalid user ID' });
                return;
            }

            // SECURITY: Ensure 'from' matches authenticated user
            if (from !== socket.userId) {
                console.warn(`Security: Spoofed call attempt from ${socket.userId} as ${from}`);
                socket.emit('error', { message: 'Invalid caller ID' });
                return;
            }

            // Emit to target user
            io.to(userToCall).emit('callIncoming', { 
                signal: signalData, 
                from: socket.userId // Use verified userId, not the one from client
            });
            console.log(`Call initiated: ${socket.userId} -> ${userToCall}`);
        });

        // ============================================
        // VIDEO CALL: Answer call (SECURED)
        // ============================================
        socket.on('answerCall', ({ to, signal }) => {
            // Validate target user ID
            if (!isValidObjectId(to)) {
                socket.emit('error', { message: 'Invalid user ID' });
                return;
            }

            io.to(to).emit('callAccepted', { 
                signal,
                from: socket.userId // Include who answered
            });
            console.log(`Call answered: ${socket.userId} -> ${to}`);
        });

        // ============================================
        // VIDEO CALL: End call
        // ============================================
        socket.on('endCall', ({ to }) => {
            if (!isValidObjectId(to)) return;
            io.to(to).emit('callEnded', { from: socket.userId });
            console.log(`Call ended: ${socket.userId} -> ${to}`);
        });

        // ============================================
        // DISCONNECT: Cleanup
        // ============================================
        socket.on("disconnect", () => {
            // Clean up rate limit data
            rateLimitStore.delete(socket.id);
            blockedSockets.delete(socket.id);
            console.log(`User disconnected: ${socket.userId} (socket: ${socket.id})`);
        });
    });

    return io;
};

export { initSocketIO };