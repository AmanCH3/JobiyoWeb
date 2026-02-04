import { Router } from "express";
import { verifyJWT, isRecruiter } from "../middleware/auth.middleware.js";
import { createCheckoutSession, handleStripeWebhook, getActivePromotions } from "../controllers/promotion.controller.js";

const router = Router();

import express from "express";

// Webhook is PUBLIC (Stripe calls it), but verification happens inside controller via signature
// The route path in app.js is /api/v1/promotions/webhook which maps to this file's /webhook
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// Secured Routes
router.use(verifyJWT);
router.use(isRecruiter);

router.post("/checkout-session", createCheckoutSession);
router.get("/active", getActivePromotions);

export default router;
