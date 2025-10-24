/**
 * ---------------------------
 * PACKAGE ROUTES
 * ---------------------------
 * API routes for package management
 */

import express from 'express';
import * as packageController from '../controllers/package.controller.js';
import { ProtectRoute, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createPackageSchema,
  updatePackageSchema,
  setPopularSchema
} from '../validators/package.validator.js';

const router = express.Router();

// Public routes (get packages)
router.get('/', packageController.getAllPackages);
router.get('/name/:name', packageController.getPackageByName);
router.get('/calculate-price', packageController.calculatePrice);
router.get('/:packageId', packageController.getPackage);

// Protected routes - Admin only
router.use(ProtectRoute);
router.use(authorizeRoles('admin'));

router.post('/', 
  validate(createPackageSchema),
  packageController.createPackage
);

router.put('/:packageId', 
  validate(updatePackageSchema),
  packageController.updatePackage
);

router.delete('/:packageId', 
  packageController.deletePackage
);

router.patch('/:packageId/toggle-status', 
  packageController.togglePackageStatus
);

router.patch('/:packageId/popular', 
  validate(setPopularSchema),
  packageController.setPopularPackage
);

export default router;
