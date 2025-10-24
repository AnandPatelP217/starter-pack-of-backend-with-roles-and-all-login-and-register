/**
 * ---------------------------
 * ADMIN SERVICE
 * ---------------------------
 * Business logic for admin operations
 */

import { User, Editor, Customer, Admin } from '../models/user.model.js';
import Project from '../models/project.model.js';
import Payment from '../models/payment.model.js';
import Payout from '../models/payout.model.js';
import AppError from '../utils/AppError.js';

export const getDashboardAnalyticsService = async (period) => {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'day':
      startDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }
  
  const [
    totalUsers,
    newUsers,
    totalEditors,
    activeEditors,
    totalProjects,
    completedProjects,
    activeProjects,
    cancelledProjects,
    totalRevenue,
    pendingPayments,
    editorPayouts,
    pendingPayouts
  ] = await Promise.all([
    Customer.countDocuments(),
    Customer.countDocuments({ createdAt: { $gte: startDate } }),
    Editor.countDocuments({ application_status: 'approved' }),
    Editor.countDocuments({ isAvailable: true, application_status: 'approved' }),
    Project.countDocuments({ createdAt: { $gte: startDate } }),
    Project.countDocuments({ status: 'completed', createdAt: { $gte: startDate } }),
    Project.countDocuments({ status: { $in: ['assigned', 'in_progress', 'ready_for_review', 'revision_requested'] } }),
    Project.countDocuments({ status: 'cancelled', createdAt: { $gte: startDate } }),
    Payment.aggregate([
      { $match: { status: 'completed', completed_at: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payout.aggregate([
      { $match: { status: 'completed', completed_at: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]),
    Payout.aggregate([
      { $match: { status: { $in: ['pending', 'processing'] } } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ])
  ]);

  // Get project status breakdown
  const projectStatusBreakdown = await Project.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Get top editors
  const topEditors = await Editor.aggregate([
    { 
      $match: { 
        application_status: 'approved',
        total_projects_completed: { $gt: 0 }
      } 
    },
    {
      $project: {
        name: 1,
        email: 1,
        total_projects_completed: 1,
        average_rating: 1,
        total_earnings: 1
      }
    },
    { $sort: { total_projects_completed: -1 } },
    { $limit: 10 }
  ]);

  // Get recent projects
  const recentProjects = await Project.find()
    .populate('user_id', 'name email')
    .populate('editor_id', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

  const totalRevenueAmount = totalRevenue[0]?.total || 0;
  const editorPayoutsAmount = editorPayouts[0]?.total || 0;
  
  return {
    period,
    timestamp: new Date(),
    users: {
      total: totalUsers,
      new_in_period: newUsers,
      growth_rate: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0
    },
    editors: {
      total: totalEditors,
      active: activeEditors,
      availability_rate: totalEditors > 0 ? ((activeEditors / totalEditors) * 100).toFixed(2) : 0
    },
    projects: {
      total: totalProjects,
      completed: completedProjects,
      active: activeProjects,
      cancelled: cancelledProjects,
      completion_rate: totalProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(2) : 0,
      status_breakdown: projectStatusBreakdown
    },
    revenue: {
      total: totalRevenueAmount,
      pending: pendingPayments[0]?.total || 0,
      editor_payouts: editorPayoutsAmount,
      pending_payouts: pendingPayouts[0]?.total || 0,
      net_revenue: totalRevenueAmount - editorPayoutsAmount,
      profit_margin: totalRevenueAmount > 0 ? (((totalRevenueAmount - editorPayoutsAmount) / totalRevenueAmount) * 100).toFixed(2) : 0
    },
    top_editors: topEditors,
    recent_projects: recentProjects
  };
};

export const getMonthlyReportService = async (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const [
    projectStats,
    revenueStats,
    payoutStats
  ] = await Promise.all([
    Project.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total_amount' }
        }
      }
    ]),
    Payment.aggregate([
      { $match: { completed_at: { $gte: startDate, $lte: endDate }, status: 'completed' } },
      {
        $group: {
          _id: '$payment_gateway',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]),
    Payout.aggregate([
      { $match: { completed_at: { $gte: startDate, $lte: endDate }, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalPayouts: { $sum: 1 },
          totalAmount: { $sum: '$total_amount' }
        }
      }
    ])
  ]);

  return {
    month,
    year,
    period: `${year}-${String(month).padStart(2, '0')}`,
    projects: projectStats,
    revenue: revenueStats,
    payouts: payoutStats[0] || { totalPayouts: 0, totalAmount: 0 }
  };
};
