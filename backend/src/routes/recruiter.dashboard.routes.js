import { Router } from "express";
import { verifyJWT, isRecruiter } from "../middleware/auth.middleware.js";
import { getRecruiterStats, getRecentApplicants } from "../controllers/recruiter.dashboard.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Recruiter Dashboard
 *   description: Endpoints for recruiter analytics and activity summaries (Recruiter role required)
 */

// All routes in this file are protected and require a recruiter role
router.use(verifyJWT, isRecruiter);

/**
 * @swagger
 * /recruiter-dashboard/stats:
 *   get:
 *     summary: Get key statistics for the logged-in recruiter
 *     description: Retrieves the total number of companies owned, jobs posted, and applicants received by the authenticated recruiter.
 *     tags: [Recruiter Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Recruiter statistics fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCompanies:
 *                       type: integer
 *                       example: 2
 *                     totalJobs:
 *                       type: integer
 *                       example: 5
 *                     totalApplicants:
 *                       type: integer
 *                       example: 48
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Access denied. User is not a recruiter.
 */
router.route("/stats").get(getRecruiterStats);

/**
 * @swagger
 * /recruiter-dashboard/recent-applicants:
 *   get:
 *     summary: Get the 5 most recent applicants for the recruiter's jobs
 *     description: Provides a list of the latest 5 applications across all jobs posted by the authenticated recruiter, sorted by creation date.
 *     tags: [Recruiter Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of the 5 most recent applications.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Access denied. User is not a recruiter.
 */
router.route("/recent-applicants").get(getRecentApplicants); 

export default router;