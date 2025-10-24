/**
 * ---------------------------
 * PROJECT MODEL
 * ---------------------------
 * Manages video editing projects/orders
 */

import mongoose from 'mongoose';

const revisionSchema = new mongoose.Schema({
  revision_number: { type: Number, required: true },
  feedback: { type: String, required: true },
  requested_at: { type: Date, default: Date.now },
  resolved_at: { type: Date }
});

const projectSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  editor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  assigned_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Project Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  package_type: {
    type: String,
    enum: ['basic', 'advanced', 'custom'],
    required: true
  },
  
  // Instructions
  editing_instructions: {
    type: String,
    required: true
  },
  special_requirements: {
    type: [String],
    default: []
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['pending_assignment', 'assigned', 'in_progress', 'ready_for_review', 'revision_requested', 'completed', 'cancelled'],
    default: 'pending_assignment',
    index: true
  },
  
  // File Management
  raw_footage: [{
    upload_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upload'
    },
    filename: String,
    size: Number,
    uploaded_at: Date
  }],
  
  edited_video: {
    upload_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upload'
    },
    filename: String,
    size: Number,
    uploaded_at: Date,
    version: { type: Number, default: 1 }
  },
  
  // Revision Management
  revisions: [revisionSchema],
  max_revisions: {
    type: Number,
    default: function() {
      return this.package_type === 'basic' ? 1 : this.package_type === 'advanced' ? 2 : 3;
    }
  },
  revisions_used: {
    type: Number,
    default: 0
  },
  
  // Timeline
  deadline: {
    type: Date,
    required: true
  },
  estimated_delivery: Date,
  actual_delivery: Date,
  
  // Payment
  payment_status: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'refunded'],
    default: 'pending'
  },
  total_amount: {
    type: Number,
    required: true
  },
  paid_amount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Editor Compensation
  editor_fee: {
    type: Number,
    default: 0
  },
  editor_payment_status: {
    type: String,
    enum: ['pending', 'processing', 'paid'],
    default: 'pending'
  },
  
  // Rating & Feedback
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
  
  // Timestamps
  assigned_at: Date,
  started_at: Date,
  completed_at: Date,
  cancelled_at: Date,
  cancellation_reason: String
}, {
  timestamps: true
});

// Indexes
projectSchema.index({ user_id: 1, status: 1 });
projectSchema.index({ editor_id: 1, status: 1 });
projectSchema.index({ createdAt: -1 });

// Virtual for remaining revisions
projectSchema.virtual('remaining_revisions').get(function() {
  return this.max_revisions - this.revisions_used;
});

// Methods
projectSchema.methods.canRequestRevision = function() {
  return this.revisions_used < this.max_revisions && this.status === 'ready_for_review';
};

projectSchema.methods.requestRevision = function(feedback) {
  if (!this.canRequestRevision()) {
    throw new Error('Maximum revisions reached or invalid status');
  }
  
  this.revisions.push({
    revision_number: this.revisions_used + 1,
    feedback
  });
  this.revisions_used += 1;
  this.status = 'revision_requested';
  return this.save();
};

export default mongoose.model('Project', projectSchema);
