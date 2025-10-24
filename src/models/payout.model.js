/**
 * ---------------------------
 * PAYOUT MODEL
 * ---------------------------
 * Manages editor payouts
 */

import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  editor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Projects included in this payout
  projects: [{
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    amount: Number,
    completed_at: Date
  }],
  
  // Payout Details
  total_amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Period
  period_start: {
    type: Date,
    required: true
  },
  period_end: {
    type: Date,
    required: true
  },
  
  // Payment Method
  payment_method: {
    type: String,
    enum: ['bank_transfer', 'upi', 'paypal', 'stripe'],
    required: true
  },
  
  // Bank Details
  account_details: {
    account_number: String,
    ifsc_code: String,
    account_holder_name: String,
    upi_id: String,
    paypal_email: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Transaction
  transaction_id: String,
  reference_number: String,
  
  // Timestamps
  initiated_at: Date,
  processed_at: Date,
  completed_at: Date,
  
  // Notes
  admin_notes: String,
  failure_reason: String
}, {
  timestamps: true
});

// Indexes
payoutSchema.index({ editor_id: 1, status: 1 });
payoutSchema.index({ createdAt: -1 });

export default mongoose.model('Payout', payoutSchema);
