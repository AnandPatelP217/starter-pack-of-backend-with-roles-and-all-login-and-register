/**
 * ---------------------------
 * NOTIFICATION VALIDATOR
 * ---------------------------
 * Joi validation schemas for notification routes
 */

import Joi from 'joi';

export const markMultipleAsReadSchema = Joi.object({
  notification_ids: Joi.array().items(Joi.string()).min(1).required()
    .messages({
      'array.min': 'At least one notification ID is required',
      'any.required': 'Notification IDs are required'
    })
});
