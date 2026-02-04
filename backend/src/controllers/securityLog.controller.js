import { ActivityLog } from "../models/activityLog.model.js";
import { RefreshToken } from "../models/refreshToken.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { logSecurityEvent } from "../utils/activityLogger.js";

// ... existing code ...

/**
 * Flag a security log as suspicious and secure the account.
 * POST /api/v1/security-logs/:id/flag
 */
export const flagSuspiciousActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const log = await ActivityLog.findOne({ _id: id, userId });

    if (!log) {
        throw new ApiError(404, "Log entry not found");
    }

    // 1. Revoke all active sessions (Refresh Tokens)
    await RefreshToken.updateMany(
        { user: userId },
        { revoked: new Date() }
    );

    // 2. Log the user action of flagging
    await logSecurityEvent({
        req,
        action: "ACCOUNT_FLAGGED",
        severity: "CRITICAL",
        metadata: {
            flaggedLogId: id,
            reason: "User reported suspicious activity via Security Logs",
            originalEvent: log.action,
            originalIp: log.ip
        }
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                {}, 
                "Account secured. All other sessions have been logged out."
            )
        );
});


/**
 * Get security logs for the authenticated user.
 * GET /api/v1/security-logs/me
 */
export const getMySecurityLogs = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10, eventType, from, to } = req.query;

    const query = {
        userId,
        category: "SECURITY"
    };

    if (eventType) {
        query.action = eventType;
    }

    if (from || to) {
        query.timestamp = {};
        if (from) query.timestamp.$gte = new Date(from);
        if (to) query.timestamp.$lte = new Date(to);
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { timestamp: -1 } // Newest first
    };

    // Use aggregate paginate or simple find/skip depending on setup. 
    // Assuming simple find for now or if mongoose-paginate is vetted.
    // Let's implement standard pagination manually to be safe.
    
    const totalDocs = await ActivityLog.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limit);
    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Sanitized response for user (hide internal metadata if any)
    const sanitizedLogs = logs.map(log => ({
        _id: log._id,
        timestamp: log.timestamp,
        action: log.action,
        status: log.status,
        ip: log.ip, // Mask last octet? Maybe later.
        device: log.device,
        userAgent: log.userAgent, // Full UA might be technical, but okay
        metadata: log.metadata // Already sanitized by logger
    }));

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                { 
                    logs: sanitizedLogs, 
                    pagination: {
                        total: totalDocs,
                        page: parseInt(page),
                        totalPages,
                        limit: parseInt(limit)
                    }
                }, 
                "Security logs retrieved successfully"
            )
        );
});

/**
 * Get security logs for any user (Admin only).
 * GET /api/v1/security-logs
 */
export const getSecurityLogs = asyncHandler(async (req, res) => {
    const { userId, email, page = 1, limit = 20, eventType } = req.query;

    const query = {
        category: "SECURITY"
    };

    if (userId) query.userId = userId;
    if (email) query.userEmail = { $regex: email, $options: 'i' };
    if (eventType) query.action = eventType;

    const skip = (page - 1) * limit;
    const totalDocs = await ActivityLog.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limit);

    const logs = await ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("userId", "fullName email"); // Populate user details

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                { logs, total: totalDocs, totalPages }, 
                "All security logs retrieved successfully"
            )
        );
});
