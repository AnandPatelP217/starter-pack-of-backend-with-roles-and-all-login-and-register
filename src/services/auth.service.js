import bcrypt from "bcrypt";
import { generatetoken } from "../utils/generateToken.js";
import { createAdmin, createCustomer, createEditor, findUserByEmail, findUserById } from "../repositories/auth.repository.js";

// 🔹 LOGIN SERVICE
export const loginService = async (email, password) => {
  // Validate inputs
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await findUserByEmail(email);
  
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Check if password exists in database
  if (!user.password) {
    console.error("❌ Password not found in database for user:", email);
    throw new Error("Account configuration error. Please contact support.");
  }

  // Check if user is blocked (except admin)
  if (user.role !== "admin" && user.isBlocked) {
    throw new Error("Account is blocked");
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generatetoken(user._id, user.role);
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

// 🔹 ME SERVICE
export const meService = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");
  return user;
};

// 🔹 SIGNUP (CUSTOMER)
export const signupCustomerService = async (name, email, password) => {
  const exists = await findUserByEmail(email);
  if (exists) throw new Error("Email already in use");

  const hashed = await bcrypt.hash(password, 10);
  await createCustomer({ name, email, password: hashed });
  return { message: "Customer registered successfully" };
};

// 🔹 SIGNUP (EDITOR)
export const signupEditorService = async (name, email, password, skills = []) => {
  const exists = await findUserByEmail(email);
  if (exists) throw new Error("Email already in use");

  const hashed = await bcrypt.hash(password, 10);
  await createEditor({ name, email, password: hashed, skills });
  return { message: "Editor registered successfully" };
};

// 🔹 SIGNUP (ADMIN)
export const signupAdminService = async (name, company_name, email, password) => {
  const exists = await findUserByEmail(email);
  if (exists) throw new Error("Email already in use");

  const hashed = await bcrypt.hash(password, 10);
  await createAdmin({ name, company_name, email, password: hashed });
  return { message: "Admin registered successfully" };
};
