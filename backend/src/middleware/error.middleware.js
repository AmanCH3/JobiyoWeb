import { ApiError } from '../utils/ApiError.js';
import { logActivity } from "../utils/activityLogger.js";
import { MulterError } from "multer";

const errorHandler = (err, req, res, next) => {
    let error = err;

    if (err instanceof MulterError) {
        // Handle Multer specific errors
        error = new ApiError(400, err.message, [], err.stack);
    } else if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    // Check for file upload related errors to strictly suppress stack trace
    const isFileUploadError = err instanceof MulterError || (
        error instanceof ApiError && (
             error.message.includes("Invalid file type") ||
             error.message.includes("Double extension") ||
             error.message.includes("This file type is not allowed") || 
             error.message.includes("Invalid filename") ||
             error.message.includes("Failed to upload")
        )
    );

    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && !isFileUploadError ? { stack: error.stack } : {}),
    };

    // Log critical or unexpected errors
    const severity = error.statusCode >= 500 ? "CRITICAL" : "WARN";
    // Avoid logging 401/403/404 as CRITICAL/WARN in activity log if not desired, 
    // but requirement said "On unhandled errors...". Usually 4xx are handled ApiErrors.
    // 500s are 'unhandled' or internal failures.
    
    if (error.statusCode >= 500 || severity === "CRITICAL") {
        logActivity({
            req,
            action: "SYSTEM_ERROR",
            status: "FAIL",
            severity: "CRITICAL",
            metadata: {
                message: error.message,
                statusCode: error.statusCode,
                stack: error.stack ? error.stack.substring(0, 1000) : undefined // Truncate stack
            }
        }); // Fire and forget
    }

    return res.status(error.statusCode).json(response);
};

export { errorHandler };