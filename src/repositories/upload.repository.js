import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import { Upload } from "../models/upload.model.js";

export class UploadRepository {
  async uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
      let resourceType = "auto";
      if (file.mimetype.startsWith("video/")) resourceType = "video";
      else if (file.mimetype.startsWith("audio/")) resourceType = "video"; // audio uses 'video' resource type in Cloudinary
      else if (file.mimetype.startsWith("image/")) resourceType = "image";

      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType, folder: "uploads" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  // 🆕 Save upload record to database
  async saveUploadRecord(uploadData) {
    return await Upload.create(uploadData);
  }

  // 🆕 Get user uploads
  async getUserUploads(userId, limit = 10) {
    return await Upload.find({ uploaded_by: userId, status: "active" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  // 🆕 Get uploads shared with user (for editors)
  async getSharedUploads(userId, limit = 10) {
    return await Upload.find({
      "shared_with.user_id": userId,
      status: "active"
    })
      .populate("uploaded_by", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  // 🆕 Get uploads by project (for assigned tasks)
  async getProjectUploads(projectId, userId, userRole) {
    const query = { project_id: projectId, status: "active" };
    
    // If not admin, check if user has access
    if (userRole !== "admin") {
      query.$or = [
        { uploaded_by: userId },
        { "shared_with.user_id": userId }
      ];
    }

    return await Upload.find(query)
      .populate("uploaded_by", "name email")
      .sort({ createdAt: -1 })
      .lean();
  }

  // 🆕 Share upload with editor (called when admin assigns task)
  async shareUploadWithUser(publicId, editorId, role = "editor") {
    const upload = await Upload.findOne({ public_id: publicId });
    if (!upload) throw new Error("Upload not found");

    // Check if already shared
    const alreadyShared = upload.shared_with.some(
      share => share.user_id.toString() === editorId.toString()
    );

    if (!alreadyShared) {
      upload.shared_with.push({
        user_id: editorId,
        role: role,
        granted_at: new Date()
      });
      await upload.save();
    }

    return upload;
  }

  // 🆕 Share multiple uploads with user
  async shareMultipleUploads(publicIds, editorId, role = "editor") {
    return await Upload.updateMany(
      { 
        public_id: { $in: publicIds },
        "shared_with.user_id": { $ne: editorId }
      },
      {
        $push: {
          shared_with: {
            user_id: editorId,
            role: role,
            granted_at: new Date()
          }
        }
      }
    );
  }

  // 🆕 Check if user has access to upload
  async checkAccess(publicId, userId, userRole) {
    const upload = await Upload.findOne({ public_id: publicId });
    if (!upload) return false;

    // Admin has access to all
    if (userRole === "admin") return true;

    // Owner has access
    if (upload.uploaded_by.toString() === userId.toString()) return true;

    // Check if shared with user
    const hasAccess = upload.shared_with.some(
      share => share.user_id.toString() === userId.toString()
    );

    return hasAccess;
  }

  // 🆕 Delete upload (soft delete)
  async deleteUpload(publicId, userId) {
    const upload = await Upload.findOne({ public_id: publicId, uploaded_by: userId });
    if (!upload) throw new Error("Upload not found or unauthorized");
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: upload.resource_type });
    
    // Soft delete in database
    upload.status = "deleted";
    await upload.save();
    
    return upload;
  }
}
