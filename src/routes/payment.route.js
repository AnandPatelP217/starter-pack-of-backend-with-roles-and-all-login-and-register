/**
 * ---------------------------
 * PAYMENT ROUTES
 * ---------------------------
 * API routes for payment management
 */

import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { ProtectRoute, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  initiatePaymentSchema,
  verifyPaymentSchema,
  processRefundSchema
} from '../validators/payment.validator.js';

const router = express.Router();

// All routes require authentication
router.use(ProtectRoute);

// Customer routes
router.post('/initiate', 
  authorizeRoles('customer'),
  validate(initiatePaymentSchema),
  paymentController.initiatePayment
);

router.post('/:paymentId/verify', 
  authorizeRoles('customer'),
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

router.get('/my-payments', 
  authorizeRoles('customer'),
  paymentController.getUserPayments
);

router.get('/project/:projectId', 
  paymentController.getProjectPayments
);

// Admin routes
router.get('/all', 
  authorizeRoles('admin'),
  paymentController.getAllPayments
);

router.post('/:paymentId/refund', 
  authorizeRoles('admin'),
  validate(processRefundSchema),
  paymentController.processRefund
);

router.get('/stats', 
  authorizeRoles('admin'),
  paymentController.getPaymentStats
);

router.get('/revenue', 
  authorizeRoles('admin'),
  paymentController.getRevenue
);

router.get('/revenue/by-gateway', 
  authorizeRoles('admin'),
  paymentController.getRevenueByGateway
);

// Common routes
router.get('/:paymentId', 
  paymentController.getPayment
);

export default router;
