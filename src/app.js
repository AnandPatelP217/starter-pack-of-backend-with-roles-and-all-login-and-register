/**
 * Express application configuration - This is my main app setup
 * I keep this separate from server.js to make testing easier
 * and to follow separation of concerns principle
 */

import express from "express";
import { STATUS } from "./constants/statusCodes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { sendResponse } from "./utils/sendResponse.js";
import AuthRouter from "./routes/auth.route.js";
import helmet from "helmet";
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";

// Create Express application instance
export const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
  contentSecurityPolicy: false // Disable for development, configure for production
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply to all API routes
app.use('/api/', apiLimiter);

app.use('/api/auth', AuthRouter);

app.get("/", (req, res) => {
  sendResponse(res, STATUS.OK, "Backend Working", {
    data: "hello",
    yourIp: `${req.ip}`,
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);
