/**
 * ---------------------------
 * PAYOUT ROUTES
 * ---------------------------
 * API routes for editor payout management
 */

import express from 'express';
import * as payoutController from '../controllers/payout.controller.js';
import { ProtectRoute, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createPayoutSchema,
  updatePayoutStatusSchema
} from '../validators/payout.validator.js';

const router = express.Router();

// All routes require authentication
router.use(ProtectRoute);

// Editor routes
router.get('/my-payouts', 
  authorizeRoles('editor'),
  payoutController.getEditorPayouts
);

router.get('/my-earnings', 
  authorizeRoles('editor'),
  payoutController.getEditorEarnings
);

router.get('/pending-earnings', 
  authorizeRoles('editor'),
  payoutController.getEditorPendingEarnings
);

// Admin routes
router.post('/', 
  authorizeRoles('admin'),
  validate(createPayoutSchema),
  payoutController.createPayout
);

router.get('/all', 
  authorizeRoles('admin'),
  payoutController.getAllPayouts
);

router.get('/pending', 
  authorizeRoles('admin'),
  payoutController.getPendingPayouts
);

router.put('/:payoutId/status', 
  authorizeRoles('admin'),
  validate(updatePayoutStatusSchema),
  payoutController.updatePayoutStatus
);

router.get('/stats', 
  authorizeRoles('admin'),
  payoutController.getPayoutStats
);

// Common routes
router.get('/:payoutId', 
  payoutController.getPayout
);

export default router;
