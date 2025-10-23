import Joi from "joi";

/**
 * ---------------------------
 * AUTH VALIDATION SCHEMAS
 * ---------------------------
 */

// Login validation schema
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
      "string.empty": "Email cannot be empty",
    }),
  password: Joi.string()
    .min(1)
    .required()
    .messages({
      "string.min": "Password is required",
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
});

// Customer signup validation schema
export const signupCustomerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .trim()
    .messages({
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 50 characters",
      "any.required": "Name is required",
      "string.empty": "Name cannot be empty",
    }),
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
      "string.empty": "Email cannot be empty",
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
  contact: Joi.string()
    .max(15)
    .trim()
    .optional()
    .allow("", null),
  address: Joi.string()
    .max(100)
    .trim()
    .optional()
    .allow("", null),
});

// Editor signup validation schema
export const signupEditorSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .trim()
    .messages({
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 50 characters",
      "any.required": "Name is required",
      "string.empty": "Name cannot be empty",
    }),
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
      "string.empty": "Email cannot be empty",
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
  skills: Joi.array()
    .items(Joi.string())
    .default([])
    .messages({
      "array.base": "Skills must be an array of strings",
    }),
  isAvailable: Joi.boolean()
    .default(true)
    .optional(),
});

// Admin signup validation schema
export const signupAdminSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .trim()
    .messages({
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 50 characters",
      "any.required": "Name is required",
      "string.empty": "Name cannot be empty",
    }),
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
      "string.empty": "Email cannot be empty",
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
  company_name: Joi.string()
    .required()
    .trim()
    .messages({
      "any.required": "Company name is required",
      "string.empty": "Company name cannot be empty",
    }),
});
