import { Router } from "express";
import { getSystemLogs } from "../controllers/logController.js";
import { verifyJWT, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: System Logs
 *   description: System log management
 */

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Retrieve system logs
 *     tags: [System Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *       '403':
 *         description: Forbidden. Admin access required.
 */
router.route("/").get(verifyJWT, isAdmin, getSystemLogs);

export default router;
