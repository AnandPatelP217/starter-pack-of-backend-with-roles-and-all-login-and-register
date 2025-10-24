/**
 * ---------------------------
 * ADMIN CONTROLLER
 * ---------------------------
 * HTTP request handlers for admin operations
 */

import { User, Editor, Customer, Admin } from '../models/user.model.js';
import { sendResponse } from '../utils/sendResponse.js';
import AppError from '../utils/AppError.js';
import * as notificationRepo from '../repositories/notification.repository.js';
import * as adminService from '../services/admin.service.js';

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, is_suspended, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (is_suspended !== undefined) query.is_suspended = is_suspended === 'true';
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    sendResponse(res, 200, true, 'Users retrieved successfully', {
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    sendResponse(res, 200, true, 'User retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

// Suspend/Unsuspend user
export const toggleUserSuspension = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { suspension_reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    const updateData = {
      is_suspended: !user.is_suspended,
      isBlocked: !user.is_suspended // Update legacy field too
    };
    
    if (!user.is_suspended && suspension_reason) {
      updateData.suspension_reason = suspension_reason;
    } else if (user.is_suspended) {
      updateData.suspension_reason = null;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    // Create notification
    await notificationRepo.createNotification({
      user_id: userId,
      type: 'system_alert',
      title: updatedUser.is_suspended ? 'Account Suspended' : 'Account Reactivated',
      message: updatedUser.is_suspended 
        ? `Your account has been suspended. Reason: ${suspension_reason}` 
        : 'Your account has been reactivated',
      priority: 'urgent'
    });
    
    sendResponse(res, 200, true, 
      `User ${updatedUser.is_suspended ? 'suspended' : 'unsuspended'} successfully`, 
      updatedUser
    );
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    sendResponse(res, 200, true, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Get all editors
export const getAllEditors = async (req, res, next) => {
  try {
    const { application_status, is_available } = req.query;
    
    const query = {};
    if (application_status) query.application_status = application_status;
    if (is_available !== undefined) query.isAvailable = is_available === 'true';
    
    const editors = await Editor.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    sendResponse(res, 200, true, 'Editors retrieved successfully', editors);
  } catch (error) {
    next(error);
  }
};

// Approve editor application
export const approveEditor = async (req, res, next) => {
  try {
    const { editorId } = req.params;
    const adminId = req.user.userId;
    
    const editor = await Editor.findById(editorId);
    if (!editor) {
      throw new AppError('Editor not found', 404);
    }
    
    if (editor.application_status !== 'pending') {
      throw new AppError('Editor application already processed', 400);
    }
    
    const updatedEditor = await Editor.findByIdAndUpdate(
      editorId,
      {
        $set: {
          application_status: 'approved',
          approved_by: adminId,
          approved_at: new Date(),
          is_verified: true,
          isAvailable: true  // Set editor as available when approved
        }
      },
      { new: true }
    ).select('-password');
    
    // Create notification
    await notificationRepo.createNotification({
      user_id: editorId,
      type: 'editor_application',
      title: 'Application Approved',
      message: 'Congratulations! Your editor application has been approved. You can now start receiving project assignments.',
      priority: 'high'
    });
    
    sendResponse(res, 200, true, 'Editor approved successfully', updatedEditor);
  } catch (error) {
    next(error);
  }
};

// Reject editor application
export const rejectEditor = async (req, res, next) => {
  try {
    const { editorId } = req.params;
    const { rejection_reason } = req.body;
    
    const editor = await Editor.findById(editorId);
    if (!editor) {
      throw new AppError('Editor not found', 404);
    }
    
    if (editor.application_status !== 'pending') {
      throw new AppError('Editor application already processed', 400);
    }
    
    const updatedEditor = await Editor.findByIdAndUpdate(
      editorId,
      {
        $set: {
          application_status: 'rejected',
          rejection_reason
        }
      },
      { new: true }
    ).select('-password');
    
    // Create notification
    await notificationRepo.createNotification({
      user_id: editorId,
      type: 'editor_application',
      title: 'Application Rejected',
      message: `Your editor application has been rejected. Reason: ${rejection_reason}`,
      priority: 'high'
    });
    
    sendResponse(res, 200, true, 'Editor rejected', updatedEditor);
  } catch (error) {
    next(error);
  }
};

// Get platform statistics
export const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalEditors,
      totalAdmins,
      activeEditors,
      pendingEditorApplications,
      suspendedUsers
    ] = await Promise.all([
      User.countDocuments(),
      Customer.countDocuments(),
      Editor.countDocuments(),
      Admin.countDocuments(),
      Editor.countDocuments({ isAvailable: true, application_status: 'approved' }),
      Editor.countDocuments({ application_status: 'pending' }),
      User.countDocuments({ is_suspended: true })
    ]);
    
    const stats = {
      totalUsers,
      totalCustomers,
      totalEditors,
      totalAdmins,
      activeEditors,
      pendingEditorApplications,
      suspendedUsers
    };
    
    sendResponse(res, 200, true, 'Platform statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

// Update editor profile (Admin can update any field)
export const updateEditorProfile = async (req, res, next) => {
  try {
    const { editorId } = req.params;
    
    const editor = await Editor.findByIdAndUpdate(
      editorId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!editor) {
      throw new AppError('Editor not found', 404);
    }
    
    sendResponse(res, 200, true, 'Editor profile updated successfully', editor);
  } catch (error) {
    next(error);
  }
};

// Get dashboard analytics
export const getDashboard = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query; // 'day', 'week', 'month', 'year'
    
    const analytics = await adminService.getDashboardAnalyticsService(period);
    
    sendResponse(res, 200, true, 'Dashboard data retrieved successfully', analytics);
  } catch (error) {
    next(error);
  }
};

// Get monthly report
export const getMonthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    
    const currentDate = new Date();
    const reportYear = year ? parseInt(year) : currentDate.getFullYear();
    const reportMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    
    const report = await adminService.getMonthlyReportService(reportYear, reportMonth);
    
    sendResponse(res, 200, true, 'Monthly report retrieved successfully', report);
  } catch (error) {
    next(error);
  }
};
