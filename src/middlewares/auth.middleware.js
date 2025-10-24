import jwt from "jsonwebtoken";

import { STATUS } from "../constants/statusCodes.js";
import { sendResponse } from "../utils/sendResponse.js";

export const ProtectRoute = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res
      .status(STATUS.UNAUTHORIZED)
      .json({ success: false, message: "You are not logged in. Please login to get access" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (error) {
    return res
      .status(STATUS.UNAUTHORIZED)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendResponse(res, STATUS.FORBIDDEN, "Access denied");
    }
    next();
  };
};
