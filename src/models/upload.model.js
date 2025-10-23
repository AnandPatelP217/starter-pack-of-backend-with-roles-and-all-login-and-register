import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "File URL is required"],
      trim: true,
    },
    public_id: {
      type: String,
      required: [true, "Cloudinary public_id is required"],
      unique: true,
    },
    resource_type: {
      type: String,
      enum: ["image", "video", "raw", "auto"],
      required: true,
    },
    original_filename: {
      type: String,
      trim: true,
    },
    file_size: {
      type: Number,
    },
    mime_type: {
      type: String,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader ID is required"],
    },
    // 🆕 Link files to projects/tasks
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    // 🆕 Who can access this file
    shared_with: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["editor", "admin", "viewer"],
        },
        granted_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "deleted", "processing"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

uploadSchema.index({ uploaded_by: 1, createdAt: -1 });
uploadSchema.index({ project_id: 1 });
uploadSchema.index({ "shared_with.user_id": 1 });

export const Upload = mongoose.model("Upload", uploadSchema);
