import { Router } from "express";
import { verifyJWT, isRecruiter } from "../middleware/auth.middleware.js";
import {
   postJob,
   getMyPostedJobs,
   updateJob,
   deleteJob,
   getAllJobsPublic,
   getJobByIdPublic
} from "../controllers/job.controller.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CompanyStub:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         logo:
 *           type: string
 *           format: url
 *     Job:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *         salary:
 *           type: number
 *         location:
 *           type: string
 *         jobType:
 *           type: string
 *           enum: [Full-time, Part-time, Contract, Internship]
 *         experienceLevel:
 *           type: string
 *           enum: [Entry-level, Mid-level, Senior-level]
 *         company:
 *           $ref: '#/components/schemas/CompanyStub'
 *         postedBy:
 *           type: string
 *           description: "User ID of the recruiter who posted"
 *         applications:
 *           type: array
 *           items:
 *             type: string
 *             description: "IDs of applications for this job"
 */

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Public and recruiter-specific job management endpoints
 */

// --- PUBLIC ROUTES ---

/**
 * @swagger
 * /jobs/public:
 *   get:
 *     summary: Get a list of all public jobs with filtering and pagination
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword for job title, company name, or requirements.
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter jobs by location.
 *       - in: query
 *         name: jobType
 *         schema:
 *           type: string
 *           enum: [Full-time, Part-time, Contract, Internship]
 *         description: Filter by the type of job.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 9
 *         description: The number of jobs to return per page.
 *     responses:
 *       '200':
 *         description: A paginated list of public jobs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Job'
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 */
router.route("/public").get(getAllJobsPublic);

/**
 * @swagger
 * /jobs/public/{id}:
 *   get:
 *     summary: Get the full details of a single public job by its ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the job.
 *     responses:
 *       '200':
 *         description: Detailed information about the job.
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Job'
 *       '404':
 *         description: Job not found.
 */
router.route("/public/:id").get(getJobByIdPublic);

// --- RECRUITER PROTECTED ROUTES ---
router.use(verifyJWT, isRecruiter);

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Post a new job (Recruiter role required)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, requirements, salary, location, jobType, experienceLevel, companyId]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Senior Frontend Developer"
 *               description:
 *                 type: string
 *                 example: "We are looking for an experienced developer to build beautiful UIs."
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["React", "TypeScript", "TailwindCSS"]
 *               salary:
 *                 type: number
 *                 example: 150000
 *               location:
 *                 type: string
 *                 example: "San Francisco, CA"
 *               jobType:
 *                 type: string
 *                 enum: [Full-time, Part-time, Contract, Internship]
 *               experienceLevel:
 *                 type: string
 *                 enum: [Entry-level, Mid-level, Senior-level]
 *               companyId:
 *                 type: string
 *                 description: "The ID of the company this job belongs to."
 *     responses:
 *       '201':
 *         description: Job posted successfully.
 *       '400':
 *         description: Missing required fields.
 *       '403':
 *         description: Forbidden. User is not authorized to post for this company.
 *       '404':
 *         description: Company not found.
 *   get:
 *     summary: Get all jobs posted by the currently logged-in recruiter
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of jobs posted by the recruiter.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 */
router.route("/")
    .post(postJob)
    .get(getMyPostedJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   patch:
 *     summary: Update an existing job posting (Recruiter role required)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job to update.
 *     requestBody:
 *       description: The job fields to update.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               salary:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Job updated successfully.
 *       '403':
 *         description: Forbidden. User did not post this job.
 *       '404':
 *         description: Job not found.
 *   delete:
 *     summary: Delete a job posting (Recruiter role required)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job to delete.
 *     responses:
 *       '200':
 *         description: Job deleted successfully.
 *       '403':
 *         description: Forbidden. User did not post this job.
 *       '404':
 *         description: Job not found.
 */
router.route("/:id")
    .patch(updateJob)
    .delete(deleteJob);

export default router;