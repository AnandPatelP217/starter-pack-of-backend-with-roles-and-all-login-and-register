/**
 * ---------------------------
 * PAYMENT MODEL
 * ---------------------------
 * Manages user payments for projects
 */

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  payment_type: {
    type: String,
    enum: ['full', 'advance', 'milestone', 'refund'],
    required: true
  },
  
  // Payment Gateway
  payment_gateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal', 'manual'],
    required: true
  },
  transaction_id: {
    type: String,
    unique: true,
    sparse: true
  },
  gateway_order_id: String,
  gateway_payment_id: String,
  gateway_signature: String,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  
  // Metadata
  payment_method: String, // card, upi, netbanking, wallet
  payment_details: mongoose.Schema.Types.Mixed,
  
  // Timestamps
  initiated_at: {
    type: Date,
    default: Date.now
  },
  completed_at: Date,
  failed_at: Date,
  refunded_at: Date,
  
  // Error Handling
  error_code: String,
  error_message: String,
  
  // Refund
  refund_amount: Number,
  refund_reason: String,
  refund_transaction_id: String
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ user_id: 1, status: 1 });
paymentSchema.index({ project_id: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
