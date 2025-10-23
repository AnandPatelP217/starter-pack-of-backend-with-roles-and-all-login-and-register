import express from "express";
import {
  login,
  me,
  logout,
  signupCustomer,
  signupEditor,
  signupAdmin,
} from "../controllers/auth.controller.js";
import { authorizeRoles, ProtectRoute } from "../middlewares/auth.middleware.js"; // for authenticated routes
import { validate } from "../middlewares/validate.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
  loginSchema,
  signupCustomerSchema,
  signupEditorSchema,
  signupAdminSchema,
} from "../validators/auth.validator.js";

const AuthRouter = express.Router();

/**
 * ---------------------------
 * AUTH ROUTES
 * ---------------------------
 * Validation is handled by validate() middleware with Joi schemas
 */

// 🔹 Public routes
AuthRouter.post("/login", authLimiter, validate(loginSchema), login);
AuthRouter.post("/signup/customer", authLimiter, validate(signupCustomerSchema), signupCustomer);
AuthRouter.post("/signup/editor", ProtectRoute, authorizeRoles("admin"), validate(signupEditorSchema), signupEditor);
AuthRouter.post("/signup/admin", validate(signupAdminSchema), signupAdmin);

// 🔹 Protected routes (user must be logged in)
AuthRouter.get("/me", ProtectRoute, me);
AuthRouter.post("/logout", ProtectRoute, logout);

export default AuthRouter;
