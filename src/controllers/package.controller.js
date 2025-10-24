/**
 * ---------------------------
 * PACKAGE CONTROLLER
 * ---------------------------
 * HTTP request handlers for packages
 */

import * as packageService from '../services/package.service.js';
import { sendResponse } from '../utils/sendResponse.js';

// Create package (Admin only)
export const createPackage = async (req, res, next) => {
  try {
    const pkg = await packageService.createPackageService(req.body);
    
    sendResponse(res, 201, true, 'Package created successfully', pkg);
  } catch (error) {
    next(error);
  }
};

// Get all packages
export const getAllPackages = async (req, res, next) => {
  try {
    const { include_inactive } = req.query;
    const includeInactive = include_inactive === 'true' && req.user?.role === 'admin';
    
    const packages = await packageService.getAllPackagesService(includeInactive);
    
    sendResponse(res, 200, true, 'Packages retrieved successfully', packages);
  } catch (error) {
    next(error);
  }
};

// Get package by ID
export const getPackage = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const pkg = await packageService.getPackageService(packageId);
    
    sendResponse(res, 200, true, 'Package retrieved successfully', pkg);
  } catch (error) {
    next(error);
  }
};

// Get package by name
export const getPackageByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    const pkg = await packageService.getPackageByNameService(name);
    
    sendResponse(res, 200, true, 'Package retrieved successfully', pkg);
  } catch (error) {
    next(error);
  }
};

// Update package (Admin only)
export const updatePackage = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const pkg = await packageService.updatePackageService(packageId, req.body);
    
    sendResponse(res, 200, true, 'Package updated successfully', pkg);
  } catch (error) {
    next(error);
  }
};

// Delete/Deactivate package (Admin only)
export const deletePackage = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const pkg = await packageService.deletePackageService(packageId);
    
    sendResponse(res, 200, true, 'Package deactivated successfully', pkg);
  } catch (error) {
    next(error);
  }
};

// Toggle package status (Admin only)
export const togglePackageStatus = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const pkg = await packageService.togglePackageStatusService(packageId);
    
    sendResponse(res, 200, true, 'Package status updated successfully', pkg);
  } catch (error) {
    next(error);
  }
};

// Set popular package (Admin only)
export const setPopularPackage = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const { is_popular } = req.body;
    const pkg = await packageService.setPopularPackageService(packageId, is_popular);
    
    sendResponse(res, 200, true, 'Package popularity updated successfully', pkg);
  } catch (error) {
    next(error);
  }
};

// Calculate package price
export const calculatePrice = async (req, res, next) => {
  try {
    const { package_name, video_length } = req.query;
    
    const pricing = await packageService.calculatePackagePriceService(
      package_name,
      parseFloat(video_length)
    );
    
    sendResponse(res, 200, true, 'Price calculated successfully', pricing);
  } catch (error) {
    next(error);
  }
};
