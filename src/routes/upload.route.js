import express from "express";
import { 
  upload, 
  uploadFile, 
  getMyUploads, 
  getAllAccessibleUploads,
  getProjectUploads,
  shareUpload,
  shareMultipleUploads,
  deleteUpload 
} from "../controllers/upload.controller.js";
import { authorizeRoles, ProtectRoute } from "../middlewares/auth.middleware.js";

const UploadRouter = express.Router();

// All routes require authentication
UploadRouter.use(ProtectRoute);

// POST /api/upload - Upload a file (with optional projectId)
UploadRouter.post("/", upload.single("file"), uploadFile);

// GET /api/upload/my-uploads - Get only user's own uploads
UploadRouter.get("/my-uploads", getMyUploads);

// 🆕 GET /api/upload/all - Get all accessible uploads (own + shared)
UploadRouter.get("/all", getAllAccessibleUploads);

// 🆕 GET /api/upload/project/:projectId - Get uploads for a project
UploadRouter.get("/project/:projectId", getProjectUploads);

// 🆕 POST /api/upload/share - Share single upload (Admin only)
UploadRouter.post("/share", authorizeRoles("admin"), shareUpload);

// 🆕 POST /api/upload/share-multiple - Share multiple uploads (Admin only)
UploadRouter.post("/share-multiple", authorizeRoles("admin"), shareMultipleUploads);

// DELETE /api/upload/:publicId - Delete an upload
UploadRouter.delete("/:publicId", deleteUpload);

export default UploadRouter;
