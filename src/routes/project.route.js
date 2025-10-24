/**
 * ---------------------------
 * PROJECT ROUTES
 * ---------------------------
 * API routes for project management
 */

import express from 'express';
import * as projectController from '../controllers/project.controller.js';
import { ProtectRoute, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createProjectSchema,
  assignEditorSchema,
  updateProjectStatusSchema,
  requestRevisionSchema,
  uploadEditedVideoSchema,
  addRatingSchema
} from '../validators/project.validator.js';

const router = express.Router();

// All routes require authentication
router.use(ProtectRoute);

// Customer routes
router.post('/', 
  authorizeRoles('customer'),
  validate(createProjectSchema),
  projectController.createProject
);

router.post('/with-upload', 
  authorizeRoles('customer'),
  validate(createProjectSchema),
  projectController.createProjectWithUpload
);

router.get('/my-projects', 
  authorizeRoles('customer'),
  projectController.getUserProjects
);

router.post('/:projectId/revision', 
  authorizeRoles('customer'),
  validate(requestRevisionSchema),
  projectController.requestRevision
);

router.post('/:projectId/rating', 
  authorizeRoles('customer'),
  validate(addRatingSchema),
  projectController.addRating
);

// Editor routes
router.get('/editor/projects', 
  authorizeRoles('editor'),
  projectController.getEditorProjects
);

router.put('/:projectId/status', 
  authorizeRoles('editor', 'admin'),
  validate(updateProjectStatusSchema),
  projectController.updateProjectStatus
);

router.post('/:projectId/edited-video', 
  authorizeRoles('editor'),
  validate(uploadEditedVideoSchema),
  projectController.uploadEditedVideo
);

router.post('/:projectId/draft', 
  authorizeRoles('editor'),
  projectController.uploadDraft
);

router.patch('/:projectId/mark-final', 
  authorizeRoles('editor'),
  projectController.markAsFinal
);

// Admin routes
router.get('/all', 
  authorizeRoles('admin'),
  projectController.getAllProjects
);

router.get('/unassigned', 
  authorizeRoles('admin'),
  projectController.getUnassignedProjects
);

router.get('/due-soon', 
  authorizeRoles('admin'),
  projectController.getDueSoonProjects
);

router.post('/:projectId/assign', 
  authorizeRoles('admin'),
  validate(assignEditorSchema),
  projectController.assignEditor
);

router.get('/stats', 
  authorizeRoles('admin'),
  projectController.getProjectStats
);

// Common routes (accessible by customer, editor on their projects, or admin)
router.get('/:projectId', 
  projectController.getProject
);

export default router;
