import AppError from "../utils/AppError.js";
import { STATUS } from "../constants/statusCodes.js";

export const validateLoginDto = async (data) => {
  const errors = [];
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push("Valid email is required");
  }
  if (!data.password || data.password.length < 1) {
    errors.push("Password is required");
  }
  if (errors.length > 0) {
    throw new AppError(errors.join(", "), STATUS.BAD_REQUEST);
  }
};

export const validateSignupCustomerDto = async (data) => {
  const errors = [];
  if (!data.name) errors.push("Name is required");
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) errors.push("Valid email is required");
  if (!data.password || data.password.length < 6)
    errors.push("Password must be at least 6 characters");
  if (errors.length > 0) throw new ValidationError(errors);
};

export const validateSignupEditorDto = async (data) => {
  const errors = [];
  if (!data.name) errors.push("Name is required");
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) errors.push("Valid email is required");
  if (!data.password || data.password.length < 6)
    errors.push("Password must be at least 6 characters");
  if (!Array.isArray(data.skills)) errors.push("Skills must be an array");
  if (errors.length > 0) throw new ValidationError(errors);
};

export const validateSignupAdminDto = async (data) => {
  const errors = [];
  if (!data.name) errors.push("Name is required");
  if (!data.company_name) errors.push("Company name is required");
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) errors.push("Valid email is required");
  if (!data.password || data.password.length < 6)
    errors.push("Password must be at least 6 characters");
  if (errors.length > 0) throw new ValidationError(errors);
};
