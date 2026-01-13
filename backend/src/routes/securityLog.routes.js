import { Router } from "express";
import { verifyJWT, isAdmin } from "../middleware/auth.middleware.js";
import { getMySecurityLogs, getSecurityLogs, flagSuspiciousActivity } from "../controllers/securityLog.controller.js";
import { exportLogs } from "../controllers/logExport.controller.js";

const router = Router();

router.use(verifyJWT); // Secure all routes

router.route("/me").get(getMySecurityLogs);
router.route("/export").get(isAdmin, exportLogs); // Admin only, download CSV
router.route("/:id/flag").post(flagSuspiciousActivity);

router.route("/")
    .get(isAdmin, getSecurityLogs); // Admin only

export default router;
