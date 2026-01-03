import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
   accessChat,
   fetchMyChats,
   fetchMessages,
   sendMessage
} from "../controllers/chat.controller.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         sender:
 *           $ref: '#/components/schemas/User'
 *         content:
 *           type: string
 *         chat:
 *           type: string
 *           description: "The ID of the chat this message belongs to."
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Chat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         latestMessage:
 *           $ref: '#/components/schemas/Message'
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Real-time messaging between users (students and recruiters)
 */

// All routes in this file require a valid JWT
router.use(verifyJWT);

/**
 * @swagger
 * /chats:
 *   post:
 *     summary: Access or create a one-on-one chat with another user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user you want to start a chat with.
 *     responses:
 *       '200':
 *         description: Successfully accessed an existing chat.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       '201':
 *         description: Successfully created a new chat.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       '400':
 *         description: UserId is required.
 *   get:
 *     summary: Fetch all chats (conversations) for the current user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: An array of the user's chats, sorted by the most recently updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 */
router.route("/").post(accessChat).get(fetchMyChats);

/**
 * @swagger
 * /chats/messages:
 *   post:
 *     summary: Send a message to a specific chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, chatId]
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Hello, I'm interested in the position."
 *               chatId:
 *                 type: string
 *                 description: The ID of the chat to send the message to.
 *     responses:
 *       '201':
 *         description: Message sent successfully.
 *       '400':
 *         description: Content and chatId are required.
 */
router.route("/messages").post(sendMessage);

/**
 * @swagger
 * /chats/messages/{chatId}:
 *   get:
 *     summary: Fetch all messages for a specific chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat whose messages you want to retrieve.
 *     responses:
 *       '200':
 *         description: An array of messages for the specified chat.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 */
router.route("/messages/:chatId").get(fetchMessages);

export default router;