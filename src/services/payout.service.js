/**
 * ---------------------------
 * PAYOUT SERVICE
 * ---------------------------
 * Business logic for editor payouts
 */

import * as payoutRepo from '../repositories/payout.repository.js';
import * as projectRepo from '../repositories/project.repository.js';
import * as notificationRepo from '../repositories/notification.repository.js';
import { Editor } from '../models/user.model.js';
import Project from '../models/project.model.js';
import AppError from '../utils/AppError.js';

export const createPayoutService = async (editorId, projectIds, paymentMethod, adminId) => {
  const editor = await Editor.findById(editorId);
  
  if (!editor) {
    throw new AppError('Editor not found', 404);
  }

  if (!editor.bank_details || !editor.bank_details.account_number) {
    throw new AppError('Editor bank details not configured', 400);
  }

  // Validate projects
  const projects = await Project.find({
    _id: { $in: projectIds },
    editor_id: editorId,
    status: 'completed',
    editor_payment_status: 'pending'
  });

  if (projects.length === 0) {
    throw new AppError('No eligible projects for payout', 400);
  }

  // Calculate total amount
  const totalAmount = projects.reduce((sum, project) => sum + project.editor_fee, 0);
  
  const projectsData = projects.map(project => ({
    project_id: project._id,
    amount: project.editor_fee,
    completed_at: project.completed_at
  }));

  // Create payout
  const payout = await payoutRepo.createPayout({
    editor_id: editorId,
    projects: projectsData,
    total_amount: totalAmount,
    currency: 'INR',
    period_start: projects[projects.length - 1].completed_at,
    period_end: projects[0].completed_at,
    payment_method: paymentMethod,
    account_details: editor.bank_details,
    status: 'pending'
  });

  // Update project editor payment status
  await Project.updateMany(
    { _id: { $in: projectIds } },
    { $set: { editor_payment_status: 'processing' } }
  );

  // Create notification
  await notificationRepo.createNotification({
    user_id: editorId,
    type: 'payout_processed',
    title: 'Payout Initiated',
    message: `Payout of ₹${totalAmount} has been initiated for ${projects.length} projects`,
    priority: 'high'
  });

  return payout;
};

export const getPayoutService = async (payoutId, userId, userRole) => {
  const payout = await payoutRepo.findPayoutById(payoutId);
  
  if (!payout) {
    throw new AppError('Payout not found', 404);
  }

  // Authorization check
  if (userRole === 'editor' && payout.editor_id._id.toString() !== userId) {
    throw new AppError('Not authorized', 403);
  }

  return payout;
};

export const getEditorPayoutsService = async (editorId, filters = {}) => {
  return await payoutRepo.findPayoutsByEditor(editorId, filters);
};

export const getAllPayoutsService = async (filters = {}, pagination = {}) => {
  return await payoutRepo.findAllPayouts(filters, pagination);
};

export const updatePayoutStatusService = async (payoutId, status, adminId, additionalData = {}) => {
  const payout = await payoutRepo.findPayoutById(payoutId);
  
  if (!payout) {
    throw new AppError('Payout not found', 404);
  }

  const updatedPayout = await payoutRepo.updatePayoutStatus(payoutId, status, additionalData);

  // Update project and editor based on status
  if (status === 'completed') {
    // Mark projects as paid
    const projectIds = payout.projects.map(p => p.project_id);
    await Project.updateMany(
      { _id: { $in: projectIds } },
      { $set: { editor_payment_status: 'paid' } }
    );

    // Update editor earnings
    await Editor.findByIdAndUpdate(payout.editor_id, {
      $inc: {
        total_earnings: payout.total_amount,
        pending_earnings: -payout.total_amount
      }
    });

    // Create notification
    await notificationRepo.createNotification({
      user_id: payout.editor_id,
      type: 'payout_processed',
      title: 'Payout Completed',
      message: `Payout of ₹${payout.total_amount} has been successfully transferred`,
      priority: 'high'
    });
  } else if (status === 'failed') {
    // Revert projects to pending
    const projectIds = payout.projects.map(p => p.project_id);
    await Project.updateMany(
      { _id: { $in: projectIds } },
      { $set: { editor_payment_status: 'pending' } }
    );

    // Create notification
    await notificationRepo.createNotification({
      user_id: payout.editor_id,
      type: 'payout_processed',
      title: 'Payout Failed',
      message: `Payout of ₹${payout.total_amount} has failed. Please contact support.`,
      priority: 'urgent'
    });
  }

  return updatedPayout;
};

export const getPendingPayoutsService = async () => {
  return await payoutRepo.getPendingPayouts();
};

export const getPayoutStatsService = async (filters = {}) => {
  return await payoutRepo.getPayoutStats(filters);
};

export const getEditorEarningsService = async (editorId, startDate, endDate) => {
  return await payoutRepo.getEditorEarnings(editorId, startDate, endDate);
};

export const getEditorPendingEarningsService = async (editorId) => {
  const projects = await Project.find({
    editor_id: editorId,
    status: 'completed',
    editor_payment_status: 'pending'
  });

  const pendingAmount = projects.reduce((sum, project) => sum + project.editor_fee, 0);

  return {
    pendingProjects: projects.length,
    pendingAmount,
    projects
  };
};
