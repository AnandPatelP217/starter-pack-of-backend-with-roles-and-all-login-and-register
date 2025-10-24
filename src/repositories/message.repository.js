/**
 * ---------------------------
 * MESSAGE REPOSITORY
 * ---------------------------
 * Data access layer for messages
 */

import Message from '../models/message.model.js';

export const createMessage = async (messageData) => {
  return await Message.create(messageData);
};

export const findMessageById = async (messageId) => {
  return await Message.findById(messageId)
    .populate('sender_id', 'name email avatar')
    .populate('receiver_id', 'name email avatar')
    .populate('project_id', 'title status');
};

export const findMessagesByProject = async (projectId) => {
  return await Message.find({ project_id: projectId })
    .populate('sender_id', 'name email avatar')
    .populate('receiver_id', 'name email avatar')
    .sort({ createdAt: 1 });
};

export const findConversation = async (userId1, userId2, projectId) => {
  return await Message.find({
    project_id: projectId,
    $or: [
      { sender_id: userId1, receiver_id: userId2 },
      { sender_id: userId2, receiver_id: userId1 }
    ]
  })
    .populate('sender_id', 'name email avatar')
    .populate('receiver_id', 'name email avatar')
    .sort({ createdAt: 1 });
};

export const findUserMessages = async (userId, filters = {}) => {
  const query = {
    $or: [{ sender_id: userId }, { receiver_id: userId }],
    ...filters
  };
  
  return await Message.find(query)
    .populate('sender_id', 'name email avatar')
    .populate('receiver_id', 'name email avatar')
    .populate('project_id', 'title status')
    .sort({ createdAt: -1 });
};

export const findUnreadMessages = async (userId) => {
  return await Message.find({
    receiver_id: userId,
    is_read: false
  })
    .populate('sender_id', 'name email avatar')
    .populate('project_id', 'title')
    .sort({ createdAt: -1 });
};

export const markMessageAsRead = async (messageId) => {
  return await Message.findByIdAndUpdate(
    messageId,
    {
      $set: {
        is_read: true,
        read_at: new Date()
      }
    },
    { new: true }
  );
};

export const markMultipleMessagesAsRead = async (messageIds) => {
  return await Message.updateMany(
    { _id: { $in: messageIds } },
    {
      $set: {
        is_read: true,
        read_at: new Date()
      }
    }
  );
};

export const markProjectMessagesAsRead = async (projectId, userId) => {
  return await Message.updateMany(
    {
      project_id: projectId,
      receiver_id: userId,
      is_read: false
    },
    {
      $set: {
        is_read: true,
        read_at: new Date()
      }
    }
  );
};

export const getUnreadCount = async (userId) => {
  return await Message.countDocuments({
    receiver_id: userId,
    is_read: false
  });
};

export const getUnreadCountByProject = async (userId, projectId) => {
  return await Message.countDocuments({
    project_id: projectId,
    receiver_id: userId,
    is_read: false
  });
};

export const deleteMessage = async (messageId) => {
  return await Message.findByIdAndDelete(messageId);
};

export const deleteProjectMessages = async (projectId) => {
  return await Message.deleteMany({ project_id: projectId });
};
