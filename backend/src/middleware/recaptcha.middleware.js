import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import axios from "axios";

export const verifyRecaptcha = asyncHandler(async (req, res, next) => {
    const { recaptchaToken } = req.body;

    // Skip reCAPTCHA in all non-production environments to avoid blocking development
    // or if the key is explicitly missing/placeholder
    if (process.env.NODE_ENV !== 'production' || 
        !process.env.RECAPTCHA_SECRET_KEY || 
        process.env.RECAPTCHA_SECRET_KEY === 'your_recaptcha_secret') {
        console.warn("⚠️ reCAPTCHA verification skipped (Non-Production or Invalid Key)");
        return next();
    }

    if (!recaptchaToken) {
        throw new ApiError(400, "reCAPTCHA token is missing.");
    }

    try {
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
        const { data } = await axios.post(verificationUrl);

        if (!data.success) {
            console.error("reCAPTCHA verification failed with errors:", data['error-codes']);
            throw new ApiError(401, "reCAPTCHA verification failed. Please try again.");
        }
        next();

    } catch (error) {
        console.error("Error during reCAPTCHA verification:", error);
        if (error instanceof ApiError) {
            throw error; 
        }
        throw new ApiError(500, "An error occurred during reCAPTCHA verification.");
    }
});