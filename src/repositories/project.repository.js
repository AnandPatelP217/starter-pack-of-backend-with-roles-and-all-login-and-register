/**
 * ---------------------------
 * PROJECT REPOSITORY
 * ---------------------------
 * Data access layer for projects
 */

import Project from '../models/project.model.js';

export const createProject = async (projectData) => {
  return await Project.create(projectData);
};

export const findProjectById = async (projectId) => {
  return await Project.findById(projectId)
    .populate('user_id', 'name email phone')
    .populate('editor_id', 'name email skills average_rating')
    .populate('assigned_by', 'name email');
};

export const findProjectsByUser = async (userId, filters = {}) => {
  const query = { user_id: userId, ...filters };
  return await Project.find(query)
    .populate('editor_id', 'name email skills average_rating')
    .sort({ createdAt: -1 });
};

export const findProjectsByEditor = async (editorId, filters = {}) => {
  const query = { editor_id: editorId, ...filters };
  return await Project.find(query)
    .populate('user_id', 'name email phone')
    .sort({ createdAt: -1 });
};

export const findAllProjects = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  const projects = await Project.find(filters)
    .populate('user_id', 'name email')
    .populate('editor_id', 'name email skills')
    .populate('assigned_by', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Project.countDocuments(filters);

  return {
    projects,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

export const updateProject = async (projectId, updateData) => {
  return await Project.findByIdAndUpdate(
    projectId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

export const assignEditor = async (projectId, editorId, assignedBy) => {
  return await Project.findByIdAndUpdate(
    projectId,
    {
      $set: {
        editor_id: editorId,
        assigned_by: assignedBy,
        assigned_at: new Date(),
        status: 'assigned'
      }
    },
    { new: true }
  );
};

export const updateProjectStatus = async (projectId, status, additionalData = {}) => {
  const updateData = { status, ...additionalData };
  
  // Set timestamps based on status
  if (status === 'in_progress' && !additionalData.started_at) {
    updateData.started_at = new Date();
  } else if (status === 'completed' && !additionalData.completed_at) {
    updateData.completed_at = new Date();
    updateData.actual_delivery = new Date();
  } else if (status === 'cancelled' && !additionalData.cancelled_at) {
    updateData.cancelled_at = new Date();
  }

  return await Project.findByIdAndUpdate(
    projectId,
    { $set: updateData },
    { new: true }
  );
};

export const addRevision = async (projectId, feedback) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  return await project.requestRevision(feedback);
};

export const updateEditedVideo = async (projectId, videoData) => {
  return await Project.findByIdAndUpdate(
    projectId,
    {
      $set: {
        edited_video: videoData,
        status: 'ready_for_review'
      }
    },
    { new: true }
  );
};

export const addRawFootage = async (projectId, footageData) => {
  return await Project.findByIdAndUpdate(
    projectId,
    {
      $push: { raw_footage: footageData }
    },
    { new: true }
  );
};

export const updatePaymentStatus = async (projectId, paymentStatus, paidAmount) => {
  return await Project.findByIdAndUpdate(
    projectId,
    {
      $set: {
        payment_status: paymentStatus,
        paid_amount: paidAmount
      }
    },
    { new: true }
  );
};

export const addRatingAndFeedback = async (projectId, rating, feedback) => {
  return await Project.findByIdAndUpdate(
    projectId,
    {
      $set: { rating, feedback }
    },
    { new: true }
  );
};

export const getProjectStats = async (filters = {}) => {
  const stats = await Project.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total_amount' },
        paidAmount: { $sum: '$paid_amount' }
      }
    }
  ]);

  return stats;
};

export const getEditorWorkload = async (editorId) => {
  const activeProjects = await Project.countDocuments({
    editor_id: editorId,
    status: { $in: ['assigned', 'in_progress', 'ready_for_review', 'revision_requested'] }
  });

  return activeProjects;
};

export const findUnassignedProjects = async () => {
  return await Project.find({
    status: 'pending_assignment',
    editor_id: null
  })
    .populate('user_id', 'name email phone')
    .sort({ createdAt: 1 });
};

export const findProjectsDueSoon = async (hoursFromNow = 24) => {
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hoursFromNow);

  return await Project.find({
    status: { $in: ['assigned', 'in_progress', 'revision_requested'] },
    deadline: { $lte: deadline, $gte: new Date() }
  })
    .populate('user_id', 'name email')
    .populate('editor_id', 'name email')
    .sort({ deadline: 1 });
};

export const deleteProject = async (projectId) => {
  return await Project.findByIdAndDelete(projectId);
};
