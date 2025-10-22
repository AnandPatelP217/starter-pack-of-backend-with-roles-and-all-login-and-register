import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"], // I provide custom error messages
      trim: true, // Remove whitespace from both ends
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Prevent duplicate email addresses
      lowercase: true, // Always store emails in lowercase for consistency
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ], // I use regex to validate email format
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Security: Don't return password in queries by default
    },
     role: {
      type: String,
      enum: ["admin", "editor", "customer"],
      required: true,
      default: "customer",
    },
    isBlocked: { type: Boolean, default: false },
  },
 {
    timestamps: true,
    discriminatorKey: "role",
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Index for faster email lookups - emails are used frequently for login
// userSchema.index({ email: 1 }); there us a warning showing if i use this line 

export const User = mongoose.model("User", userSchema);



// Role-specific discriminators (extend the base schema)
const adminSchema = new mongoose.Schema({
  company_name: { type: String, trim: true },
});

const editorSchema = new mongoose.Schema({
  skills: { type: [String], default: [] },
  isAvailable: { type: Boolean, default: true },
});

// Customer currently doesn't add extra fields beyond base
const customerSchema = new mongoose.Schema({
  contact: { type: String, trim: true, maxlength: 15 },
  address: { type: String, trim: true, maxlength: 100 },
  servicehistory: { type: [String], default: [] }, // Array of service record IDs or descriptions
});

export const Admin = User.discriminator("admin", adminSchema);
export const Editor = User.discriminator("editor", editorSchema);
export const Customer = User.discriminator("customer", customerSchema);
