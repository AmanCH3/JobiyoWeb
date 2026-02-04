import mongoose from "mongoose";

const paymentLedgerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    provider: {
      type: String,
      default: "STRIPE",
    },
    purpose: {
      type: String,
      default: "JOB_PROMOTION",
    },
    stripeCheckoutSessionId: { type: String },
    stripePaymentIntentId: { type: String, index: true },
    status: {
      type: String,
      enum: ["PAID", "FAILED", "REFUNDED"],
      required: true,
    },
    amountCents: { type: Number, required: true },
    currency: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed }, // Store raw webhook context/metadata
  },
  { timestamps: true }
);

export const PaymentLedger = mongoose.model("PaymentLedger", paymentLedgerSchema);
