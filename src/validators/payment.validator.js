/**
 * ---------------------------
 * PAYMENT VALIDATOR
 * ---------------------------
 * Joi validation schemas for payment routes
 */

import Joi from 'joi';

export const initiatePaymentSchema = Joi.object({
  project_id: Joi.string().required()
    .messages({
      'string.empty': 'Project ID is required'
    }),
  
  payment_type: Joi.string().valid('full', 'advance', 'milestone', 'refund').required()
    .messages({
      'any.only': 'Payment type must be full, advance, milestone, or refund',
      'string.empty': 'Payment type is required'
    }),
  
  payment_gateway: Joi.string().valid('razorpay', 'stripe', 'paypal', 'manual').required()
    .messages({
      'any.only': 'Invalid payment gateway',
      'string.empty': 'Payment gateway is required'
    })
});

export const verifyPaymentSchema = Joi.object({
  orderId: Joi.string().optional(),
  paymentId: Joi.string().optional(),
  signature: Joi.string().optional(),
  method: Joi.string().optional(),
  details: Joi.object().optional()
});

export const processRefundSchema = Joi.object({
  refund_amount: Joi.number().min(1).required()
    .messages({
      'number.min': 'Refund amount must be greater than 0',
      'any.required': 'Refund amount is required'
    }),
  
  refund_reason: Joi.string().trim().min(10).max(500).required()
    .messages({
      'string.empty': 'Refund reason is required',
      'string.min': 'Refund reason must be at least 10 characters'
    })
});
