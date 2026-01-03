import { Router } from "express";
import { verifyJWT, isRecruiter } from "../middleware/auth.middleware.js";
import { scheduleInterview, getMyInterviews } from "../controllers/interview.controller.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Interview:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         application:
 *           type: string
 *           description: "The ID of the application this interview is for."
 *         recruiter:
 *           $ref: '#/components/schemas/User'
 *         student:
 *           $ref: '#/components/schemas/User'
 *         interviewType:
 *           type: string
 *           enum: [online, inoffice]
 *         date:
 *           type: string
 *           format: date-time
 *         time:
 *           type: string
 *           example: "14:30"
 *         locationOrLink:
 *           type: string
 *         status:
 *           type: string
 *           enum: [scheduled, completed, canceled]
 */

/**
 * @swagger
 * tags:
 *   name: Interviews
 *   description: Scheduling and viewing candidate interviews
 */

// All routes in this file are protected by JWT
router.use(verifyJWT);

/**
 * @swagger
 * /interviews/schedule:
 *   post:
 *     summary: Schedule a new interview for an application (Recruiter role required)
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [applicationId, interviewType, date, time, locationOrLink]
 *             properties:
 *               applicationId:
 *                 type: string
 *                 description: "The ID of the application to schedule an interview for."
 *               interviewType:
 *                 type: string
 *                 enum: [online, inoffice]
 *                 example: "online"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-20"
 *               time:
 *                 type: string
 *                 example: "15:00"
 *                 description: "Time in 24-hour format (HH:MM)"
 *               locationOrLink:
 *                 type: string
 *                 example: "https://meet.google.com/xyz-abc-def"
 *     responses:
 *       '201':
 *         description: Interview scheduled successfully and notification sent.
 *       '400':
 *         description: Missing required fields.
 *       '403':
 *         description: Forbidden. User is not a recruiter or not authorized for this application.
 *       '404':
 *         description: Application not found.
 */
router.route("/schedule").post(isRecruiter, scheduleInterview);

/**
 * @swagger
 * /interviews/my-interviews:
 *   get:
 *     summary: Get all interviews for the currently logged-in user (works for both students and recruiters)
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of the user's scheduled interviews.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Interview'
 *       '401':
 *         description: Unauthorized.
 */
router.route("/my-interviews").get(getMyInterviews);

export default router;