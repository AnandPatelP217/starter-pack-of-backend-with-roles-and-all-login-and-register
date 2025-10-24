/**
 * ---------------------------
 * NOTIFICATION REPOSITORY
 * ---------------------------
 * Data access layer for notifications
 */

import Notification from '../models/notification.model.js';

export const createNotification = async (notificationData) => {
  return await Notification.create(notificationData);
};

export const createBulkNotifications = async (notificationsArray) => {
  return await Notification.insertMany(notificationsArray);
};

export const findNotificationById = async (notificationId) => {
  return await Notification.findById(notificationId)
    .populate('project_id', 'title status')
    .populate('related_user_id', 'name email avatar');
};

export const findUserNotifications = async (userId, filters = {}) => {
  const query = { user_id: userId, ...filters };
  return await Notification.find(query)
    .populate('project_id', 'title status')
    .populate('related_user_id', 'name email avatar')
    .sort({ createdAt: -1 });
};

export const findUnreadNotifications = async (userId) => {
  return await Notification.find({
    user_id: userId,
    is_read: false
  })
    .populate('project_id', 'title status')
    .populate('related_user_id', 'name email avatar')
    .sort({ createdAt: -1 });
};

export const findNotificationsByType = async (userId, type) => {
  return await Notification.find({
    user_id: userId,
    type
  })
    .populate('project_id', 'title status')
    .populate('related_user_id', 'name email avatar')
    .sort({ createdAt: -1 });
};

export const markNotificationAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    {
      $set: {
        is_read: true,
        read_at: new Date()
      }
    },
    { new: true }
  );
};

export const markMultipleAsRead = async (notificationIds) => {
  return await Notification.updateMany(
    { _id: { $in: notificationIds } },
    {
      $set: {
        is_read: true,
        read_at: new Date()
      }
    }
  );
};

export const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { user_id: userId, is_read: false },
    {
      $set: {
        is_read: true,
        read_at: new Date()
      }
    }
  );
};

export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    user_id: userId,
    is_read: false
  });
};

export const getUnreadCountByType = async (userId, type) => {
  return await Notification.countDocuments({
    user_id: userId,
    type,
    is_read: false
  });
};

export const deleteNotification = async (notificationId) => {
  return await Notification.findByIdAndDelete(notificationId);
};

export const deleteUserNotifications = async (userId) => {
  return await Notification.deleteMany({ user_id: userId });
};

export const deleteOldNotifications = async (daysOld = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await Notification.deleteMany({
    createdAt: { $lt: cutoffDate },
    is_read: true
  });
};
