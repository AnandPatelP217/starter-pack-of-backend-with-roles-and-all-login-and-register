/**
 * ---------------------------
 * PAYMENT SERVICE
 * ---------------------------
 * Business logic for payments
 */

import * as paymentRepo from '../repositories/payment.repository.js';
import * as projectRepo from '../repositories/project.repository.js';
import * as notificationRepo from '../repositories/notification.repository.js';
import AppError from '../utils/AppError.js';

export const initiatePaymentService = async (userId, projectId, paymentType, paymentGateway) => {
  const project = await projectRepo.findProjectById(projectId);
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (project.user_id._id.toString() !== userId) {
    throw new AppError('Not authorized', 403);
  }

  // Calculate payment amount
  let amount = 0;
  
  if (paymentType === 'full') {
    amount = project.total_amount - project.paid_amount;
  } else if (paymentType === 'advance') {
    amount = project.total_amount * 0.5; // 50% advance
  } else if (paymentType === 'milestone') {
    amount = project.total_amount - project.paid_amount;
  }

  if (amount <= 0) {
    throw new AppError('Payment already completed', 400);
  }

  // Create payment record
  const payment = await paymentRepo.createPayment({
    project_id: projectId,
    user_id: userId,
    amount,
    currency: project.currency,
    payment_type: paymentType,
    payment_gateway: paymentGateway,
    status: 'pending'
  });

  // TODO: Integrate with actual payment gateway (Razorpay/Stripe)
  // For now, return payment object for frontend to handle

  return payment;
};

export const verifyPaymentService = async (paymentId, gatewayData) => {
  const payment = await paymentRepo.findPaymentById(paymentId);
  
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.status !== 'pending') {
    throw new AppError('Payment already processed', 400);
  }

  // TODO: Verify signature from payment gateway
  // For now, we'll update the payment as completed

  const updatedPayment = await paymentRepo.updateGatewayDetails(paymentId, gatewayData);
  await paymentRepo.updatePaymentStatus(paymentId, 'completed');

  // Update project payment status
  const project = await projectRepo.findProjectById(payment.project_id._id || payment.project_id);
  const newPaidAmount = (project.paid_amount || 0) + payment.amount;
  const paymentStatus = newPaidAmount >= project.total_amount ? 'completed' : 'partial';
  
  await projectRepo.updatePaymentStatus(project._id, paymentStatus, newPaidAmount);

  // Create notification
  await notificationRepo.createNotification({
    user_id: payment.user_id,
    type: 'payment_received',
    title: 'Payment Successful',
    message: `Payment of ₹${payment.amount} received for project: ${payment.project_id.title}`,
    project_id: payment.project_id._id,
    priority: 'high'
  });

  return updatedPayment;
};

export const getPaymentService = async (paymentId, userId, userRole) => {
  const payment = await paymentRepo.findPaymentById(paymentId);
  
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Authorization check
  if (userRole === 'customer' && payment.user_id._id.toString() !== userId) {
    throw new AppError('Not authorized', 403);
  }

  return payment;
};

export const getUserPaymentsService = async (userId, filters = {}) => {
  return await paymentRepo.findPaymentsByUser(userId, filters);
};

export const getProjectPaymentsService = async (projectId, userId, userRole) => {
  const project = await projectRepo.findProjectById(projectId);
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Authorization check
  if (userRole === 'customer' && project.user_id._id.toString() !== userId) {
    throw new AppError('Not authorized', 403);
  }

  return await paymentRepo.findPaymentsByProject(projectId);
};

export const getAllPaymentsService = async (filters = {}, pagination = {}) => {
  return await paymentRepo.findAllPayments(filters, pagination);
};

export const processRefundService = async (paymentId, refundAmount, refundReason, adminId) => {
  const payment = await paymentRepo.findPaymentById(paymentId);
  
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.status !== 'completed') {
    throw new AppError('Can only refund completed payments', 400);
  }

  if (refundAmount > payment.amount) {
    throw new AppError('Refund amount cannot exceed payment amount', 400);
  }

  // TODO: Process actual refund through payment gateway

  const refundedPayment = await paymentRepo.processRefund(paymentId, refundAmount, refundReason);

  // Update project payment status
  const newPaidAmount = payment.project_id.paid_amount - refundAmount;
  await projectRepo.updatePaymentStatus(payment.project_id._id, 'refunded', newPaidAmount);

  // Create notification
  await notificationRepo.createNotification({
    user_id: payment.user_id,
    type: 'payment_received',
    title: 'Payment Refunded',
    message: `Refund of ₹${refundAmount} processed for project: ${payment.project_id.title}`,
    project_id: payment.project_id._id,
    priority: 'high'
  });

  return refundedPayment;
};

export const getPaymentStatsService = async (filters = {}) => {
  return await paymentRepo.getPaymentStats(filters);
};

export const getRevenueService = async (startDate, endDate) => {
  return await paymentRepo.getRevenueByPeriod(startDate, endDate);
};

export const getRevenueByGatewayService = async (startDate, endDate) => {
  return await paymentRepo.getRevenueByGateway(startDate, endDate);
};
