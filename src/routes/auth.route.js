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
import { requireFields } from "../middlewares/validate.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const AuthRouter = express.Router();

/**
 * ---------------------------
 * AUTH ROUTES
 * ---------------------------
 */

// 🔹 Public routes
AuthRouter.post("/login", authLimiter, login);
AuthRouter.post("/signup/customer", authLimiter, requireFields(["name", "email", "password"]), signupCustomer);
AuthRouter.post("/signup/editor", ProtectRoute,  requireFields(["name", "email", "password"]), authorizeRoles("admin"), signupEditor);
AuthRouter.post("/signup/admin", signupAdmin);

// 🔹 Protected routes (user must be logged in)
AuthRouter.get("/me", ProtectRoute, me);
AuthRouter.post("/logout", ProtectRoute, logout);

export default AuthRouter;
