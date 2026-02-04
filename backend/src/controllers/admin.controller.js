import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Company } from "../models/company.model.js";
import { User } from "../models/user.model.js";
import { ChatbotSetting } from "../models/chatbotSetting.model.js";
import { logActivity } from "../utils/activityLogger.js";

 const getAllCompaniesForAdmin = asyncHandler(async (req, res) => {
    const companies = await Company.find({}).sort({ createdAt: -1 }).populate('owner', 'fullName email');
    return res.status(200).json(new ApiResponse(200, companies, "All companies fetched successfully for admin."));
});

 const toggleCompanyVerification = asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    company.verified = !company.verified;
    await company.save();

    const message = `Company "${company.name}" has been ${company.verified ? 'verified' : 'unverified'}.`;
    
    await logActivity({ 
        req, 
        action: "ADMIN_VERIFY_COMPANY", 
        severity: "WARN", 
        entityType: "COMPANY", 
        entityId: company._id,
        metadata: { verified: company.verified }
    });

    return res.status(200).json(new ApiResponse(200, company, message));
});

 const getAllUsersForAdmin = asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password -refreshToken").sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, users, "All users fetched successfully for admin."));
});




const DEFAULT_SYSTEM_PROMPT = `You are "Jobiyo Helper", a friendly, enthusiastic, and helpful AI assistant for the "Jobiyo" job portal. Your name, "Jobiyo", is a Nepali phrase meaning "Work is needed".
    
Your primary role is to help users find jobs and learn about companies. You must follow these rules strictly:
1.  Base Answers on Context: Answer user questions ONLY based on the information provided in the "CONTEXT" section.
2.  Be Conversational: Do not just list data. Respond conversationally.
3.  Handle No Information: If the answer is not in the context, politely state that you cannot find that specific information. NEVER make up jobs or companies.
4.  Know Yourself: If asked "who are you" or "what is Jobiyo", use the information from this prompt to answer.
5.  Keep it Concise: Keep answers clear and to the point.`;


 const getChatbotSettings = asyncHandler(async (req, res) => {
    let settings = await ChatbotSetting.findOne({ singletonKey: "Jobiyo-main-settings" });

    if (!settings) {
        settings = await ChatbotSetting.create({ systemPrompt: DEFAULT_SYSTEM_PROMPT });
    }

    return res.status(200).json(new ApiResponse(200, settings, "Chatbot settings fetched successfully."));
});


 const updateChatbotSettings = asyncHandler(async (req, res) => {
    const { systemPrompt } = req.body;

    if (!systemPrompt) {
        throw new ApiError(400, "System prompt content is required.");
    }
    
    const settings = await ChatbotSetting.findOneAndUpdate(
        { singletonKey: "Jobiyo-main-settings" },
        { 
            systemPrompt: systemPrompt,
            updatedBy: req.user._id 
        },
        { 
            new: true, 
            upsert: true,
        }
    );

    await logActivity({ 
        req, 
        action: "ADMIN_UPDATE_SETTINGS", 
        severity: "WARN", 
        metadata: { setting: "chatbot", updatedBy: req.user._id }
    });

    return res.status(200).json(new ApiResponse(200, settings, "Chatbot settings updated successfully."));
});

export {
    getAllUsersForAdmin,
    getChatbotSettings,
   updateChatbotSettings ,
    toggleCompanyVerification,
    getAllCompaniesForAdmin
}