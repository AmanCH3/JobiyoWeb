import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    userEmail: {
      type: String,
    },
    role: {
      type: String, // 'student', 'recruiter', 'admin'
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String, // 'JOB', 'APPLICATION', 'USER', 'PAYMENT', etc.
    },
    entityId: {
      type: String, // Can be ObjectId or string ID
    },
    metadata: {
      type:  mongoose.Schema.Types.Mixed, // Flexible JSON object
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    endpoint: {
      type: String,
    },
    method: {
      type: String,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAIL"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["INFO", "WARN", "CRITICAL"],
      default: "INFO",
    },
    requestId: {
      type: String,
    },
  },
  { timestamps: true } // adds createdAt, updatedAt
);

// Compound index for entity searches
activityLogSchema.index({ entityType: 1, entityId: 1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
