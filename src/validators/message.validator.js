/**
 * ---------------------------
 * MESSAGE VALIDATOR
 * ---------------------------
 * Joi validation schemas for message routes
 */

import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  project_id: Joi.string().required()
    .messages({
      'string.empty': 'Project ID is required'
    }),
  
  receiver_id: Joi.string().required()
    .messages({
      'string.empty': 'Receiver ID is required'
    }),
  
  content: Joi.string().trim().min(1).max(2000).required()
    .messages({
      'string.empty': 'Message content is required',
      'string.max': 'Message cannot exceed 2000 characters'
    }),
  
  message_type: Joi.string().valid('text', 'file', 'system').optional(),
  
  attachment: Joi.object({
    upload_id: Joi.string().required(),
    filename: Joi.string().required(),
    file_type: Joi.string().required(),
    file_size: Joi.number().required()
  }).optional()
});
