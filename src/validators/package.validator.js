/**
 * ---------------------------
 * PACKAGE VALIDATOR
 * ---------------------------
 * Joi validation schemas for package routes
 */

import Joi from 'joi';

export const createPackageSchema = Joi.object({
  name: Joi.string().valid('basic', 'advanced', 'custom').required()
    .messages({
      'any.only': 'Package name must be basic, advanced, or custom',
      'string.empty': 'Package name is required'
    }),
  
  display_name: Joi.string().trim().min(3).max(50).required()
    .messages({
      'string.empty': 'Display name is required'
    }),
  
  description: Joi.string().trim().min(10).max(500).required()
    .messages({
      'string.empty': 'Description is required'
    }),
  
  base_price: Joi.number().min(0).required()
    .messages({
      'number.min': 'Base price must be a positive number',
      'any.required': 'Base price is required'
    }),
  
  price_per_minute: Joi.number().min(0).optional(),
  
  currency: Joi.string().default('INR'),
  
  features: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      description: Joi.string().optional(),
      included: Joi.boolean().default(true)
    })
  ).optional(),
  
  max_video_length: Joi.number().min(1).required()
    .messages({
      'number.min': 'Maximum video length must be at least 1 minute',
      'any.required': 'Maximum video length is required'
    }),
  
  max_file_size: Joi.number().min(1).required()
    .messages({
      'number.min': 'Maximum file size must be at least 1 MB',
      'any.required': 'Maximum file size is required'
    }),
  
  max_revisions: Joi.number().min(0).required(),
  
  estimated_delivery_days: Joi.number().min(1).required(),
  
  priority_support: Joi.boolean().optional(),
  
  editing_options: Joi.object({
    color_grading: Joi.boolean().optional(),
    transitions: Joi.boolean().optional(),
    sound_design: Joi.boolean().optional(),
    motion_graphics: Joi.boolean().optional(),
    subtitles: Joi.boolean().optional(),
    green_screen: Joi.boolean().optional(),
    custom_effects: Joi.boolean().optional()
  }).optional(),
  
  is_active: Joi.boolean().optional(),
  is_popular: Joi.boolean().optional()
});

export const updatePackageSchema = Joi.object({
  name: Joi.string().valid('basic', 'advanced', 'custom').optional(),
  display_name: Joi.string().trim().min(3).max(50).optional(),
  description: Joi.string().trim().min(10).max(500).optional(),
  base_price: Joi.number().min(0).optional(),
  price_per_minute: Joi.number().min(0).optional(),
  currency: Joi.string().optional(),
  features: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      description: Joi.string().optional(),
      included: Joi.boolean().default(true)
    })
  ).optional(),
  max_video_length: Joi.number().min(1).optional(),
  max_file_size: Joi.number().min(1).optional(),
  max_revisions: Joi.number().min(0).optional(),
  estimated_delivery_days: Joi.number().min(1).optional(),
  priority_support: Joi.boolean().optional(),
  editing_options: Joi.object({
    color_grading: Joi.boolean().optional(),
    transitions: Joi.boolean().optional(),
    sound_design: Joi.boolean().optional(),
    motion_graphics: Joi.boolean().optional(),
    subtitles: Joi.boolean().optional(),
    green_screen: Joi.boolean().optional(),
    custom_effects: Joi.boolean().optional()
  }).optional(),
  is_active: Joi.boolean().optional(),
  is_popular: Joi.boolean().optional()
}).min(1);

export const setPopularSchema = Joi.object({
  is_popular: Joi.boolean().required()
});
