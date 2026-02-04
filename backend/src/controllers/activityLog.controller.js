import { ActivityLog } from "../models/activityLog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get all activity logs (Admin only)
 * Supports filtering, searching, sorting, and pagination.
 */
export const getActivityLogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    q, // search term
    userId,
    role,
    action,
    status,
    severity,
    startDate,
    endDate,
    sort = "timestamp_desc",
  } = req.query;

  const query = {};

  // Search filter (action, entityType, userEmail)
  if (q) {
    query.$or = [
      { action: { $regex: q, $options: "i" } },
      { entityType: { $regex: q, $options: "i" } },
      { userEmail: { $regex: q, $options: "i" } },
    ];
  }

  if (userId) query.userId = userId;
  if (role) query.role = role;
  if (action) query.action = action;
  if (status) query.status = status;
  if (severity) query.severity = severity;

  // Date range filter
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  // Sorting
  let sortOptions = { timestamp: -1 };
  if (sort === "timestamp_asc") sortOptions = { timestamp: 1 };

  const logs = await ActivityLog.find(query)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await ActivityLog.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, {
      logs,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    }, "Activity logs retrieved successfully")
  );
});

/**
 * Get a single activity log by ID
 * RBAC: Admin can view any. Owners can view their own.
 */
export const getActivityLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await ActivityLog.findById(id);

  if (!log) {
    throw new ApiError(404, "Activity log not found");
  }

  // RBAC Check
  const isAdmin = req.user.role === "admin";
  const isOwner = log.userId?.toString() === req.user._id.toString();

  if (!isAdmin && !isOwner) {
    throw new ApiError(403, "You do not have permission to view this log");
  }

  return res.status(200).json(
    new ApiResponse(200, log, "Activity log retrieved successfully")
  );
});

/**
 * Get current user's activity logs
 */
export const getMyActivityLogs = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        action,
        status,
        startDate,
        endDate,
        sort = "timestamp_desc",
      } = req.query;
    
      const query = { userId: req.user._id };
    
      if (action) query.action = action;
      if (status) query.status = status;
    
      // Date range filter
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }
    
      // Sorting
      let sortOptions = { timestamp: -1 };
      if (sort === "timestamp_asc") sortOptions = { timestamp: 1 };
    
      const logs = await ActivityLog.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    
      const total = await ActivityLog.countDocuments(query);
    
      return res.status(200).json(
        new ApiResponse(200, {
          logs,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        }, "Your activity logs retrieved successfully")
      );
});
