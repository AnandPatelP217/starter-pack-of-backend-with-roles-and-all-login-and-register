/**
 * ---------------------------
 * PACKAGE MODEL
 * ---------------------------
 * Manages editing packages (Basic, Advanced, Custom)
 */

import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  included: { type: Boolean, default: true }
});

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['basic', 'advanced', 'custom']
  },
  display_name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Pricing
  base_price: {
    type: Number,
    required: true
  },
  price_per_minute: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Features
  features: [featureSchema],
  
  // Limits
  max_video_length: {
    type: Number, // in minutes
    required: true
  },
  max_file_size: {
    type: Number, // in MB
    required: true
  },
  max_revisions: {
    type: Number,
    required: true
  },
  
  // Delivery
  estimated_delivery_days: {
    type: Number,
    required: true
  },
  priority_support: {
    type: Boolean,
    default: false
  },
  
  // Editing Options
  editing_options: {
    color_grading: { type: Boolean, default: false },
    transitions: { type: Boolean, default: false },
    sound_design: { type: Boolean, default: false },
    motion_graphics: { type: Boolean, default: false },
    subtitles: { type: Boolean, default: false },
    green_screen: { type: Boolean, default: false },
    custom_effects: { type: Boolean, default: false }
  },
  
  // Status
  is_active: {
    type: Boolean,
    default: true
  },
  is_popular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Package', packageSchema);
