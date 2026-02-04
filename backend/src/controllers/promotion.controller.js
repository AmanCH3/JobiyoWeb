import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Job } from "../models/job.model.js";
import { JobPromotion } from "../models/jobPromotion.model.js";
import { PaymentLedger } from "../models/paymentLedger.model.js";
import { PROMOTION_PLANS } from "../constants.js";
import Stripe from "stripe";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = asyncHandler(async (req, res) => {
    const { jobId, planId } = req.body;
    console.log("=== CREATE CHECKOUT SESSION DEBUG ===");
    console.log("Request Body:", req.body);
    console.log("User ID:", req.user?._id);
    console.log("User Role:", req.user?.role);
    console.log("JobId:", jobId);
    console.log("PlanId:", planId);


    if (!jobId && !planId) {
        throw new ApiError(400, "Both Job ID and Plan ID are required");
    }
    if (!jobId) {
        throw new ApiError(400, "Job ID is required");
    }
    if (!planId) {
        throw new ApiError(400, "Plan ID is required");
    }

    const plan = PROMOTION_PLANS[planId];
    if (!plan) {
        throw new ApiError(400, "Invalid Plan ID");
    }

    // 1. Ownership Check
    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job not found");
    }
    if (job.postedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only promote your own jobs");
    }

    // 2. Create Pending Promotion Record
    // Check if there is already a PENDING one to reuse? Better to just create new.
    const promotion = await JobPromotion.create({
        job: jobId,
        recruiter: req.user._id,
        planType: plan.type,
        planDurationDays: plan.durationDays,
        status: "PENDING",
        amountCents: plan.amountCents,
        currency: plan.currency,
        
        // Snapshot benefits
        boostScore: plan.boostScore,
        pinEnabled: plan.pinEnabled,
        homepageBoost: plan.homepageBoost,
        emailBoost: plan.emailBoost,
    });

    // Determine base URL for redirects (handle CORS_ORIGIN="*" or missing scheme)
    const clientOrigin = req.headers.origin || process.env.CORS_ORIGIN;
    const baseUrl = (clientOrigin && clientOrigin !== "*" && clientOrigin.startsWith("http")) 
        ? clientOrigin 
        : "https://localhost:5173";

    // 3. Create Stripe Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: plan.currency,
                    product_data: {
                        name: `Job Promotion: ${planId}`,
                        description: `${plan.type} for ${plan.durationDays} days.`,
                    },
                    unit_amount: plan.amountCents,
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${baseUrl}/dashboard/recruiter/jobs?payment_success=true&jobId=${jobId}`,
        cancel_url: `${baseUrl}/dashboard/recruiter/jobs?payment_cancelled=true`,
        metadata: {
            promotionId: promotion._id.toString(),
            jobId: jobId,
            recruiterId: req.user._id.toString(),
            planId: planId,
        },
    });

    // 4. Save session ID
    promotion.stripeCheckoutSessionId = session.id;
    await promotion.save();

    return res.status(200).json(new ApiResponse(200, { url: session.url }, "Checkout session created"));
});

const handleStripeWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        // req.body must be RAW buffer here (handled by express.raw in app.js)
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook Signature Verification Failed", err.message);
        throw new ApiError(400, `Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const stripeSession = event.data.object;
        const { promotionId, recruiterId, jobId } = stripeSession.metadata;

        const dbSession = await mongoose.startSession();
        dbSession.startTransaction();

        try {
            // Idempotency: Check if already processed
            const existingLedger = await PaymentLedger.findOne({ stripeCheckoutSessionId: stripeSession.id }).session(dbSession);
            if (existingLedger) {
                await dbSession.abortTransaction();
                return res.status(200).json({ received: true });
            }

            // 1. Record Payment
            await PaymentLedger.create([{
                user: recruiterId,
                stripeCheckoutSessionId: stripeSession.id,
                stripePaymentIntentId: stripeSession.payment_intent,
                status: "PAID",
                amountCents: stripeSession.amount_total,
                currency: stripeSession.currency,
                metadata: stripeSession,
            }], { session: dbSession });

            // 2. Activate Promotion
            const startAt = new Date();
            const promotion = await JobPromotion.findById(promotionId).session(dbSession);
            
            if (promotion) {
                const durationDays = promotion.planDurationDays;
                const endAt = new Date(startAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

                promotion.status = "ACTIVE";
                promotion.startAt = startAt;
                promotion.endAt = endAt;
                promotion.stripePaymentIntentId = stripeSession.payment_intent;
                await promotion.save({ session: dbSession });
            }

            await dbSession.commitTransaction();
            console.log(`[PAYMENT] atomic transaction successful for Job ${jobId}`);

        } catch (error) {
            await dbSession.abortTransaction();
            console.error("Payment Transaction Failed:", error);
            // We return 200 to Stripe to prevent retry loops if it's a logic error, 
            // but ideally we should only return 200 if we handled it gracefully.
            // If we throw, Stripe retries. 
            // For now, let's allow Stripe to retry cleanly by throwing error if appropriate or consuming it.
            // But to avoid "webhook delivery failed" spam, let's catch critical db errors and log them.
            // If it's a transient error, throwing will invoke retry.
             throw new ApiError(500, "Transaction failed");
        } finally {
            await dbSession.endSession();
        }
    }

    return res.status(200).json({ received: true });
});

const getActivePromotions = asyncHandler(async (req, res) => {
    // Recruiters see their own active promotions
    const promotions = await JobPromotion.find({ 
        recruiter: req.user._id,
        status: { $in: ["ACTIVE", "PENDING"] }
    }).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, promotions, "Promotions fetched"));
});

export { createCheckoutSession, handleStripeWebhook, getActivePromotions };
