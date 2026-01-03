import { Router } from "express";
import { verifyJWT, isRecruiter } from "../middleware/auth.middleware.js";
import {
   applyForJob,
   getMyApplications,
   getJobApplicants,
   updateApplicationStatus
} from "../controllers/application.controller.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         job:
 *           type: string
 *           description: "The ID of the job applied for"
 *         applicant:
 *           type: string
 *           description: "The User ID of the applicant"
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *           example: "pending"
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ApplicationWithDetails:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         job:
 *           $ref: '#/components/schemas/Job'
 *         applicant:
 *           $ref: '#/components/schemas/User'
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 */

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Managing job applications. Some routes are for students, others for recruiters.
 */

// All routes in this file require a valid JWT
router.use(verifyJWT);

/**
 * @swagger
 * /applications/apply/{jobId}:
 *   post:
 *     summary: Apply for a specific job (Student role required)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job to apply for.
 *     responses:
 *       '201':
 *         description: Successfully applied for the job.
 *       '400':
 *         description: Bad Request. You have already applied for this job.
 *       '403':
 *         description: Forbidden. Only users with the 'student' role can apply.
 *       '404':
 *         description: Job not found.
 */
router.route("/apply/:jobId").post(applyForJob);

/**
 * @swagger
 * /applications/my-applications:
 *   get:
 *     summary: Get all applications submitted by the currently logged-in student
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: An array of the student's applications with populated job and company details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ApplicationWithDetails'
 *       '403':
 *         description: Forbidden. The current user is not a student.
 */
router.route("/my-applications").get(getMyApplications);

/**
 * @swagger
 * /applications/job/{jobId}/applicants:
 *   get:
 *     summary: Get all applicants for a specific job (Recruiter role required)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job whose applicants you want to retrieve.
 *     responses:
 *       '200':
 *         description: An array of application objects with populated applicant details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ApplicationWithDetails'
 *       '403':
 *         description: Forbidden. User is not a recruiter or does not own this job.
 */
router.route("/job/:jobId/applicants").get(isRecruiter, getJobApplicants);

/**
 * @swagger
 * /applications/{applicationId}/status:
 *   patch:
 *     summary: Update an application's status to 'accepted' or 'rejected' (Recruiter role required)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the application to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *                 example: "accepted"
 *     responses:
 *       '200':
 *         description: Application status updated successfully.
 *       '400':
 *         description: Invalid status provided.
 *       '403':
 *         description: Forbidden. User is not a recruiter or not authorized for this application.
 *       '404':
 *         description: Application not found.
 */
router.route("/:applicationId/status").patch(isRecruiter, updateApplicationStatus);

export default router;