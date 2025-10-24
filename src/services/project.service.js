/**
 * ---------------------------
 * PROJECT SERVICE
 * ---------------------------
 * Business logic for projects
 */

import * as projectRepo from '../repositories/project.repository.js';
import * as packageRepo from '../repositories/package.repository.js';
import * as notificationRepo from '../repositories/notification.repository.js';
import { Editor } from '../models/user.model.js';
import AppError from '../utils/AppError.js';

export const createProjectService = async (userId, projectData) => {
  // Validate package
  const pkg = await packageRepo.findPackageByName(projectData.package_type);
  if (!pkg || !pkg.is_active) {
    throw new AppError('Invalid or inactive package', 400);
  }

  // Calculate deadline based on package
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + pkg.estimated_delivery_days);

  // Create project
  const project = await projectRepo.createProject({
    user_id: userId,
    ...projectData,
    deadline,
    total_amount: pkg.base_price,
    max_revisions: pkg.max_revisions
  });

  // Notify admins about new project
  // TODO: Get all admins and create notifications

  return project;
};

export const getProjectService = async (projectId, userId, userRole) => {
  const project = await projectRepo.findProjectById(projectId);
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Authorization check
  if (userRole === 'customer' && project.user_id._id.toString() !== userId) {
    throw new AppError('Not authorized to view this project', 403);
  }
  
  if (userRole === 'editor' && project.editor_id?._id.toString() !== userId) {
    throw new AppError('Not authorized to view this project', 403);
  }

  return project;
};

export const getUserProjectsService = async (userId, filters = {}) => {
  return await projectRepo.findProjectsByUser(userId, filters);
};

export const getEditorProjectsService = async (editorId, filters = {}) => {
  return await projectRepo.findProjectsByEditor(editorId, filters);
};

export const getAllProjectsService = async (filters = {}, pagination = {}) => {
  return await projectRepo.findAllProjects(filters, pagination);
};

export const assignEditorService = async (projectId, editorId, adminId) => {
  // Validate project
  const project = await projectRepo.findProjectById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (project.status !== 'pending_assignment') {
    throw new AppError('Project is not available for assignment', 400);
  }

  // Validate editor
  const editor = await Editor.findById(editorId);
  if (!editor) {
    throw new AppError('Editor not found', 404);
  }

  if (!editor.isAvailable || editor.application_status !== 'approved') {
    throw new AppError('Editor is not available', 400);
  }

  // Check editor workload
  const currentWorkload = await projectRepo.getEditorWorkload(editorId);
  if (currentWorkload >= editor.max_concurrent_projects) {
    throw new AppError('Editor has reached maximum concurrent projects', 400);
  }

  // Assign editor
  const updatedProject = await projectRepo.assignEditor(projectId, editorId, adminId);

  // Update editor workload
  await Editor.findByIdAndUpdate(editorId, {
    $inc: { current_workload: 1 }
  });

  // Create notifications
  await notificationRepo.createNotification({
    user_id: editorId,
    type: 'project_assigned',
    title: 'New Project Assigned',
    message: `You have been assigned to project: ${project.title}`,
    project_id: projectId,
    action_url: `/editor/projects/${projectId}`,
    action_text: 'View Project',
    priority: 'high'
  });

  await notificationRepo.createNotification({
    user_id: project.user_id,
    type: 'project_assigned',
    title: 'Editor Assigned',
    message: `An editor has been assigned to your project: ${project.title}`,
    project_id: projectId,
    related_user_id: editorId,
    action_url: `/customer/projects/${projectId}`,
    action_text: 'View Project'
  });

  return updatedProject;
};

export const updateProjectStatusService = async (projectId, status, userId, userRole, additionalData = {}) => {
  const project = await projectRepo.findProjectById(projectId);
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Authorization and status transition validation
  if (userRole === 'editor') {
    if (project.editor_id?._id.toString() !== userId) {
      throw new AppError('Not authorized', 403);
    }
    
    // Editors can only move to certain statuses
    const allowedStatuses = ['in_progress', 'ready_for_review'];
    if (!allowedStatuses.includes(status)) {
      throw new AppError('Invalid status transition', 400);
    }
  }

  const updatedProject = await projectRepo.updateProjectStatus(projectId, status, additionalData);

  // Create notification based on status
  let notificationData = {
    user_id: project.user_id,
    project_id: projectId,
    action_url: `/customer/projects/${projectId}`,
    action_text: 'View Project'
  };

  switch (status) {
    case 'in_progress':
      notificationData.type = 'system_alert';
      notificationData.title = 'Project Started';
      notificationData.message = `Your project "${project.title}" is now being edited`;
      break;
    case 'ready_for_review':
      notificationData.type = 'project_completed';
      notificationData.title = 'Project Ready for Review';
      notificationData.message = `Your project "${project.title}" is ready for review`;
      notificationData.priority = 'high';
      break;
    case 'completed':
      notificationData.type = 'project_completed';
      notificationData.title = 'Project Completed';
      notificationData.message = `Your project "${project.title}" has been completed`;
      notificationData.priority = 'high';
      break;
  }

  if (notificationData.type) {
    await notificationRepo.createNotification(notificationData);
  }

  return updatedProject;
};

export const requestRevisionService = async (projectId, feedback, userId) => {
  const project = await projectRepo.findProjectById(projectId);
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (project.user_id._id.toString() !== userId) {
    throw new AppError('Not authorized', 403);
  }

  if (!project.canRequestRevision()) {
    throw new AppError('Cannot request more revisions for this project', 400);
  }

  const updatedProject = await projectRepo.addRevision(projectId, feedback);

  // Notify editor
  if (project.editor_id) {
    await notificationRepo.createNotification({
      user_id: project.editor_id,
      type: 'revision_requested',
      title: 'Revision Requested',
      message: `Revision requested for project: ${project.title}`,
      project_id: projectId,
      action_url: `/editor/projects/${projectId}`,
      action_text: 'View Feedback',
      priority: 'high'
    });
  }

  return updatedProject;
};

export const uploadEditedVideoService = async (projectId, videoData, editorId) => {
  const project = await projectRepo.findProjectById(projectId);
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (project.editor_id?._id.toString() !== editorId) {
    throw new AppError('Not authorized', 403);
  }

  const updatedProject = await projectRepo.updateEditedVideo(projectId, videoData);

  // Notify user
  await notificationRepo.createNotification({
    user_id: project.user_id,
    type: 'project_completed',
    title: 'Video Ready for Review',
    message: `Your edited video for "${project.title}" is ready for review`,
    project_id: projectId,
    action_url: `/customer/projects/${projectId}`,
    action_text: 'Review Video',
    priority: 'high'
  });

  return updatedProject;
};

export const addProjectRatingService = async (projectId, rating, feedback, userId) => {
  const project = await projectRepo.findProjectById(projectId);
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (project.user_id._id.toString() !== userId) {
    throw new AppError('Not authorized', 403);
  }

  if (project.status !== 'completed') {
    throw new AppError('Can only rate completed projects', 400);
  }

  const updatedProject = await projectRepo.addRatingAndFeedback(projectId, rating, feedback);

  // Update editor's average rating
  if (project.editor_id) {
    const editor = await Editor.findById(project.editor_id);
    const newTotalReviews = editor.total_reviews + 1;
    const newAverageRating = ((editor.average_rating * editor.total_reviews) + rating) / newTotalReviews;

    await Editor.findByIdAndUpdate(project.editor_id, {
      $set: {
        average_rating: newAverageRating,
        total_reviews: newTotalReviews
      }
    });
  }

  return updatedProject;
};

export const getProjectStatsService = async (filters = {}) => {
  return await projectRepo.getProjectStats(filters);
};

export const getUnassignedProjectsService = async () => {
  return await projectRepo.findUnassignedProjects();
};

export const getDueSoonProjectsService = async (hours = 24) => {
  return await projectRepo.findProjectsDueSoon(hours);
};

export const createProjectWithFilesService = async (projectData, files) => {
  // Validate package
  const pkg = await packageRepo.findPackageByName(projectData.package_type);
  if (!pkg || !pkg.is_active) {
    throw new AppError('Invalid or inactive package', 400);
  }

  // Calculate deadline based on package
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + pkg.estimated_delivery_days);

  // Process uploaded files
  const rawFootage = files ? files.map(file => ({
    upload_id: file.upload_id || file.filename,
    filename: file.originalname || file.filename,
    size: file.size,
    uploaded_at: new Date()
  })) : [];

  // Create project
  const project = await projectRepo.createProject({
    user_id: projectData.user_id,
    title: projectData.title,
    description: projectData.description,
    package_type: projectData.package_type,
    editing_instructions: projectData.editing_instructions,
    special_requirements: projectData.special_requirements || [],
    raw_footage: rawFootage,
    deadline,
    total_amount: pkg.base_price,
    max_revisions: pkg.max_revisions
  });

  // Notify admins about new project
  // TODO: Get all admins and create notifications

  return project;
};

export const uploadProjectDraftService = async (projectId, editorId, fileData) => {
  const project = await projectRepo.findProjectById(projectId);
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (project.editor_id?._id.toString() !== editorId) {
    throw new AppError('Not authorized', 403);
  }

  if (project.status !== 'in_progress' && project.status !== 'revision_requested') {
    throw new AppError('Project is not in progress', 400);
  }

  // Update project with draft video (not final yet)
  const draftData = {
    filename: fileData.originalname || fileData.filename,
    size: fileData.size,
    uploaded_at: new Date(),
    version: (project.edited_video?.version || 0) + 1
  };
  
  // Only set upload_id if it's a valid ObjectId
  if (fileData.upload_id && fileData.upload_id.match(/^[0-9a-fA-F]{24}$/)) {
    draftData.upload_id = fileData.upload_id;
  }

  const updatedProject = await projectRepo.updateProject(projectId, {
    edited_video: draftData,
    status: 'ready_for_review'
  });

  // Notify user
  await notificationRepo.createNotification({
    user_id: project.user_id,
    type: 'project_completed',
    title: 'Draft Ready for Review',
    message: `Your project "${project.title}" draft is ready for review`,
    project_id: projectId,
    action_url: `/customer/projects/${projectId}`,
    action_text: 'Review Draft',
    priority: 'high'
  });

  return updatedProject;
};

export const markProjectAsFinalService = async (projectId, editorId) => {
  const project = await projectRepo.findProjectById(projectId);
  
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (project.editor_id?._id.toString() !== editorId) {
    throw new AppError('Not authorized', 403);
  }

  if (project.status !== 'ready_for_review') {
    throw new AppError('Project must be in ready_for_review status', 400);
  }

  // Mark project as completed
  const updatedProject = await projectRepo.updateProjectStatus(projectId, 'completed', {
    completed_at: new Date(),
    actual_delivery: new Date()
  });

  // Notify user
  await notificationRepo.createNotification({
    user_id: project.user_id,
    type: 'project_completed',
    title: 'Project Completed',
    message: `Your project "${project.title}" has been completed and is ready for download`,
    project_id: projectId,
    action_url: `/customer/projects/${projectId}`,
    action_text: 'Download Video',
    priority: 'high'
  });

  // Trigger payment release to editor
  await releasePaymentToEditorService(projectId);

  return updatedProject;
};

export const releasePaymentToEditorService = async (projectId) => {
  const project = await projectRepo.findProjectById(projectId);
  
  if (!project || project.status !== 'completed') {
    throw new AppError('Project not eligible for payment release', 400);
  }

  if (project.editor_payment_status !== 'pending') {
    throw new AppError('Payment already processed', 400);
  }

  // Update project payment status
  await projectRepo.updateProject(projectId, {
    editor_payment_status: 'processing'
  });

  // Update editor's pending earnings
  if (project.editor_id) {
    await Editor.findByIdAndUpdate(project.editor_id, {
      $inc: { pending_earnings: project.editor_fee }
    });

    // Send notification
    await notificationRepo.createNotification({
      user_id: project.editor_id,
      type: 'payout_processed',
      title: 'Payment Processing',
      message: `Payment of ₹${project.editor_fee} for project "${project.title}" is being processed`,
      project_id: projectId,
      priority: 'high'
    });
  }

  return { success: true, message: 'Payment release initiated' };
};
