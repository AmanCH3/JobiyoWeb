import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { errorHandler } from "./middleware/error.middleware.js";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import requestLogger from "./middleware/requestLogger.js";
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN === "*" ? "http://localhost:5173" : process.env.CORS_ORIGIN,
    credentials: true,
}));

app.set('trust proxy', 1); // Trust first proxy (required for secure cookies in production)

app.use(helmet()); // Set security headers

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(requestLogger);

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
app.use("/api/v1/admin/logs", logRouter);
app.use(errorHandler);

export { app };