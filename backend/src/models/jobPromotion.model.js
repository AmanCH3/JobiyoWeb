import mongoose from "mongoose";

const jobPromotionSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planType: {
      type: String,
      enum: ["FEATURED", "PROMOTED"],
      required: true,
    },
    planDurationDays: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "EXPIRED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    // Benefits Snapshot for Plan Drift Prevention
    boostScore: { type: Number, default: 0 },
    pinEnabled: { type: Boolean, default: false },
    homepageBoost: { type: Boolean, default: false },
    emailBoost: { type: Boolean, default: false },

    startAt: { type: Date },
    endAt: { type: Date, index: true },

    stripeCheckoutSessionId: { type: String },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
      unique: true,
    },
    amountCents: { type: Number },
    currency: { type: String, default: "usd" },
  },
  { timestamps: true }
);

// Compound index for efficient search queries filtering by active promotions
jobPromotionSchema.index({ job: 1, status: 1, endAt: 1 });

export const JobPromotion = mongoose.model("JobPromotion", jobPromotionSchema);
