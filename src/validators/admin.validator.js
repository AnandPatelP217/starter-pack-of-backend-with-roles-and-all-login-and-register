/**
 * ---------------------------
 * ADMIN VALIDATOR
 * ---------------------------
 * Joi validation schemas for admin routes
 */

import Joi from 'joi';

export const toggleSuspensionSchema = Joi.object({
  suspension_reason: Joi.string().trim().min(10).max(500).optional()
    .messages({
      'string.min': 'Suspension reason must be at least 10 characters'
    })
});

export const rejectEditorSchema = Joi.object({
  rejection_reason: Joi.string().trim().min(10).max(500).required()
    .messages({
      'string.empty': 'Rejection reason is required',
      'string.min': 'Rejection reason must be at least 10 characters'
    })
});

export const updateEditorProfileSchema = Joi.object({
  bio: Joi.string().trim().max(1000).optional(),
  skills: Joi.array().items(
    Joi.string().valid(
      'color_grading',
      'motion_graphics',
      'sound_design',
      'video_effects',
      'animation',
      'green_screen',
      '3d_modeling',
      'subtitle_creation'
    )
  ).optional(),
  software_expertise: Joi.array().items(
    Joi.string().valid(
      'Adobe Premiere Pro',
      'Final Cut Pro',
      'DaVinci Resolve',
      'After Effects',
      'Avid Media Composer',
      'Blender'
    )
  ).optional(),
  years_of_experience: Joi.number().min(0).optional(),
  specialization: Joi.string().valid(
    'wedding', 'corporate', 'youtube', 'music_video', 
    'documentary', 'commercial', 'social_media', 'general'
  ).optional(),
  portfolio_url: Joi.string().uri().optional(),
  hourly_rate: Joi.number().min(0).optional(),
  minimum_project_fee: Joi.number().min(0).optional(),
  isAvailable: Joi.boolean().optional(),
  max_concurrent_projects: Joi.number().min(1).max(10).optional(),
  bank_details: Joi.object({
    account_number: Joi.string().optional(),
    ifsc_code: Joi.string().optional(),
    account_holder_name: Joi.string().optional(),
    bank_name: Joi.string().optional(),
    upi_id: Joi.string().optional(),
    paypal_email: Joi.string().email().optional()
  }).optional()
}).min(1);
