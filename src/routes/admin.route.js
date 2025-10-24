/**
 * ---------------------------
 * ADMIN ROUTES
 * ---------------------------
 * API routes for admin operations
 */

import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { ProtectRoute, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  toggleSuspensionSchema,
  rejectEditorSchema,
  updateEditorProfileSchema
} from '../validators/admin.validator.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(ProtectRoute);
router.use(authorizeRoles('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.patch('/users/:userId/toggle-suspension', 
  validate(toggleSuspensionSchema),
  adminController.toggleUserSuspension
);
router.delete('/users/:userId', adminController.deleteUser);

// Editor management
router.get('/editors', adminController.getAllEditors);
router.post('/editors/:editorId/approve', adminController.approveEditor);
router.post('/editors/:editorId/reject', 
  validate(rejectEditorSchema),
  adminController.rejectEditor
);
router.put('/editors/:editorId', 
  validate(updateEditorProfileSchema),
  adminController.updateEditorProfile
);

// Platform statistics
router.get('/stats', adminController.getPlatformStats);

// Dashboard analytics
router.get('/dashboard', adminController.getDashboard);

// Monthly report
router.get('/monthly-report', adminController.getMonthlyReport);

export default router;
