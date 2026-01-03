import { Router } from "express";
import { verifyJWT, isAdmin } from "../middleware/auth.middleware.js";
import {
   getAllCompaniesForAdmin,
   toggleCompanyVerification,
   getAllUsersForAdmin,
   getChatbotSettings,
   updateChatbotSettings
} from "../controllers/admin.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative tasks for managing the platform. Requires 'admin' role for all endpoints.
 */

// All routes in this file are protected and require admin privileges
router.use(verifyJWT, isAdmin);

/**
 * @swagger
 * /admin/companies:
 *   get:
 *     summary: Get a list of all companies in the system (Admin view)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves a complete list of all companies, regardless of their verification status. Includes owner details.
 *     responses:
 *       '200':
 *         description: An array of all company objects.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden. User is not an admin.
 */
router.route("/companies").get(getAllCompaniesForAdmin);

/**
 * @swagger
 * /admin/companies/{companyId}/toggle-verification:
 *   patch:
 *     summary: Verify or un-verify a company profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Toggles the `verified` status of a company, making it visible or hidden from public view.
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the company to update.
 *     responses:
 *       '200':
 *         description: Company verification status was successfully toggled.
 *       '404':
 *         description: Company not found.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden. User is not an admin.
 */
router.route("/companies/:companyId/toggle-verification").patch(toggleCompanyVerification);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get a list of all users in the system (Admin view)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves a complete list of all users (students, recruiters, and other admins).
 *     responses:
 *       '200':
 *         description: An array of all user objects.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden. User is not an admin.
 */
router.route("/users").get(getAllUsersForAdmin);

/**
 * @swagger
 * /admin/chatbot-settings:
 *   get:
 *     summary: Get the current system prompt for the AI chatbot
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: The current chatbot settings.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     systemPrompt:
 *                       type: string
 *   put:
 *     summary: Update the system prompt for the AI chatbot
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [systemPrompt]
 *             properties:
 *               systemPrompt:
 *                 type: string
 *                 description: "The new set of master instructions for the chatbot's personality and rules."
 *     responses:
 *       '200':
 *         description: Chatbot settings updated successfully.
 *       '400':
 *         description: The system prompt content is required.
 */
router.route("/chatbot-settings").get(getChatbotSettings).put(updateChatbotSettings);

export default router;