/**
 * ---------------------------
 * PAYOUT VALIDATOR
 * ---------------------------
 * Joi validation schemas for payout routes
 */

import Joi from 'joi';

export const createPayoutSchema = Joi.object({
  editor_id: Joi.string().required()
    .messages({
      'string.empty': 'Editor ID is required'
    }),
  
  project_ids: Joi.array().items(Joi.string()).min(1).required()
    .messages({
      'array.min': 'At least one project is required',
      'any.required': 'Project IDs are required'
    }),
  
  payment_method: Joi.string().valid('bank_transfer', 'upi', 'paypal', 'stripe').required()
    .messages({
      'any.only': 'Invalid payment method',
      'string.empty': 'Payment method is required'
    })
});

export const updatePayoutStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'completed', 'failed', 'cancelled').required()
    .messages({
      'any.only': 'Invalid status',
      'string.empty': 'Status is required'
    }),
  
  transaction_id: Joi.string().when('status', {
    is: 'completed',
    then: Joi.optional(),
    otherwise: Joi.optional()
  }),
  
  reference_number: Joi.string().optional(),
  admin_notes: Joi.string().optional(),
  failure_reason: Joi.string().when('status', {
    is: 'failed',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});
