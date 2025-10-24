/**
 * ---------------------------
 * MESSAGE SERVICE
 * ---------------------------
 * Business logic for messaging
 */

import * as messageRepo from '../repositories/message.repository.js';
import * as projectRepo from '../repositories/project.repository.js';
import * as notificationRepo from '../repositories/notification.repository.js';
import AppError from '../utils/AppError.js';

export const sendMessageService = async (senderId, messageData) => {
  const { project_id, receiver_id, content, message_type, attachment } = messageData;

  // Validate project
  const project = await projectRepo.findProjectById(project_id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Authorization check - only user and editor can message
  const isUser = project.user_id._id.toString() === senderId;
  const isEditor = project.editor_id?._id.toString() === senderId;

  if (!isUser && !isEditor) {
    throw new AppError('Not authorized to send messages in this project', 403);
  }

  // Validate receiver
  const validReceivers = [project.user_id._id.toString()];
  if (project.editor_id) {
    validReceivers.push(project.editor_id._id.toString());
  }

  if (!validReceivers.includes(receiver_id)) {
    throw new AppError('Invalid receiver for this project', 400);
  }

  // Create message
  const message = await messageRepo.createMessage({
    project_id,
    sender_id: senderId,
    receiver_id,
    content,
    message_type: message_type || 'text',
    attachment
  });

  // Create notification for receiver
  await notificationRepo.createNotification({
    user_id: receiver_id,
    type: 'new_message',
    title: 'New Message',
    message: `You have a new message regarding project: ${project.title}`,
    project_id,
    related_user_id: senderId,
    action_url: `/messages/${project_id}`,
    action_text: 'View Message',
    priority: 'medium'
  });

  return message;
};

export const getProjectMessagesService = async (projectId, userId, userRole) => {
  const project = await projectRepo.findProjectById(projectId);
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Authorization check
  const isUser = project.user_id._id.toString() === userId;
  const isEditor = project.editor_id?._id.toString() === userId;
  const isAdmin = userRole === 'admin';

  if (!isUser && !isEditor && !isAdmin) {
    throw new AppError('Not authorized to view messages', 403);
  }

  const messages = await messageRepo.findMessagesByProject(projectId);

  // Mark messages as read for current user
  const unreadMessageIds = messages
    .filter(msg => msg.receiver_id._id.toString() === userId && !msg.is_read)
    .map(msg => msg._id);

  if (unreadMessageIds.length > 0) {
    await messageRepo.markMultipleMessagesAsRead(unreadMessageIds);
  }

  return messages;
};

export const getUserMessagesService = async (userId, filters = {}) => {
  return await messageRepo.findUserMessages(userId, filters);
};

export const getUnreadMessagesService = async (userId) => {
  return await messageRepo.findUnreadMessages(userId);
};

export const getUnreadCountService = async (userId) => {
  return await messageRepo.getUnreadCount(userId);
};

export const markMessageAsReadService = async (messageId, userId) => {
  const message = await messageRepo.findMessageById(messageId);
  
  if (!message) {
    throw new AppError('Message not found', 404);
  }

  if (message.receiver_id._id.toString() !== userId) {
    throw new AppError('Not authorized', 403);
  }

  return await messageRepo.markMessageAsRead(messageId);
};

export const markProjectMessagesAsReadService = async (projectId, userId) => {
  const project = await projectRepo.findProjectById(projectId);
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return await messageRepo.markProjectMessagesAsRead(projectId, userId);
};

export const sendSystemMessageService = async (projectId, content, systemEvent) => {
  const project = await projectRepo.findProjectById(projectId);
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Send system message to both user and editor
  const recipients = [project.user_id._id.toString()];
  if (project.editor_id) {
    recipients.push(project.editor_id._id.toString());
  }

  const messages = [];

  for (const recipient of recipients) {
    const message = await messageRepo.createMessage({
      project_id: projectId,
      sender_id: project.user_id, // System messages from user perspective
      receiver_id: recipient,
      content,
      message_type: 'system',
      is_system_message: true,
      system_event: systemEvent
    });
    messages.push(message);
  }

  return messages;
};
