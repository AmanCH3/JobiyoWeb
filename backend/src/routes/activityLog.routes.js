import { Router } from "express";
import { verifyJWT, isAdmin } from "../middleware/auth.middleware.js";
import {
  getActivityLogs,
  getActivityLogById,
  getMyActivityLogs,
} from "../controllers/activityLog.controller.js";

const router = Router();

// Apply verifyJWT to all routes
router.use(verifyJWT);

// Admin routes
router.route("/").get(isAdmin, getActivityLogs);

// User routes
router.route("/my-logs").get(getMyActivityLogs);

// Shared routes (with internal RBAC check)
router.route("/:id").get(getActivityLogById);

export default router;
