/**
 * ---------------------------
 * MESSAGE MODEL
 * ---------------------------
 * Manages communication between users and editors
 */

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Message Content
  message_type: {
    type: String,
    enum: ['text', 'file', 'system'],
    default: 'text'
  },
  content: {
    type: String,
    required: true
  },
  
  // File Attachment
  attachment: {
    upload_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upload'
    },
    filename: String,
    file_type: String,
    file_size: Number
  },
  
  // Status
  is_read: {
    type: Boolean,
    default: false
  },
  read_at: Date,
  
  // System Messages
  is_system_message: {
    type: Boolean,
    default: false
  },
  system_event: String // 'project_assigned', 'status_changed', etc.
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ project_id: 1, createdAt: -1 });
messageSchema.index({ sender_id: 1, receiver_id: 1 });
messageSchema.index({ receiver_id: 1, is_read: 1 });

export default mongoose.model('Message', messageSchema);
