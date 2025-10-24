/**
 * ---------------------------
 * NOTIFICATION SERVICE
 * ---------------------------
 * Business logic for notifications
 */

import * as notificationRepo from '../repositories/notification.repository.js';
import AppError from '../utils/AppError.js';

export const getUserNotificationsService = async (userId, filters = {}) => {
  return await notificationRepo.findUserNotifications(userId, filters);
};

export const getUnreadNotificationsService = async (userId) => {
  return await notificationRepo.findUnreadNotifications(userId);
};

export const getNotificationsByTypeService = async (userId, type) => {
  return await notificationRepo.findNotificationsByType(userId, type);
};

export const markNotificationAsReadService = async (notificationId, userId) => {
  const notification = await notificationRepo.findNotificationById(notificationId);
  
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.user_id.toString() !== userId) {
    throw new AppError('Not authorized', 403);
  }

  return await notificationRepo.markNotificationAsRead(notificationId);
};

export const markMultipleAsReadService = async (notificationIds, userId) => {
  // Verify all notifications belong to user
  const notifications = await Promise.all(
    notificationIds.map(id => notificationRepo.findNotificationById(id))
  );

  const unauthorized = notifications.some(
    notif => notif && notif.user_id.toString() !== userId
  );

  if (unauthorized) {
    throw new AppError('Not authorized to mark some notifications', 403);
  }

  return await notificationRepo.markMultipleAsRead(notificationIds);
};

export const markAllAsReadService = async (userId) => {
  return await notificationRepo.markAllAsRead(userId);
};

export const getUnreadCountService = async (userId) => {
  return await notificationRepo.getUnreadCount(userId);
};

export const deleteNotificationService = async (notificationId, userId) => {
  const notification = await notificationRepo.findNotificationById(notificationId);
  
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.user_id.toString() !== userId) {
    throw new AppError('Not authorized', 403);
  }

  return await notificationRepo.deleteNotification(notificationId);
};

export const cleanupOldNotificationsService = async (daysOld = 30) => {
  return await notificationRepo.deleteOldNotifications(daysOld);
};

export const createBulkNotificationsService = async (userIds, notificationData) => {
  const notifications = userIds.map(userId => ({
    user_id: userId,
    ...notificationData
  }));

  return await notificationRepo.createBulkNotifications(notifications);
};
