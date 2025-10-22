import {
  loginService,
  meService,
  signupCustomerService,
  signupEditorService,
  signupAdminService,
} from "../services/auth.service.js";

import {
  validateLoginDto,
  validateSignupCustomerDto,
  validateSignupEditorDto,
  validateSignupAdminDto,
} from "../dtos/auth.dto.js";
/**
 * ---------------------------
 * AUTH CONTROLLERS
 * ---------------------------
 */

export const login = async (req, res, next) => {
  try {
      await validateLoginDto(req.body);
    const { email: rawEmail, password } = req.body || {};
    const email = String(rawEmail || "").trim().toLowerCase();

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "email and password required" });
    }

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
      await validateSignupCustomerDto(req.body);
    const { name, email: rawEmail, password } = req.body || {};
    const email = String(rawEmail || "").trim().toLowerCase();

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "name, email and password required" });
    }

    const result = await signupCustomerService(name, email, password);
    res.status(201).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

// 🔹 Editor signup
export const signupEditor = async (req, res, next) => {
  try {
      await validateSignupEditorDto(req.body);
    const { name, email: rawEmail, password, skills = [] } = req.body || {};
    const email = String(rawEmail || "").trim().toLowerCase();

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "name, email and password required" });
    }

    const result = await signupEditorService(name, email, password, skills);
    res.status(201).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

// 🔹 Admin signup
export const signupAdmin = async (req, res, next) => {
  try {
      await validateSignupAdminDto(req.body);
    const { name, company_name, email: rawEmail, password } = req.body || {};
    const email = String(rawEmail || "").trim().toLowerCase();

    if (!name || !company_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, company_name, email and password required",
      });
    }

    const result = await signupAdminService(name, company_name, email, password);
    res.status(201).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};
