import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN === "*" ? "http://localhost:5173" : process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

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
app.use(errorHandler);

export { app };