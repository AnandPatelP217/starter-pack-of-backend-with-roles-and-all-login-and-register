// repositories/user.repository.js
import { User, Customer, Editor, Admin } from "../models/user.model.js";

// Find user by email (FOR LOGIN - includes password)
export const findUserByEmail = async (email) => {
  return await User.findOne({ email }).select('+password'); // ✅ This is the key fix!
};

// Find user by ID (excludes password)
export const findUserById = async (id) => {
  return await User.findById(id).select('-password');
};

// Create Customer
export const createCustomer = async (data) => {
  return await Customer.create(data);
};

// Create Editor
export const createEditor = async (data) => {
  return await Editor.create(data);
};

// Create Admin
export const createAdmin = async (data) => {
  return await Admin.create(data);
};
