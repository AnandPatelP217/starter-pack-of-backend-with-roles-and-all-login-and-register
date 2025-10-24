/**
 * ---------------------------
 * MESSAGE ROUTES
 * ---------------------------
 * API routes for messaging
 */

import express from 'express';
import * as messageController from '../controllers/message.controller.js';
import { ProtectRoute } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { sendMessageSchema } from '../validators/message.validator.js';

const router = express.Router();

// All routes require authentication
router.use(ProtectRoute);

// Send message
router.post('/', 
  validate(sendMessageSchema),
  messageController.sendMessage
);

// Get messages
router.get('/my-messages', 
  messageController.getUserMessages
);

router.get('/unread', 
  messageController.getUnreadMessages
);

router.get('/unread-count', 
  messageController.getUnreadCount
);

router.get('/project/:projectId', 
  messageController.getProjectMessages
);

// Mark as read
router.patch('/:messageId/read', 
  messageController.markAsRead
);

router.patch('/project/:projectId/read-all', 
  messageController.markProjectMessagesAsRead
);

export default router;
