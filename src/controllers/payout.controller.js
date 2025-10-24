/**
 * ---------------------------
 * PAYOUT CONTROLLER
 * ---------------------------
 * HTTP request handlers for editor payouts
 */

import * as payoutService from '../services/payout.service.js';
import { sendResponse } from '../utils/sendResponse.js';

// Create payout (Admin only)
export const createPayout = async (req, res, next) => {
  try {
    const { editor_id, project_ids, payment_method } = req.body;
    const adminId = req.user.userId;
    
    const payout = await payoutService.createPayoutService(
      editor_id,
      project_ids,
      payment_method,
      adminId
    );
    
    sendResponse(res, 201, true, 'Payout created successfully', payout);
  } catch (error) {
    next(error);
  }
};

// Get payout by ID
export const getPayout = async (req, res, next) => {
  try {
    const { payoutId } = req.params;
    const { userId, role } = req.user;
    
    const payout = await payoutService.getPayoutService(payoutId, userId, role);
    
    sendResponse(res, 200, true, 'Payout retrieved successfully', payout);
  } catch (error) {
    next(error);
  }
};

// Get editor's payouts
export const getEditorPayouts = async (req, res, next) => {
  try {
    const editorId = req.user.userId;
    const { status } = req.query;
    
    const filters = status ? { status } : {};
    const payouts = await payoutService.getEditorPayoutsService(editorId, filters);
    
    sendResponse(res, 200, true, 'Payouts retrieved successfully', payouts);
  } catch (error) {
    next(error);
  }
};

// Get all payouts (Admin only)
export const getAllPayouts = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    
    const filters = status ? { status } : {};
    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    };
    
    const result = await payoutService.getAllPayoutsService(filters, pagination);
    
    sendResponse(res, 200, true, 'Payouts retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

// Update payout status (Admin only)
export const updatePayoutStatus = async (req, res, next) => {
  try {
    const { payoutId } = req.params;
    const { status, ...additionalData } = req.body;
    const adminId = req.user.userId;
    
    const payout = await payoutService.updatePayoutStatusService(
      payoutId,
      status,
      adminId,
      additionalData
    );
    
    sendResponse(res, 200, true, 'Payout status updated successfully', payout);
  } catch (error) {
    next(error);
  }
};

// Get pending payouts (Admin only)
export const getPendingPayouts = async (req, res, next) => {
  try {
    const payouts = await payoutService.getPendingPayoutsService();
    
    sendResponse(res, 200, true, 'Pending payouts retrieved successfully', payouts);
  } catch (error) {
    next(error);
  }
};

// Get payout statistics (Admin only)
export const getPayoutStats = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};
    
    const stats = await payoutService.getPayoutStatsService(filters);
    
    sendResponse(res, 200, true, 'Payout statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

// Get editor earnings
export const getEditorEarnings = async (req, res, next) => {
  try {
    const editorId = req.user.userId;
    const { start_date, end_date } = req.query;
    
    const startDate = start_date ? new Date(start_date) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = end_date ? new Date(end_date) : new Date();
    
    const earnings = await payoutService.getEditorEarningsService(editorId, startDate, endDate);
    
    sendResponse(res, 200, true, 'Earnings retrieved successfully', earnings);
  } catch (error) {
    next(error);
  }
};

// Get editor pending earnings
export const getEditorPendingEarnings = async (req, res, next) => {
  try {
    const editorId = req.user.userId;
    
    const pendingEarnings = await payoutService.getEditorPendingEarningsService(editorId);
    
    sendResponse(res, 200, true, 'Pending earnings retrieved successfully', pendingEarnings);
  } catch (error) {
    next(error);
  }
};
