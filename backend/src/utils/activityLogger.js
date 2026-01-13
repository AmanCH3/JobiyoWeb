import { ActivityLog } from "../models/activityLog.model.js";

/**
 * Sanitizes metadata by removing sensitive keys.
 * @param {Object} data - The metadata object to sanitize.
 * @returns {Object} - The sanitized metadata.
 */
const sanitizeMetadata = (data) => {
  if (!data) return {};
  const sensitiveKeys = [
    "password",
    "token",
    "authorization",
    "cookie",
    "otp",
    "card",
    "cvv",
    "secret",
    "apiKey",
    "creditCard",
  ];

  // Deep copy to avoid mutating original object
  const sanitized = JSON.parse(JSON.stringify(data));

  const mask = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        mask(obj[key]);
      } else if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        obj[key] = "***SANITIZED***";
      }
    }
  };

  mask(sanitized);
  return sanitized;
};

/**
 * Logs a user activity.
 * @param {Object} params - The log parameters.
 * @param {Object} params.req - The Express request object.
 * @param {string} params.action - The action type (e.g., 'AUTH_LOGIN').
 * @param {string} params.entityType - (Optional) The type of entity affected.
 * @param {string} params.entityId - (Optional) The ID of the entity affected.
 * @param {Object} params.metadata - (Optional) Additional context data.
 * @param {string} params.status - 'SUCCESS' or 'FAIL'.
 * @param {string} params.severity - 'INFO', 'WARN', or 'CRITICAL'.
 */
export const logActivity = async ({
  req,
  action,
  entityType,
  entityId,
  metadata = {},
  status = "SUCCESS",
  severity = "INFO",
}) => {
  try {
    const user = req.user;
    
    // Extract info from request if available
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const endpoint = req.originalUrl;
    const method = req.method;
    const requestId = req.requestId; // Assuming requestId middleware is active

    const logEntry = {
      userId: user?._id,
      userEmail: user?.email,
      role: user?.role,
      action,
      entityType,
      entityId,
      metadata: sanitizeMetadata(metadata),
      ip,
      userAgent,
      endpoint,
      method,
      status,
      severity,
      requestId,
    };

    // Fire and forget - don't await strictly if performance is key, 
    // but catching errors is good for stability.
    await ActivityLog.create(logEntry);
  } catch (error) {
    console.error("Activity Logging Failed:", error);
    // Silent fail to not disrupt main flow
  }
};
