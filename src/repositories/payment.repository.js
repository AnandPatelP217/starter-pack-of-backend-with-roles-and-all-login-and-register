/**
 * ---------------------------
 * PAYMENT REPOSITORY
 * ---------------------------
 * Data access layer for payments
 */

import Payment from '../models/payment.model.js';

export const createPayment = async (paymentData) => {
  return await Payment.create(paymentData);
};

export const findPaymentById = async (paymentId) => {
  return await Payment.findById(paymentId)
    .populate('project_id', 'title package_type total_amount')
    .populate('user_id', 'name email');
};

export const findPaymentByTransactionId = async (transactionId) => {
  return await Payment.findOne({ transaction_id: transactionId });
};

export const findPaymentsByUser = async (userId, filters = {}) => {
  const query = { user_id: userId, ...filters };
  return await Payment.find(query)
    .populate('project_id', 'title package_type status')
    .sort({ createdAt: -1 });
};

export const findPaymentsByProject = async (projectId) => {
  return await Payment.find({ project_id: projectId })
    .sort({ createdAt: -1 });
};

export const findAllPayments = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  const payments = await Payment.find(filters)
    .populate('user_id', 'name email')
    .populate('project_id', 'title package_type')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments(filters);

  return {
    payments,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

export const updatePayment = async (paymentId, updateData) => {
  return await Payment.findByIdAndUpdate(
    paymentId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

export const updatePaymentStatus = async (paymentId, status, additionalData = {}) => {
  const updateData = { status, ...additionalData };

  // Set appropriate timestamps
  if (status === 'completed' && !additionalData.completed_at) {
    updateData.completed_at = new Date();
  } else if (status === 'failed' && !additionalData.failed_at) {
    updateData.failed_at = new Date();
  } else if (status === 'refunded' && !additionalData.refunded_at) {
    updateData.refunded_at = new Date();
  }

  return await Payment.findByIdAndUpdate(
    paymentId,
    { $set: updateData },
    { new: true }
  );
};

export const updateGatewayDetails = async (paymentId, gatewayData) => {
  return await Payment.findByIdAndUpdate(
    paymentId,
    {
      $set: {
        gateway_order_id: gatewayData.orderId,
        gateway_payment_id: gatewayData.paymentId,
        gateway_signature: gatewayData.signature,
        payment_method: gatewayData.method,
        payment_details: gatewayData.details
      }
    },
    { new: true }
  );
};

export const processRefund = async (paymentId, refundAmount, refundReason) => {
  return await Payment.findByIdAndUpdate(
    paymentId,
    {
      $set: {
        status: 'refunded',
        refund_amount: refundAmount,
        refund_reason: refundReason,
        refunded_at: new Date()
      }
    },
    { new: true }
  );
};

export const getPaymentStats = async (filters = {}) => {
  const stats = await Payment.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  return stats;
};

export const getRevenueByPeriod = async (startDate, endDate) => {
  const revenue = await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        completed_at: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalTransactions: { $sum: 1 }
      }
    }
  ]);

  return revenue[0] || { totalRevenue: 0, totalTransactions: 0 };
};

export const getRevenueByGateway = async (startDate, endDate) => {
  return await Payment.aggregate([
    {
      $match: {
        status: 'completed',
        completed_at: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$payment_gateway',
        totalRevenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);
};

export const deletePayment = async (paymentId) => {
  return await Payment.findByIdAndDelete(paymentId);
};
