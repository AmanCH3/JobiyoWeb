import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatbotSetting } from "../models/chatbotSetting.model.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateKnowledgeBase = async () => {
    const jobs = await Job.find({}).limit(50).sort({ createdAt: -1 }).populate('company', 'name location');
    const companies = await Company.find({ verified: true }).limit(50).select('name description location');

    let context = "CURRENT JOB LISTINGS:\n";
    if (jobs.length > 0) {
        jobs.forEach(job => {
            context += `- Title: "${job.title}", Company: "${job.company.name}", Location: "${job.location}", Type: ${job.jobType}.\n`;
        });
    } else {
        context += "- No jobs are currently listed.\n";
    }

    context += "\nVERIFIED COMPANIES:\n";
    if (companies.length > 0) {
        companies.forEach(company => {
            context += `- Name: "${company.name}", Location: "${company.location}".\n`;
        });
    } else {
        context += "- No companies are currently verified.\n";
    }
    
    return context;
};

const DEFAULT_SYSTEM_PROMPT = `You are "Jobiyo Helper", a friendly and helpful AI assistant for the "Jobiyo" job portal. Your name, "Jobiyo", is a Nepali phrase meaning "Work is needed".
Your primary role is to help users find jobs and learn about companies. You must follow these rules strictly:
1.  **Base Answers on Context:** Answer user questions ONLY based on the information provided in the "CONTEXT" section.
2.  **Be Conversational:** Do not just list data. Respond conversationally.
3.  **Handle No Information:** If the answer is not in the context, politely state that you cannot find that specific information on the platform right now. NEVER make up jobs or companies.
4.  **Know Yourself:** If asked "who are you" or "what is Jobiyo", use the information from this prompt to answer.`;


export const handleChatQuery = asyncHandler(async (req, res) => {
    const { query, history = [] } = req.body;

    if (!query) {
        throw new ApiError(400, "Query is required.");
    }
    
    try {
        console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const settings = await ChatbotSetting.findOne({ singletonKey: "Jobiyo-main-settings" });
        const adminDefinedPrompt = settings ? settings.systemPrompt : DEFAULT_SYSTEM_PROMPT;

        const knowledgeBase = await generateKnowledgeBase();
        
        const finalSystemPrompt = `${adminDefinedPrompt}
        
        You will use the following real-time data as your context to answer questions about jobs and companies.
        --- START OF CONTEXT ---
        ${knowledgeBase}
        --- END OF CONTEXT ---
        `;

        // --- STEP 4: Format chat history safely ---
        const formattedHistory = history.map(item => {
            if (!item || typeof item.role !== 'string' || typeof item.text !== 'string') {
                return null;
            }
            return {
                role: item.role,
                parts: [{ text: item.text }],
            };
        }).filter(Boolean);

        const chat = model.startChat({
          history: [
              { role: "user", parts: [{ text: finalSystemPrompt }] },
              { role: "model", parts: [{ text: "Namaste! I am Jobiyo Helper. How can I assist you today?" }] },
              ...formattedHistory,
          ],
          generationConfig: {
            maxOutputTokens: 250,
          },
        });

        const result = await chat.sendMessage(query);
        const response = result.response;
        const text = response.text();

        return res.status(200).json(new ApiResponse(200, { response: text }, "Chatbot responded successfully."));
    } catch (error) {
        console.error("Chatbot Error Details:", error.message);
        console.error("Full Error:", error);
        
        // Handle quota exceeded error gracefully
        if (error.status === 429) {
            return res.status(200).json(new ApiResponse(200, { 
                response: "I'm currently experiencing high demand. Please try again in a few moments. If this persists, the daily usage limit may have been reached." 
            }, "Chatbot rate limited."));
        }
        
        // Handle other API errors gracefully
        if (error.status === 404) {
            return res.status(200).json(new ApiResponse(200, { 
                response: "I'm having trouble connecting right now. Please try again later." 
            }, "Chatbot service unavailable."));
        }
        
        throw new ApiError(500, `Chatbot error: ${error.message}`);
    }
});