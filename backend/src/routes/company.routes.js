import { Router } from "express";
import { verifyJWT, isRecruiter } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
    createCompany,
    getMyCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
    getPublicCompanies,
    getCompanyDetailPublic
} from "../controllers/company.controller.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: "The unique identifier for the company"
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         website:
 *           type: string
 *           format: url
 *         location:
 *           type: string
 *         logo:
 *           type: string
 *           format: url
 *           description: "URL of the company's logo"
 *         owner:
 *           type: string
 *           description: "The User ID of the recruiter who owns this company profile"
 *         verified:
 *           type: boolean
 *           description: "Indicates if the company has been verified by an admin"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: API for managing company profiles. Public routes are open, while management routes require recruiter authentication.
 */

// --- PUBLIC ROUTES ---

/**
 * @swagger
 * /companies/public:
 *   get:
 *     summary: Get a list of all publicly verified companies
 *     tags: [Companies]
 *     responses:
 *       '200':
 *         description: An array of verified company objects.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 */
router.route("/public").get(getPublicCompanies);

/**
 * @swagger
 * /companies/public/{companyId}:
 *   get:
 *     summary: Get the public details of a single company, including its open job listings
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the company to retrieve.
 *     responses:
 *       '200':
 *         description: An object containing the company's details and a list of its jobs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     company:
 *                       $ref: '#/components/schemas/Company'
 *                     jobs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Job' # Assumes Job schema is defined elsewhere
 *       '404':
 *         description: Company not found or is not verified.
 */
router.route("/public/:companyId").get(getCompanyDetailPublic);


// --- RECRUITER PROTECTED ROUTES ---
router.use(verifyJWT, isRecruiter);

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company profile (Recruiter role required)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Innovate Tech Nepal"
 *               description:
 *                 type: string
 *                 example: "A leading software development company in Kathmandu."
 *               website:
 *                 type: string
 *                 format: url
 *                 example: "https://innovate.com.np"
 *               location:
 *                 type: string
 *                 example: "Kathmandu, Nepal"
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: "Image file for the company logo."
 *     responses:
 *       '201':
 *         description: Company created successfully.
 *       '400':
 *         description: Company name is required.
 *       '409':
 *         description: A company with this name already exists.
 *   get:
 *     summary: Get all companies owned by the logged-in recruiter
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: An array of the recruiter's company objects.
 */
router.route("/")
    .post(upload.single('logo'), createCompany)
    .get(getMyCompanies);

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get a specific company by ID (Recruiter must be owner)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the company to retrieve.
 *     responses:
 *       '200':
 *         description: Company data fetched successfully.
 *       '404':
 *         description: Company not found.
 *   patch:
 *     summary: Update a company's details (Recruiter must be owner)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the company to update.
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *               location:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Company updated successfully.
 *       '403':
 *         description: Forbidden. User is not authorized to update this company.
 *       '404':
 *         description: Company not found.
 *   delete:
 *     summary: Delete a company and its associated jobs (Recruiter must be owner)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the company to delete.
 *     responses:
 *       '200':
 *         description: Company and associated jobs deleted successfully.
 *       '403':
 *         description: Forbidden. User is not authorized to delete this company.
 *       '404':
 *         description: Company not found.
 */
router.route("/:id")
    .get(getCompanyById)
    .patch(upload.single('logo'), updateCompany)
    .delete(deleteCompany);

export default router;