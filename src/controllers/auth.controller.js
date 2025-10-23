import {
  loginService,
  meService,
  signupCustomerService,
  signupEditorService,
  signupAdminService,
} from "../services/auth.service.js";

/**
 * ---------------------------
 * AUTH CONTROLLERS
 * ---------------------------
 * Note: Validation is handled by middleware in routes
 */

export const login = async (req, res, next) => {
  try {
    // Validation handled by middleware
    const { email, password } = req.body;

    const result = await loginService(email, password);

    res.status(200).json({
      success: true,
      message: `${result.user.role} logged in successfully`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const { userId } = req.user || {};
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await meService(userId);
    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

// 🔹 Customer signup
export const signupCustomer = async (req, res, next) => {
  try {
    // Validation handled by middleware
    const { name, email, password, contact, address } = req.body;

    const result = await signupCustomerService(name, email, password, { contact, address });
    res.status(201).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

// 🔹 Editor signup
export const signupEditor = async (req, res, next) => {
  try {
    // Validation handled by middleware
    const { name, email, password, skills, isAvailable } = req.body;

    const result = await signupEditorService(name, email, password, skills, isAvailable);
    res.status(201).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

// 🔹 Admin signup
export const signupAdmin = async (req, res, next) => {
  try {
    // Validation handled by middleware
    const { name, company_name, email, password } = req.body;

    const result = await signupAdminService(name, company_name, email, password);
    res.status(201).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};
