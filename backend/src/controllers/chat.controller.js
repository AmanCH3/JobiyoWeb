import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Chat, Message } from "../models/chat.model.js";
import { User } from "../models/user.model.js";

export const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) throw new ApiError(400, "UserId is required to start a chat.");

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
    const messages = await Message.find({ chat: chatId })
        .populate("sender", "fullName profile.avatar");
        
    return res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully."));
});

export const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
        throw new ApiError(400, "Content and chatId are required.");
    }

    let newMessage = {
        sender: req.user._id,
        content: content,
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