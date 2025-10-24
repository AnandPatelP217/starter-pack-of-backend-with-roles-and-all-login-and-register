/**
 * ---------------------------
 * NOTIFICATION CONTROLLER
 * ---------------------------
 * HTTP request handlers for notifications
 */

import * as notificationService from '../services/notification.service.js';
import { sendResponse } from '../utils/sendResponse.js';

// Get user notifications
export const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { type, is_read } = req.query;
    
    const filters = {};
    if (type) filters.type = type;
    if (is_read !== undefined) filters.is_read = is_read === 'true';
    
    const notifications = await notificationService.getUserNotificationsService(userId, filters);
    
    sendResponse(res, 200, true, 'Notifications retrieved successfully', notifications);
  } catch (error) {
    next(error);
  }
};

// Get unread notifications
export const getUnreadNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notifications = await notificationService.getUnreadNotificationsService(userId);
    
    sendResponse(res, 200, true, 'Unread notifications retrieved successfully', notifications);
  } catch (error) {
    next(error);
  }
};

// Get notifications by type
export const getNotificationsByType = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { type } = req.params;
    
    const notifications = await notificationService.getNotificationsByTypeService(userId, type);
    
    sendResponse(res, 200, true, 'Notifications retrieved successfully', notifications);
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;
    
    const notification = await notificationService.markNotificationAsReadService(notificationId, userId);
    
    sendResponse(res, 200, true, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

// Mark multiple as read
export const markMultipleAsRead = async (req, res, next) => {
  try {
    const { notification_ids } = req.body;
    const userId = req.user.userId;
    
    await notificationService.markMultipleAsReadService(notification_ids, userId);
    
    sendResponse(res, 200, true, 'Notifications marked as read');
  } catch (error) {
    next(error);
  }
};

// Mark all as read
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    await notificationService.markAllAsReadService(userId);
    
    sendResponse(res, 200, true, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

// Get unread count
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const count = await notificationService.getUnreadCountService(userId);
    
    sendResponse(res, 200, true, 'Unread count retrieved successfully', { count });
  } catch (error) {
    next(error);
  }
};

// Delete notification
export const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;
    
    await notificationService.deleteNotificationService(notificationId, userId);
    
    sendResponse(res, 200, true, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
};
