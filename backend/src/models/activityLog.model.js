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
    category: {
      type: String,
      enum: ["SECURITY", "ACTIVITY", "SYSTEM"],
      default: "ACTIVITY",
      index: true,
    },
    device: {
      type: String,
    },
    // Audit Integrity
    hash: { type: String },
    prevHash: { type: String },
  },
  { timestamps: true } // adds createdAt, updatedAt
);

// Compound index for entity searches
activityLogSchema.index({ entityType: 1, entityId: 1 });

// Audit Integrity: Hash Chaining
activityLogSchema.pre('save', async function(next) {
    if (!this.isModified('hash')) {
        if (this.isNew) {
            try {
                // Find the last log entry to get its hash
                const lastLog = await this.constructor.findOne({}, { hash: 1 }).sort({ _id: -1 });
                this.prevHash = lastLog ? lastLog.hash : 'GENESIS_HASH';

                // Create a content string to hash (including stable fields)
                // We exclude dynamic fields that might change post-creation (though logs should be immutable)
                const contentToHash = `${this.prevHash}|${this.userId}|${this.action}|${this.timestamp}|${JSON.stringify(this.metadata)}`;
                
                const { createHash } = await import('crypto');
                this.hash = createHash('sha256').update(contentToHash).digest('hex');
            } catch (error) {
                console.error("Error generating log hash:", error);
            }
        }
    }
    next();
});

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
