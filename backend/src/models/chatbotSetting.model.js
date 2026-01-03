import mongoose from "mongoose";

const chatbotSettingSchema = new mongoose.Schema({
    singletonKey: {
        type: String,
        default: "Jobiyo-main-settings",
        unique: true,
    },
    systemPrompt: {
        type: String,
        required: true,
        trim: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

export const ChatbotSetting = mongoose.model("ChatbotSetting", chatbotSettingSchema);