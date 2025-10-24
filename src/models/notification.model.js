/**
 * ---------------------------
 * NOTIFICATION MODEL
 * ---------------------------
 * Manages user notifications
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Notification Type
  type: {
    type: String,
    enum: [
      'project_assigned',
      'project_completed',
      'revision_requested',
      'payment_received',
      'payout_processed',
      'new_message',
      'deadline_reminder',
      'editor_application',
      'system_alert'
    ],
    required: true
  },
  
  // Content
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  
  // Related Resources
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  related_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Action Link
  action_url: String,
  action_text: String,
  
  // Status
  is_read: {
    type: Boolean,
    default: false
  },
  read_at: Date,
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ user_id: 1, is_read: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

export default mongoose.model('Notification', notificationSchema);
