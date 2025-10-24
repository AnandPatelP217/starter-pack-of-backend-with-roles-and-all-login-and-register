/**
 * ---------------------------
 * NOTIFICATION ROUTES
 * ---------------------------
 * API routes for notifications
 */

import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { ProtectRoute } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { markMultipleAsReadSchema } from '../validators/notification.validator.js';

const router = express.Router();

// All routes require authentication
router.use(ProtectRoute);

// Get notifications
router.get('/', 
  notificationController.getUserNotifications
);

router.get('/unread', 
  notificationController.getUnreadNotifications
);

router.get('/unread-count', 
  notificationController.getUnreadCount
);

router.get('/type/:type', 
  notificationController.getNotificationsByType
);

// Mark as read
router.patch('/:notificationId/read', 
  notificationController.markAsRead
);

router.patch('/read-multiple', 
  validate(markMultipleAsReadSchema),
  notificationController.markMultipleAsRead
);

router.patch('/read-all', 
  notificationController.markAllAsRead
);

// Delete notification
router.delete('/:notificationId', 
  notificationController.deleteNotification
);

export default router;
