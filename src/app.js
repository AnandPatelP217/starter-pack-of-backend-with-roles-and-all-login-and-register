/**
 * Express application configuration - This is my main app setup
 * I keep this separate from server.js to make testing easier
 * and to follow separation of concerns principle
 */

import express from "express";
import { STATUS } from "./constants/statusCodes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { sendResponse } from "./utils/sendResponse.js";
import helmet from "helmet";
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";

// Import routes
import AuthRouter from "./routes/auth.route.js";
import UploadRouter from "./routes/upload.route.js";
import ProjectRouter from "./routes/project.route.js";
import PackageRouter from "./routes/package.route.js";
import PaymentRouter from "./routes/payment.route.js";
import PayoutRouter from "./routes/payout.route.js";
import MessageRouter from "./routes/message.route.js";
import NotificationRouter from "./routes/notification.route.js";
import AdminRouter from "./routes/admin.route.js";

// Create Express application instance
export const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
  contentSecurityPolicy: false // Disable for development, configure for production
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to all API routes
app.use('/api/', apiLimiter);

// Mount routes
app.use('/api/auth', AuthRouter);
app.use("/api/upload", UploadRouter);
app.use('/api/projects', ProjectRouter);
app.use('/api/packages', PackageRouter);
app.use('/api/payments', PaymentRouter);
app.use('/api/payouts', PayoutRouter);
app.use('/api/messages', MessageRouter);
app.use('/api/notifications', NotificationRouter);
app.use('/api/admin', AdminRouter);

app.get("/", (req, res) => {
  sendResponse(res, STATUS.OK, "Backend Working", {
    data: "hello",
    yourIp: `${req.ip}`,
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);
