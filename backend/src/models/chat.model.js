import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content: { type: String, trim: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
    chatName: { type: String, trim: true, default: "One-on-one Chat" },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

export const Chat = mongoose.model("Chat", chatSchema);
export const Message = mongoose.model("Message", messageSchema);