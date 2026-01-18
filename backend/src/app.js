import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { errorHandler } from "./middleware/error.middleware.js";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import requestLogger from "./middleware/requestLogger.js";
import { requestId } from "./middleware/requestId.middleware.js";
import { initLogRetention } from "./services/logRetention.service.js";

const app = express();
initLogRetention(); // Initialize Scheduled Jobs
app.use(cors({
    origin: process.env.CORS_ORIGIN === "*" ? "https://localhost:5173" : process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(requestId); // Ensure Request ID is assigned early
app.set('trust proxy', 1); // Trust first proxy (required for secure cookies in production)

// ============================================
// HELMET.JS - HTTP Header Security Configuration
// Protects against XSS, clickjacking, and data leakage
// ============================================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://www.gstatic.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://accounts.google.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "https://accounts.google.com", "wss:", "ws:"],
            frameSrc: ["'self'", "https://accounts.google.com", "https://www.google.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    noSniff: true,
    dnsPrefetchControl: { allow: false },
    ieNoOpen: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    hsts: {
        maxAge: 31536000, 
        includeSubDomains: true,
        preload: true,
    },
    xssFilter: true,
    hidePoweredBy: true,
}));

import promotionRouter from "./routes/promotion.routes.js";

import mongoSanitize from 'express-mongo-sanitize';

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(requestLogger);

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jobiyo Job Portal API',
      version: '1.0.0',
      description: 'API documentation for the Jobiyo job portal backend.',
      contact: {
        name: 'Aman Chaudhary',
        email: 'amanchaudhary@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:8000/api/v1',
        description: 'Development server'
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

import userRouter from "./routes/user.routes.js";
import companyRouter from "./routes/company.routes.js"; 
import jobRouter from "./routes/job.routes.js";
import recruiterDashboardRouter from "./routes/recruiter.dashboard.routes.js";
import applicationRouter from "./routes/application.routes.js";
import adminRouter from "./routes/admin.routes.js"
import chatbotRouter from "./routes/chatbot.routes.js";
import interviewRouter from "./routes/interview.routes.js";
import chatRouter from "./routes/chat.routes.js";
import logRouter from "./routes/logRoutes.js";
import activityLogRouter from "./routes/activityLog.routes.js";
import securityLogRouter from "./routes/securityLog.routes.js";
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/companies", companyRouter);
app.use("/api/v1/jobs", jobRouter);  
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/applications", applicationRouter);
app.use("/api/v1/recruiter-dashboard", recruiterDashboardRouter);
app.use("/api/v1/chatbot", chatbotRouter); 
app.use("/api/v1/interviews", interviewRouter);
app.use("/api/v1/chats", chatRouter);  
app.use("/api/v1/promotions", promotionRouter);
app.use("/api/v1/admin/logs", logRouter);
app.use("/api/v1/activity-logs", activityLogRouter);
app.use("/api/v1/security-logs", securityLogRouter);
app.use(errorHandler);

export { app };