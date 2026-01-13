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
 * @param {string} params.category - 'SECURITY', 'ACTIVITY', 'SYSTEM'.
 * @param {string} params.userId - Explicit User ID override (e.g. for failed logins).
 */
export const logActivity = async ({
  req,
  action,
  entityType,
  entityId,
  metadata = {},
  status = "SUCCESS",
  severity = "INFO",
  category = "ACTIVITY",
  userId = null,
}) => {
  try {
    const user = req.user;
    
    // Extract info from request if available
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const endpoint = req.originalUrl;
    const method = req.method;
    const requestId = req.requestId; // Assuming requestId middleware is active

    // Simple device parsing from User-Agent
    let device = "Unknown";
    if (userAgent) {
      if (userAgent.includes("Mobile")) device = "Mobile";
      else if (userAgent.includes("Tablet")) device = "Tablet";
      else device = "Desktop";
      
      if (userAgent.includes("Windows")) device += " (Windows)";
      else if (userAgent.includes("Mac")) device += " (Mac)";
      else if (userAgent.includes("Linux")) device += " (Linux)";
      else if (userAgent.includes("Android")) device += " (Android)";
      else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) device += " (iOS)";
    }

    const logEntry = {
      userId: userId || user?._id,
      userEmail: user?.email, // Note: For failed logins, this might need manual passing if we want it, but usually userId=null is enough or pass via metadata
      role: user?.role,
      action,
      entityType,
      entityId,
      metadata: sanitizeMetadata(metadata),
      ip,
      userAgent,
      device,
      endpoint,
      method,
      status,
      severity,
      requestId,
      category,
    };

    // Fire and forget
    await ActivityLog.create(logEntry);
  } catch (error) {
    console.error("Activity Logging Failed:", error);
  }
};

export const logSecurityEvent = async (params) => {
  return logActivity({ ...params, category: "SECURITY" });
};
