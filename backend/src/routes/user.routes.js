import { Router } from "express";
import { registerUser, loginUser, updateProfile, getCurrentUser, getJobRecommendations, getUserPublicProfile } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyRecaptcha } from "../middleware/recaptcha.middleware.js";

const router = Router();

// --- SWAGGER: REUSABLE COMPONENTS & DEFINITIONS ---

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the user.
 *         fullName:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         role:
 *           type: string
 *           enum: [student, recruiter, admin]
 *         profile:
 *           type: object
 *           properties:
 *             bio:
 *               type: string
 *             skills:
 *               type: array
 *               items:
 *                 type: string
 *             resume:
 *               type: string
 *               format: url
 *               description: "URL to the user's resume file"
 *             resumeOriginalName:
 *               type: string
 *               description: "The original filename of the uploaded resume"
 *             avatar:
 *               type: string
 *               format: url
 *               description: "URL to the user's avatar image"
 *     ApiResponse:
 *        type: object
 *        properties:
 *          statusCode:
 *            type: integer
 *          data:
 *            type: object
 *          message:
 *            type: string
 *          success:
 *            type: boolean
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: "Enter the token with the 'Bearer ' prefix, e.g., 'Bearer abcde12345'"
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User authentication and profile management endpoints
 */

// --- SWAGGER: ROUTE DOCUMENTATION ---

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user (student or recruiter)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, phoneNumber, password, role, recaptchaToken]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "9800000000"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *               role:
 *                 type: string
 *                 enum: [student, recruiter]
 *                 example: "student"
 *               recaptchaToken:
 *                 type: string
 *                 description: "The token obtained from Google reCAPTCHA on the frontend."
 *     responses:
 *       '201':
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       '400':
 *         description: Missing required fields or reCAPTCHA token.
 *       '409':
 *         description: A user with the provided email already exists.
 */
router.route("/register").post(verifyRecaptcha, registerUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, role, recaptchaToken]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *               role:
 *                 type: string
 *                 enum: [student, recruiter, admin]
 *                 example: "student"
 *               recaptchaToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User logged in successfully. Returns user data and tokens.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       '401':
 *         description: Invalid user credentials.
 *       '403':
 *         description: User is not registered with the specified role.
 *       '404':
 *         description: User does not exist.
 */
router.route("/login").post(verifyRecaptcha, loginUser);

/**
 * @swagger
 * /users/current-user:
 *   get:
 *     summary: Get the profile of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Current user data fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized. Invalid or missing token.
 */
router.route("/current-user").get(verifyJWT, getCurrentUser);

/**
 * @swagger
 * /users/update-profile:
 *   patch:
 *     summary: Update the current user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               bio:
 *                 type: string
 *               skills:
 *                 type: string
 *                 description: "A comma-separated string of skills (e.g., 'React,Node.js,MongoDB')"
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: "Image file for the user's avatar"
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: "PDF file for the user's resume"
 *     responses:
 *       '200':
 *         description: Profile updated successfully.
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Failed to upload file.
 */
router.route("/update-profile").patch(
    verifyJWT,
    upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'resume', maxCount: 1 }]),
    updateProfile
);

/**
 * @swagger
 * /users/profile/{userId}:
 *   get:
 *     summary: Get a user's public profile by their ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the user to retrieve.
 *     responses:
 *       '200':
 *         description: User profile fetched successfully.
 *       '404':
 *         description: User not found.
 */
router.route("/profile/:userId").get(verifyJWT, getUserPublicProfile);

/**
 * @swagger
 * /users/recommendations:
 *   get:
 *     summary: Get job recommendations based on the logged-in user's skills
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of recommended jobs. Returns latest jobs if user has no skills.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object # You will define a full 'Job' schema in job.routes.js
 */
router.route("/recommendations").get(verifyJWT, getJobRecommendations);

export default router;