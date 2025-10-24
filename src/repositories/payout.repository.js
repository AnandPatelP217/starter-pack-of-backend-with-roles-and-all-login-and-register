/**
 * ---------------------------
 * PAYOUT REPOSITORY
 * ---------------------------
 * Data access layer for editor payouts
 */

import Payout from '../models/payout.model.js';

export const createPayout = async (payoutData) => {
  return await Payout.create(payoutData);
};

export const findPayoutById = async (payoutId) => {
  return await Payout.findById(payoutId)
    .populate('editor_id', 'name email bank_details')
    .populate('projects.project_id', 'title status completed_at');
};

export const findPayoutsByEditor = async (editorId, filters = {}) => {
  const query = { editor_id: editorId, ...filters };
  return await Payout.find(query).sort({ createdAt: -1 });
};

export const findAllPayouts = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  const payouts = await Payout.find(filters)
    .populate('editor_id', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Payout.countDocuments(filters);

  return {
    payouts,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

export const updatePayout = async (payoutId, updateData) => {
  return await Payout.findByIdAndUpdate(
    payoutId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

export const updatePayoutStatus = async (payoutId, status, additionalData = {}) => {
  const updateData = { status, ...additionalData };

  // Set appropriate timestamps
  if (status === 'processing' && !additionalData.initiated_at) {
    updateData.initiated_at = new Date();
  } else if (status === 'processing' && !additionalData.processed_at) {
    updateData.processed_at = new Date();
  } else if (status === 'completed' && !additionalData.completed_at) {
    updateData.completed_at = new Date();
  }

  return await Payout.findByIdAndUpdate(
    payoutId,
    { $set: updateData },
    { new: true }
  );
};

export const getPendingPayouts = async () => {
  return await Payout.find({ status: 'pending' })
    .populate('editor_id', 'name email bank_details')
    .sort({ createdAt: 1 });
};

export const getPayoutStats = async (filters = {}) => {
  const stats = await Payout.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total_amount' }
      }
    }
  ]);

  return stats;
};

export const getEditorEarnings = async (editorId, startDate, endDate) => {
  const earnings = await Payout.aggregate([
    {
      $match: {
        editor_id: editorId,
        status: 'completed',
        completed_at: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$total_amount' },
        totalPayouts: { $sum: 1 }
      }
    }
  ]);

  return earnings[0] || { totalEarnings: 0, totalPayouts: 0 };
};

export const deletePayout = async (payoutId) => {
  return await Payout.findByIdAndDelete(payoutId);
};
