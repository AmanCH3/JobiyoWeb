import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Chat, Message } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import sanitizeHtml from "sanitize-html";

// ============================================
// SECURITY: Content Sanitization Config
// ============================================
const CONTENT_LIMITS = {
    maxLength: 5000,        // Max message length
    minLength: 1,           // Min message length
};

// Sanitize message content to prevent XSS
const sanitizeContent = (content) => {
    if (!content || typeof content !== 'string') {
        return '';
    }
    // Remove ALL HTML tags - plain text only
    return sanitizeHtml(content, { 
        allowedTags: [],      // No HTML allowed
        allowedAttributes: {} // No attributes allowed
    }).trim();
};

// Validate MongoDB ObjectId format
const isValidObjectId = (id) => {
    return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
};

export const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) throw new ApiError(400, "UserId is required to start a chat.");
    
    // SECURITY: Validate userId format
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID format.");
    }

    // SECURITY: Prevent chatting with yourself
    if (userId === req.user._id.toString()) {
        throw new ApiError(400, "Cannot create a chat with yourself.");
    }

    let chat = await Chat.findOne({
        users: { $all: [req.user._id, userId] }
    })
    .populate("users", "-password -refreshToken")
    .populate({
        path: "latestMessage",
        populate: {
            path: "sender",
            select: "fullName profile"
        }
    });

    if (chat) {
        return res.status(200).json(new ApiResponse(200, chat, "Chat accessed successfully."));
    } else {
        // Verify target user exists before creating chat
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            throw new ApiError(404, "User not found.");
        }

        const chatData = {
            users: [req.user._id, userId],
        };
        const createdChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password -refreshToken");
        return res.status(201).json(new ApiResponse(201, fullChat, "Chat created."));
    }
});

export const fetchMyChats = asyncHandler(async (req, res) => {
    const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password -refreshToken")
        .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "fullName profile.avatar"
            }
        })
        .sort({ updatedAt: -1 });

    res.status(200).json(new ApiResponse(200, chats, "Chats fetched successfully."));
});

export const fetchMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    
    // SECURITY: Validate chatId format
    if (!isValidObjectId(chatId)) {
        throw new ApiError(400, "Invalid chat ID format.");
    }

    // SECURITY: Verify user is a participant of this chat
    const chat = await Chat.findOne({
        _id: chatId,
        users: req.user._id
    });

    if (!chat) {
        throw new ApiError(403, "You are not a member of this chat.");
    }

    const messages = await Message.find({ chat: chatId })
        .populate("sender", "fullName profile.avatar");
        
    return res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully."));
});

export const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;
    
    // SECURITY: Validate inputs
    if (!content || !chatId) {
        throw new ApiError(400, "Content and chatId are required.");
    }

    if (!isValidObjectId(chatId)) {
        throw new ApiError(400, "Invalid chat ID format.");
    }

    // SECURITY: Content length validation
    if (content.length < CONTENT_LIMITS.minLength) {
        throw new ApiError(400, "Message cannot be empty.");
    }
    
    if (content.length > CONTENT_LIMITS.maxLength) {
        throw new ApiError(400, `Message exceeds maximum length of ${CONTENT_LIMITS.maxLength} characters.`);
    }

    // SECURITY: Verify user is a participant of this chat
    const chat = await Chat.findOne({
        _id: chatId,
        users: req.user._id
    });

    if (!chat) {
        throw new ApiError(403, "You are not a member of this chat.");
    }

    // SECURITY: Sanitize content to prevent XSS
    const sanitizedContent = sanitizeContent(content);
    
    if (sanitizedContent.length < CONTENT_LIMITS.minLength) {
        throw new ApiError(400, "Message cannot be empty after sanitization.");
    }

    let newMessage = {
        sender: req.user._id,
        content: sanitizedContent,
        chat: chatId,
    };
    
    let message = await Message.create(newMessage);
    
    message = await Message.findById(message._id)
        .populate("sender", "fullName profile.avatar")
        .populate({
            path: "chat",
            populate: {
                path: "users",
                select: "fullName"
            }
        });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    
    const io = req.app.get("io");
    message.chat.users.forEach(user => {
        if (user._id.toString() === message.sender._id.toString()) return;
        io.to(user._id.toString()).emit("messageReceived", message);
    });

    return res.status(201).json(new ApiResponse(201, message, "Message sent successfully."));
});