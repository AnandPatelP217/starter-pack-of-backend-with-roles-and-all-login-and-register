/**
 * ---------------------------
 * PACKAGE SERVICE
 * ---------------------------
 * Business logic for packages
 */

import * as packageRepo from '../repositories/package.repository.js';
import AppError from '../utils/AppError.js';

export const createPackageService = async (packageData) => {
  // Check if package with same name exists
  const existingPackage = await packageRepo.findPackageByName(packageData.name);
  if (existingPackage) {
    throw new AppError('Package with this name already exists', 400);
  }

  return await packageRepo.createPackage(packageData);
};

export const getAllPackagesService = async (includeInactive = false) => {
  if (includeInactive) {
    return await packageRepo.findAllPackages();
  }
  return await packageRepo.findActivePackages();
};

export const getPackageService = async (packageId) => {
  const pkg = await packageRepo.findPackageById(packageId);
  
  if (!pkg) {
    throw new AppError('Package not found', 404);
  }

  return pkg;
};

export const getPackageByNameService = async (name) => {
  const pkg = await packageRepo.findPackageByName(name);
  
  if (!pkg) {
    throw new AppError('Package not found', 404);
  }

  return pkg;
};

export const updatePackageService = async (packageId, updateData) => {
  const pkg = await packageRepo.findPackageById(packageId);
  
  if (!pkg) {
    throw new AppError('Package not found', 404);
  }

  // If updating name, check for duplicates
  if (updateData.name && updateData.name !== pkg.name) {
    const existingPackage = await packageRepo.findPackageByName(updateData.name);
    if (existingPackage) {
      throw new AppError('Package with this name already exists', 400);
    }
  }

  return await packageRepo.updatePackage(packageId, updateData);
};

export const deletePackageService = async (packageId) => {
  const pkg = await packageRepo.findPackageById(packageId);
  
  if (!pkg) {
    throw new AppError('Package not found', 404);
  }

  // Instead of deleting, deactivate the package
  return await packageRepo.setPackageStatus(packageId, false);
};

export const togglePackageStatusService = async (packageId) => {
  const pkg = await packageRepo.findPackageById(packageId);
  
  if (!pkg) {
    throw new AppError('Package not found', 404);
  }

  return await packageRepo.setPackageStatus(packageId, !pkg.is_active);
};

export const setPopularPackageService = async (packageId, isPopular) => {
  const pkg = await packageRepo.findPackageById(packageId);
  
  if (!pkg) {
    throw new AppError('Package not found', 404);
  }

  return await packageRepo.setPopularPackage(packageId, isPopular);
};

export const calculatePackagePriceService = async (packageName, videoLengthMinutes) => {
  if (!videoLengthMinutes || videoLengthMinutes <= 0) {
    throw new AppError('Invalid video length', 400);
  }

  return await packageRepo.calculatePrice(packageName, videoLengthMinutes);
};
