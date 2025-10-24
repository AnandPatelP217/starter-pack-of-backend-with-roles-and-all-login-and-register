/**
 * ---------------------------
 * PAYMENT CONTROLLER
 * ---------------------------
 * HTTP request handlers for payments
 */

import * as paymentService from '../services/payment.service.js';
import { sendResponse } from '../utils/sendResponse.js';

// Initiate payment
export const initiatePayment = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { project_id, payment_type, payment_gateway } = req.body;
    
    const payment = await paymentService.initiatePaymentService(
      userId,
      project_id,
      payment_type,
      payment_gateway
    );
    
    sendResponse(res, 201, true, 'Payment initiated successfully', payment);
  } catch (error) {
    next(error);
  }
};

// Verify payment
export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const gatewayData = req.body;
    
    const payment = await paymentService.verifyPaymentService(paymentId, gatewayData);
    
    sendResponse(res, 200, true, 'Payment verified successfully', payment);
  } catch (error) {
    next(error);
  }
};

// Get payment by ID
export const getPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { userId, role } = req.user;
    
    const payment = await paymentService.getPaymentService(paymentId, userId, role);
    
    sendResponse(res, 200, true, 'Payment retrieved successfully', payment);
  } catch (error) {
    next(error);
  }
};

// Get user's payments
export const getUserPayments = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;
    
    const filters = status ? { status } : {};
    const payments = await paymentService.getUserPaymentsService(userId, filters);
    
    sendResponse(res, 200, true, 'Payments retrieved successfully', payments);
  } catch (error) {
    next(error);
  }
};

// Get project payments
export const getProjectPayments = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.user;
    
    const payments = await paymentService.getProjectPaymentsService(projectId, userId, role);
    
    sendResponse(res, 200, true, 'Project payments retrieved successfully', payments);
  } catch (error) {
    next(error);
  }
};

// Get all payments (Admin only)
export const getAllPayments = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    
    const filters = status ? { status } : {};
    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    };
    
    const result = await paymentService.getAllPaymentsService(filters, pagination);
    
    sendResponse(res, 200, true, 'Payments retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

// Process refund (Admin only)
export const processRefund = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { refund_amount, refund_reason } = req.body;
    const adminId = req.user.userId;
    
    const payment = await paymentService.processRefundService(
      paymentId,
      refund_amount,
      refund_reason,
      adminId
    );
    
    sendResponse(res, 200, true, 'Refund processed successfully', payment);
  } catch (error) {
    next(error);
  }
};

// Get payment statistics (Admin only)
export const getPaymentStats = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};
    
    const stats = await paymentService.getPaymentStatsService(filters);
    
    sendResponse(res, 200, true, 'Payment statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

// Get revenue (Admin only)
export const getRevenue = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    const startDate = start_date ? new Date(start_date) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = end_date ? new Date(end_date) : new Date();
    
    const revenue = await paymentService.getRevenueService(startDate, endDate);
    
    sendResponse(res, 200, true, 'Revenue retrieved successfully', revenue);
  } catch (error) {
    next(error);
  }
};

// Get revenue by gateway (Admin only)
export const getRevenueByGateway = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    const startDate = start_date ? new Date(start_date) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = end_date ? new Date(end_date) : new Date();
    
    const revenue = await paymentService.getRevenueByGatewayService(startDate, endDate);
    
    sendResponse(res, 200, true, 'Revenue by gateway retrieved successfully', revenue);
  } catch (error) {
    next(error);
  }
};
