import { Router } from "express";
import { handleChatQuery } from "../controllers/chatbot.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Public endpoint for interacting with the AI assistant to ask about jobs and companies.
 */

/**
 * @swagger
 * /chatbot/query:
 *   post:
 *     summary: Send a query to the AI assistant
 *     tags: [Chatbot]
 *     description: >
 *       This endpoint allows any user to interact with the Jobiyo Helper AI.
 *       It takes a user's query and an optional conversation history to provide context-aware responses
 *       based on the currently available jobs and verified companies in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "Are there any part-time jobs in Kathmandu?"
 *               history:
 *                 type: array
 *                 description: "The previous conversation history to maintain context. The format should match the Gemini API structure."
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, model]
 *                     text:
 *                       type: string
 *                 example:
 *                   - role: "user"
 *                     text: "Hello, who are you?"
 *                   - role: "model"
 *                     text: "I am Jobiyo Helper. How can I assist you?"
 *     responses:
 *       '200':
 *         description: The chatbot's response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     response:
 *                       type: string
 *                       example: "Yes, we currently have a Part-time Graphic Designer position listed in Kathmandu."
 *       '400':
 *         description: Bad Request. The 'query' field is required in the request body.
 */
router.route("/query").post(handleChatQuery);

export default router;