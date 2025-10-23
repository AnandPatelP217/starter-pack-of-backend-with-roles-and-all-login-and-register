import { UploadRepository } from "../repositories/upload.repository.js";

export class UploadService {
  constructor() {
    this.uploadRepository = new UploadRepository();
  }

  async handleFileUpload(file, userId, projectId = null) {
    if (!file) throw new Error("No file provided");
    if (!userId) throw new Error("User ID is required");

    // Upload to Cloudinary
    const cloudinaryResult = await this.uploadRepository.uploadToCloudinary(file);

    // Save to database
    const uploadRecord = await this.uploadRepository.saveUploadRecord({
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
      resource_type: cloudinaryResult.resource_type,
      original_filename: file.originalname,
      file_size: file.size,
      mime_type: file.mimetype,
      uploaded_by: userId,
      project_id: projectId, // 🆕 Link to project if provided
    });

    return {
      id: uploadRecord._id,
      url: uploadRecord.url,
      public_id: uploadRecord.public_id,
      resource_type: uploadRecord.resource_type,
      file_size: uploadRecord.file_size,
      uploaded_at: uploadRecord.createdAt,
    };
  }

  async getUserUploads(userId, limit) {
    return await this.uploadRepository.getUserUploads(userId, limit);
  }

  // 🆕 Get uploads shared with user
  async getSharedUploads(userId, limit) {
    return await this.uploadRepository.getSharedUploads(userId, limit);
  }

  // 🆕 Get all accessible uploads (own + shared)
  async getAllAccessibleUploads(userId, userRole, limit) {
    const ownUploads = await this.uploadRepository.getUserUploads(userId, limit);
    const sharedUploads = await this.uploadRepository.getSharedUploads(userId, limit);
    
    return {
      own: ownUploads,
      shared: sharedUploads,
      total: ownUploads.length + sharedUploads.length
    };
  }

  // 🆕 Get project uploads
  async getProjectUploads(projectId, userId, userRole) {
    return await this.uploadRepository.getProjectUploads(projectId, userId, userRole);
  }

  // 🆕 Share upload with editor (admin action)
  async shareUpload(publicId, editorId, adminId, adminRole) {
    if (adminRole !== "admin") {
      throw new Error("Only admins can share uploads");
    }
    return await this.uploadRepository.shareUploadWithUser(publicId, editorId);
  }

  // 🆕 Share multiple uploads (when assigning task)
  async shareMultipleUploads(publicIds, editorId, adminRole) {
    if (adminRole !== "admin") {
      throw new Error("Only admins can share uploads");
    }
    return await this.uploadRepository.shareMultipleUploads(publicIds, editorId);
  }

  async deleteUpload(publicId, userId) {
    return await this.uploadRepository.deleteUpload(publicId, userId);
  }
}
