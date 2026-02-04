import mongoose, { Schema } from "mongoose";

const loginAttemptSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            index: true,
            unique: true
        },
        attempts: {
            type: Number,
            required: true,
            default: 0,
        },
        blockExpires: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Optional: Add TTL index to automatically delete records after some time (e.g., 20 minutes after last update)
// This prevents the collection from growing indefinitely.
loginAttemptSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 1200 }); // 20 minutes

export const LoginAttempt = mongoose.model("LoginAttempt", loginAttemptSchema);
