/**
 * ---------------------------
 * PROJECT CONTROLLER
 * ---------------------------
 * HTTP request handlers for projects
 */

import * as projectService from '../services/project.service.js';

import AppError from '../utils/AppError.js';
import { sendResponse } from '../utils/sendResponse.js';

// Create new project
export const createProject = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const project = await projectService.createProjectService(userId, req.body);
    
    sendResponse(res, 201, true, 'Project created successfully', project);
  } catch (error) {
    next(error);
  }
};

// Create new project with file upload
export const createProjectWithUpload = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const files = req.files; // Multer files
    
    const projectData = {
      ...req.body,
      user_id: userId
    };
    
    const project = await projectService.createProjectWithFilesService(
      projectData,
      files
    );
    
    sendResponse(res, 201, true, 'Project created with files successfully', project);
  } catch (error) {
    next(error);
  }
};

// Get project by ID
export const getProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.user;
    
    const project = await projectService.getProjectService(projectId, userId, role);
    
    sendResponse(res, 200, true, 'Project retrieved successfully', project);
  } catch (error) {
    next(error);
  }
};

// Get user's projects
export const getUserProjects = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;
    
    const filters = status ? { status } : {};
    const projects = await projectService.getUserProjectsService(userId, filters);
    
    sendResponse(res, 200, true, 'Projects retrieved successfully', projects);
  } catch (error) {
    next(error);
  }
};

// Get editor's projects
export const getEditorProjects = async (req, res, next) => {
  try {
    const editorId = req.user.userId;
    const { status } = req.query;
    
    const filters = status ? { status } : {};
    const projects = await projectService.getEditorProjectsService(editorId, filters);
    
    sendResponse(res, 200, true, 'Projects retrieved successfully', projects);
  } catch (error) {
    next(error);
  }
};

// Get all projects (Admin only)
export const getAllProjects = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    
    const filters = status ? { status } : {};
    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    };
    
    const result = await projectService.getAllProjectsService(filters, pagination);
    
    sendResponse(res, 200, true, 'Projects retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

// Assign editor to project (Admin only)
export const assignEditor = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { editor_id } = req.body;
    const adminId = req.user.userId;
    
    const project = await projectService.assignEditorService(projectId, editor_id, adminId);
    
    sendResponse(res, 200, true, 'Editor assigned successfully', project);
  } catch (error) {
    next(error);
  }
};

// Update project status
export const updateProjectStatus = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, ...additionalData } = req.body;
    const { userId, role } = req.user;
    
    const project = await projectService.updateProjectStatusService(
      projectId,
      status,
      userId,
      role,
      additionalData
    );
    
    sendResponse(res, 200, true, 'Project status updated successfully', project);
  } catch (error) {
    next(error);
  }
};

// Request revision
export const requestRevision = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { feedback } = req.body;
    const userId = req.user.userId;
    
    const project = await projectService.requestRevisionService(projectId, feedback, userId);
    
    sendResponse(res, 200, true, 'Revision requested successfully', project);
  } catch (error) {
    next(error);
  }
};

// Upload edited video (Editor only)
export const uploadEditedVideo = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const videoData = req.body;
    const editorId = req.user.userId;
    
    const project = await projectService.uploadEditedVideoService(projectId, videoData, editorId);
    
    sendResponse(res, 200, true, 'Edited video uploaded successfully', project);
  } catch (error) {
    next(error);
  }
};

// Add rating and feedback
export const addRating = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.user.userId;
    
    const project = await projectService.addProjectRatingService(projectId, rating, feedback, userId);
    
    sendResponse(res, 200, true, 'Rating added successfully', project);
  } catch (error) {
    next(error);
  }
};

// Get project statistics (Admin only)
export const getProjectStats = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};
    
    const stats = await projectService.getProjectStatsService(filters);
    
    sendResponse(res, 200, true, 'Statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

// Get unassigned projects (Admin only)
export const getUnassignedProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getUnassignedProjectsService();
    
    sendResponse(res, 200, true, 'Unassigned projects retrieved successfully', projects);
  } catch (error) {
    next(error);
  }
};

// Get projects due soon (Admin only)
export const getDueSoonProjects = async (req, res, next) => {
  try {
    const { hours } = req.query;
    const projects = await projectService.getDueSoonProjectsService(parseInt(hours) || 24);
    
    sendResponse(res, 200, true, 'Projects due soon retrieved successfully', projects);
  } catch (error) {
    next(error);
  }
};

// Upload draft/preview video (Editor only)
export const uploadDraft = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const editorId = req.user.userId;
    const fileData = req.body.videoData || req.file;
    
    if (!fileData) {
      return sendResponse(res, 400, false, 'No file data provided');
    }
    
    const project = await projectService.uploadProjectDraftService(
      projectId,
      editorId,
      fileData
    );
    
    sendResponse(res, 200, true, 'Draft uploaded successfully', project);
  } catch (error) {
    next(error);
  }
};

// Mark project as final (Editor only)
export const markAsFinal = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const editorId = req.user.userId;
    
    const project = await projectService.markProjectAsFinalService(
      projectId,
      editorId
    );
    
    sendResponse(res, 200, true, 'Project marked as final and payment released', project);
  } catch (error) {
    next(error);
  }
};
