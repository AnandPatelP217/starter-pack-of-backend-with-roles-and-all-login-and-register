/**
 * ---------------------------
 * MESSAGE CONTROLLER
 * ---------------------------
 * HTTP request handlers for messages
 */

import * as messageService from '../services/message.service.js';
import { sendResponse } from '../utils/sendResponse.js';

// Send message
export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.userId;
    const message = await messageService.sendMessageService(senderId, req.body);
    
    sendResponse(res, 201, true, 'Message sent successfully', message);
  } catch (error) {
    next(error);
  }
};

// Get project messages
export const getProjectMessages = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.user;
    
    const messages = await messageService.getProjectMessagesService(projectId, userId, role);
    
    sendResponse(res, 200, true, 'Messages retrieved successfully', messages);
  } catch (error) {
    next(error);
  }
};

// Get user messages
export const getUserMessages = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { is_read, message_type } = req.query;
    
    const filters = {};
    if (is_read !== undefined) filters.is_read = is_read === 'true';
    if (message_type) filters.message_type = message_type;
    
    const messages = await messageService.getUserMessagesService(userId, filters);
    
    sendResponse(res, 200, true, 'Messages retrieved successfully', messages);
  } catch (error) {
    next(error);
  }
};

// Get unread messages
export const getUnreadMessages = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const messages = await messageService.getUnreadMessagesService(userId);
    
    sendResponse(res, 200, true, 'Unread messages retrieved successfully', messages);
  } catch (error) {
    next(error);
  }
};

// Get unread count
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const count = await messageService.getUnreadCountService(userId);
    
    sendResponse(res, 200, true, 'Unread count retrieved successfully', { count });
  } catch (error) {
    next(error);
  }
};

// Mark message as read
export const markAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;
    
    const message = await messageService.markMessageAsReadService(messageId, userId);
    
    sendResponse(res, 200, true, 'Message marked as read', message);
  } catch (error) {
    next(error);
  }
};

// Mark project messages as read
export const markProjectMessagesAsRead = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    
    await messageService.markProjectMessagesAsReadService(projectId, userId);
    
    sendResponse(res, 200, true, 'Project messages marked as read');
  } catch (error) {
    next(error);
  }
};
