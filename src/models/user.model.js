import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: function() {
        return !this.google_id; // Password not required for OAuth users
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    
    // OAuth Support
    google_id: {
      type: String,
      unique: true,
      sparse: true
    },
    avatar: {
      type: String,
      default: null
    },
    
    // Account Status
    is_verified: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_suspended: {
      type: Boolean,
      default: false
    },
    suspension_reason: String,
    
    // Contact
    phone: {
      type: String,
      trim: true,
      maxlength: 15
    },
    
    role: {
      type: String,
      enum: ["admin", "editor", "customer"],
      required: true,
      default: "customer",
    },
    
    // Legacy field - kept for backward compatibility
    isBlocked: { type: Boolean, default: false },
    
    // Last Activity
    last_login: {
      type: Date,
    },
    
    // Verification & Password Reset
    verification_token: String,
    verification_token_expires: Date,
    password_reset_token: String,
    password_reset_expires: Date,
  },
  {
    timestamps: true,
    discriminatorKey: "role",
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        delete ret.verification_token;
        delete ret.password_reset_token;
        return ret;
      },
    },
    toObject: {
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        delete ret.verification_token;
        delete ret.password_reset_token;
        return ret;
      },
    },
  },
);

// Index for faster email lookups - emails are used frequently for login
// userSchema.index({ email: 1 }); there us a warning showing if i use this line 

export const User = mongoose.model("User", userSchema);



// Role-specific discriminators (extend the base schema)

// ADMIN SCHEMA
const adminSchema = new mongoose.Schema({
  company_name: { type: String, trim: true },
  department: {
    type: String,
    enum: ['operations', 'finance', 'support', 'super_admin'],
    default: 'operations'
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_editors',
      'manage_projects',
      'manage_payments',
      'view_analytics',
      'manage_packages',
      'content_moderation',
      'system_settings'
    ]
  }]
});

// EDITOR SCHEMA
const editorSchema = new mongoose.Schema({
  // Professional Info
  bio: {
    type: String,
    maxlength: 1000
  },
  skills: {
    type: [String],
    enum: [
      'color_grading',
      'motion_graphics',
      'sound_design',
      'video_effects',
      'animation',
      'green_screen',
      '3d_modeling',
      'subtitle_creation'
    ],
    default: []
  },
  software_expertise: [{
    type: String,
    enum: [
      'Adobe Premiere Pro',
      'Final Cut Pro',
      'DaVinci Resolve',
      'After Effects',
      'Avid Media Composer',
      'Blender'
    ]
  }],
  
  // Experience
  years_of_experience: {
    type: Number,
    min: 0,
    default: 0
  },
  specialization: {
    type: String,
    enum: ['wedding', 'corporate', 'youtube', 'music_video', 'documentary', 'commercial', 'social_media', 'general'],
    default: 'general'
  },
  
  // Portfolio
  portfolio_url: String,
  sample_videos: [{
    title: String,
    url: String,
    thumbnail: String,
    description: String
  }],
  
  // Pricing
  hourly_rate: {
    type: Number,
    min: 0,
    default: 0
  },
  minimum_project_fee: {
    type: Number,
    default: 0
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true,
  },
  max_concurrent_projects: {
    type: Number,
    default: 3
  },
  current_workload: {
    type: Number,
    default: 0
  },
  
  // Statistics
  total_projects_completed: {
    type: Number,
    default: 0
  },
  total_earnings: {
    type: Number,
    default: 0
  },
  pending_earnings: {
    type: Number,
    default: 0
  },
  average_rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  total_reviews: {
    type: Number,
    default: 0
  },
  
  // Performance Metrics
  on_time_delivery_rate: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  acceptance_rate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Bank Details for Payouts
  bank_details: {
    account_number: String,
    ifsc_code: String,
    account_holder_name: String,
    bank_name: String,
    upi_id: String,
    paypal_email: String
  },
  
  // Application Status
  application_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  application_date: {
    type: Date,
    default: Date.now
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approved_at: Date,
  rejection_reason: String
});

// CUSTOMER SCHEMA
const customerSchema = new mongoose.Schema({
  // Legacy fields - kept for backward compatibility
  contact: { type: String, trim: true, maxlength: 15 },
  address: { type: String, trim: true, maxlength: 200 },
  servicehistory: { type: [String], default: [] },
  
  // Enhanced Address
  full_address: {
    street: String,
    city: String,
    state: String,
    country: String,
    pincode: String
  },
  
  // Preferences
  preferred_genres: [String],
  preferred_editing_style: String,
  
  // Statistics
  total_projects: {
    type: Number,
    default: 0
  },
  completed_projects: {
    type: Number,
    default: 0
  },
  total_spent: {
    type: Number,
    default: 0
  },
  
  // Service History
  service_history: [{
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    completed_at: Date,
    rating: Number,
    feedback: String
  }]
});

export const Admin = User.discriminator("admin", adminSchema);
export const Editor = User.discriminator("editor", editorSchema);
export const Customer = User.discriminator("customer", customerSchema);
