import multer from "multer";
import { UploadService } from "../services/upload.service.js";
import { sendResponse } from "../utils/sendResponse.js";
import { STATUS } from "../constants/statusCodes.js";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv|mp3|wav/;
    const isValid = allowedTypes.test(file.mimetype);
    cb(isValid ? null : new Error("Invalid file type"), isValid);
  },
});

const uploadService = new UploadService();

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const userId = req.user?.userId;
    const projectId = req.body.projectId || null; // 🆕 Optional project link

    if (!userId) {
      return res.status(STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Authentication required",
      });
    }

    const response = await uploadService.handleFileUpload(req.file, userId, projectId);

    sendResponse(res, STATUS.CREATED, "File uploaded successfully", response);
  } catch (error) {
    next(error);
  }
};

// Get user's own uploads
export const getMyUploads = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit) || 10;

    const uploads = await uploadService.getUserUploads(userId, limit);

    sendResponse(res, STATUS.OK, "Uploads retrieved successfully", {
      count: uploads.length,
      uploads,
    });
  } catch (error) {
    next(error);
  }
};

// 🆕 Get all accessible uploads (own + shared)
export const getAllAccessibleUploads = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const limit = parseInt(req.query.limit) || 10;

    const uploads = await uploadService.getAllAccessibleUploads(userId, userRole, limit);

    sendResponse(res, STATUS.OK, "All accessible uploads retrieved", uploads);
  } catch (error) {
    next(error);
  }
};

// 🆕 Get uploads for a specific project
export const getProjectUploads = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const uploads = await uploadService.getProjectUploads(projectId, userId, userRole);

    sendResponse(res, STATUS.OK, "Project uploads retrieved", {
      count: uploads.length,
      uploads,
    });
  } catch (error) {
    next(error);
  }
};

// 🆕 Share upload with editor (Admin only)
export const shareUpload = async (req, res, next) => {
  try {
    const { publicId, editorId } = req.body;
    const adminId = req.user?.userId;
    const adminRole = req.user?.role;

    if (!publicId || !editorId) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: "publicId and editorId are required",
      });
    }

    await uploadService.shareUpload(publicId, editorId, adminId, adminRole);

    sendResponse(res, STATUS.OK, "Upload shared successfully");
  } catch (error) {
    next(error);
  }
};

// 🆕 Share multiple uploads (when assigning task)
export const shareMultipleUploads = async (req, res, next) => {
  try {
    const { publicIds, editorId } = req.body;
    const adminRole = req.user?.role;

    if (!publicIds || !Array.isArray(publicIds) || !editorId) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: "publicIds (array) and editorId are required",
      });
    }

    await uploadService.shareMultipleUploads(publicIds, editorId, adminRole);

    sendResponse(res, STATUS.OK, `${publicIds.length} uploads shared successfully`);
  } catch (error) {
    next(error);
  }
};

export const deleteUpload = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    const userId = req.user?.userId;

    await uploadService.deleteUpload(publicId, userId);

    sendResponse(res, STATUS.OK, "File deleted successfully");
  } catch (error) {
    next(error);
  }
};
