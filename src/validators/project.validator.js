/**
 * ---------------------------
 * PROJECT VALIDATOR
 * ---------------------------
 * Joi validation schemas for project routes
 */

import Joi from 'joi';

export const createProjectSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required()
    .messages({
      'string.empty': 'Project title is required',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  
  description: Joi.string().trim().min(10).max(1000).required()
    .messages({
      'string.empty': 'Project description is required',
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  package_type: Joi.string().valid('basic', 'advanced', 'custom').required()
    .messages({
      'any.only': 'Package type must be basic, advanced, or custom',
      'string.empty': 'Package type is required'
    }),
  
  editing_instructions: Joi.string().trim().min(10).max(2000).required()
    .messages({
      'string.empty': 'Editing instructions are required',
      'string.min': 'Instructions must be at least 10 characters'
    }),
  
  special_requirements: Joi.array().items(Joi.string().trim()).optional(),
  
  raw_footage: Joi.array().items(
    Joi.object({
      upload_id: Joi.string().required(),
      filename: Joi.string().required(),
      size: Joi.number().required(),
      uploaded_at: Joi.date().optional()
    })
  ).optional()
});

export const assignEditorSchema = Joi.object({
  editor_id: Joi.string().required()
    .messages({
      'string.empty': 'Editor ID is required'
    })
});

export const updateProjectStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending_assignment', 'assigned', 'in_progress', 'ready_for_review', 'revision_requested', 'completed', 'cancelled')
    .required()
    .messages({
      'any.only': 'Invalid project status',
      'string.empty': 'Status is required'
    }),
  
  cancellation_reason: Joi.string().when('status', {
    is: 'cancelled',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

export const requestRevisionSchema = Joi.object({
  feedback: Joi.string().trim().min(10).max(1000).required()
    .messages({
      'string.empty': 'Feedback is required for revision request',
      'string.min': 'Feedback must be at least 10 characters'
    })
});

export const uploadEditedVideoSchema = Joi.object({
  upload_id: Joi.string().optional(),
  filename: Joi.string().required(),
  size: Joi.number().required(),
  uploaded_at: Joi.date().optional(),
  version: Joi.number().optional(),
  url: Joi.string().optional(),
  public_id: Joi.string().optional(),
  duration: Joi.number().optional()
});

export const addRatingSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required()
    .messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5',
      'any.required': 'Rating is required'
    }),
  
  feedback: Joi.string().trim().min(10).max(500).optional()
});
