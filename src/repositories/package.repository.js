/**
 * ---------------------------
 * PACKAGE REPOSITORY
 * ---------------------------
 * Data access layer for packages
 */

import Package from '../models/package.model.js';

export const createPackage = async (packageData) => {
  return await Package.create(packageData);
};

export const findAllPackages = async (filters = {}) => {
  return await Package.find(filters).sort({ base_price: 1 });
};

export const findActivePackages = async () => {
  return await Package.find({ is_active: true }).sort({ base_price: 1 });
};

export const findPackageByName = async (name) => {
  return await Package.findOne({ name });
};

export const findPackageById = async (packageId) => {
  return await Package.findById(packageId);
};

export const updatePackage = async (packageId, updateData) => {
  return await Package.findByIdAndUpdate(
    packageId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

export const deletePackage = async (packageId) => {
  return await Package.findByIdAndDelete(packageId);
};

export const setPackageStatus = async (packageId, isActive) => {
  return await Package.findByIdAndUpdate(
    packageId,
    { $set: { is_active: isActive } },
    { new: true }
  );
};

export const setPopularPackage = async (packageId, isPopular) => {
  return await Package.findByIdAndUpdate(
    packageId,
    { $set: { is_popular: isPopular } },
    { new: true }
  );
};

export const calculatePrice = async (packageName, videoLengthMinutes) => {
  const pkg = await findPackageByName(packageName);
  
  if (!pkg) {
    throw new Error('Package not found');
  }

  if (videoLengthMinutes > pkg.max_video_length) {
    throw new Error(`Video length exceeds maximum of ${pkg.max_video_length} minutes for this package`);
  }

  const totalPrice = pkg.base_price + (pkg.price_per_minute * videoLengthMinutes);
  
  return {
    package: pkg,
    videoLength: videoLengthMinutes,
    basePrice: pkg.base_price,
    perMinuteCharge: pkg.price_per_minute * videoLengthMinutes,
    totalPrice,
    currency: pkg.currency
  };
};
