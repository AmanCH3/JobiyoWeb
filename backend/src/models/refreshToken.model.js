import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true, 
      // This will store the hashed version of the refresh token
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revoked: {
      type: Date, // If set, token is invalid. Timestamp of revocation.
      default: null
    },
    replacedByToken: {
      type: String, // audit trail: which token replaced this one?
      default: null
    }, 
    // familyId could be used to group a chain of rotated tokens
    // but simply tracking replacedByToken forms a linked list which allows traversal if needed.
  },
  { timestamps: true }
);

// Auto-delete expired tokens (TTL index)
// Expires documents after 'expiresAt' time passes. 
// Note: MongoDB runs this cleanup every 60s.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
