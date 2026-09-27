const mongoose = require("mongoose");

const User = require("../models/User");
const Project = require("../models/Project");
const Milestone = require("../models/Milestone");
const Attendance = require("../models/Attendance");
const WorkOrder = require("../models/WorkOrder");
const MaterialRequest = require("../models/MaterialRequest");
const Report = require("../models/Report");
const Notification = require("../models/Notification");
const Equipment = require("../models/Equipment");
const Inventory = require("../models/Inventory");

const { parseAmountToCrores } = require("../utils/currency");

const ACTIVE_STATUSES = ["On Track", "Delayed", "At Risk"];

const ACTIVITY_SOURCES = [
  Notification,
  Report,
  MaterialRequest,
  WorkOrder,
  Milestone,
  Attendance,
];

const ALL_MODELS = [
  User,
  Project,
  Milestone,
  Attendance,
  WorkOrder,
  MaterialRequest,
  Report,
  Notification,
  Equipment,
  Inventory,
];

const createShortName = (name) =>
  name && name.length > 20 ? `${name.slice(0, 20)}...` : name || "Untitled";

// =====================================================
// LANDING COMMAND CENTER METRICS
// GET /api/dashboard/metrics  (public - aggregates only)
// =====================================================

const getLandingMetrics = async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(
      now.getTime() - 24 * 60 * 60 * 1000
    );

    // ==============================================
    // PROJECTS
    // ==============================================

    const projects = await Project.find().sort({
      updatedAt: -1,
    });

    const totalProjects = projects.length;

    const activeProjects = projects.filter(
      (project) => ACTIVE_STATUSES.includes(project.status)
    ).length;

    const completedProjects = projects.filter(
      (project) => project.status === "Completed"
    ).length;

    const statusCounts = projects.reduce(
      (acc, project) => {
        switch (project.status) {
          case "On Track":
            acc.onTrack++;
            break;
          case "Delayed":
            acc.delayed++;
            break;
          case "At Risk":
            acc.atRisk++;
            break;
          case "Completed":
            acc.completed++;
            break;
          default:
            break;
        }
        return acc;
      },
      { onTrack: 0, delayed: 0, atRisk: 0, completed: 0 }
    );

    const averageProgress =
      totalProjects > 0
        ? Math.round(
            projects.reduce(
              (total, project) =>
                total + (Number(project.progress) || 0),
              0
            ) / totalProjects
          )
        : 0;

    // ==============================================
    // BUDGET + CHART SERIES
    // ==============================================

    let totalBudget = 0;
    let totalSpent = 0;

    const projectProgressSeries = [];
    const budgetSeries = [];

    projects.slice(0, 6).forEach((project) => {
      const budget = parseAmountToCrores(project.budget);
      const spent = parseAmountToCrores(project.spent);

      totalBudget += budget;
      totalSpent += spent;

      const name = createShortName(project.name);

      projectProgressSeries.push({
        name,
        progress: Number(project.progress) || 0,
        status: project.status,
      });

      budgetSeries.push({
        name,
        budget: Number(budget.toFixed(2)),
        spent: Number(spent.toFixed(2)),
      });
    });

    const budgetUtilization =
      totalBudget > 0
        ? Math.round((totalSpent / totalBudget) * 100)
        : 0;

    // ==============================================
    // MILESTONES + ACTIVE STAGE
    // ==============================================

    const milestones = await Milestone.find().sort({
      createdAt: 1,
    });

    const milestoneList = milestones.map((milestone) => ({
      id: milestone._id,
      phase: milestone.phase,
      project: milestone.project,
      date: milestone.date,
      status: milestone.status,
      badge: milestone.badge,
      progress: Number(milestone.progress) || 0,
      amount: milestone.amount,
      verifiedBy: milestone.verifiedBy,
      clientApproved: Boolean(milestone.clientApproved),
    }));

    const inProgress = milestones
      .filter(
        (milestone) =>
          (Number(milestone.progress) || 0) > 0 &&
          (Number(milestone.progress) || 0) < 100
      )
      .sort(
        (a, b) =>
          (Number(b.progress) || 0) -
          (Number(a.progress) || 0)
      );

    const currentStage =
      inProgress[0] || milestones[0] || null;

    const stage = currentStage
      ? {
          name: String(currentStage.phase || "").replace(
            /^Phase\s*\d+:\s*/i,
            ""
          ),
          project: currentStage.project,
          progress: Number(currentStage.progress) || 0,
          status: currentStage.status || "In Progress",
        }
      : null;

    // ==============================================
    // CREW (from attendance + worker roles)
    // ==============================================

    const attendances = await Attendance.find().select(
      "userName date status"
    );

    const uniqueDates = [
      ...new Set(attendances.map((a) => a.date)),
    ].sort();

    const latestDate =
      uniqueDates[uniqueDates.length - 1] || null;

    const latestCrewRecords = latestDate
      ? attendances.filter(
          (attendance) => attendance.date === latestDate
        )
      : [];

    const activeCrew = latestCrewRecords.filter(
      (attendance) =>
        ["Present", "Late"].includes(attendance.status)
    ).length;

    const crewFromAttendance = new Set(
      attendances.map((attendance) => attendance.userName)
    ).size;

    const crewFromUsers = await User.countDocuments({
      role: { $in: ["worker", "site_engineer", "contractor"] },
    });

    const totalCrew = Math.max(
      crewFromAttendance,
      crewFromUsers
    );

    // ==============================================
    // USERS
    // ==============================================

    const totalUsers = await User.countDocuments();

    const roleDistribution = {};
    const roleStats = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    roleStats.forEach((item) => {
      roleDistribution[item._id] = item.count;
    });

    // ==============================================
    // ACTIVITY STREAM
    // ==============================================

    const [materialReqs, reports, notifications, workOrders] =
      await Promise.all([
        MaterialRequest.find().sort({ createdAt: -1 }).limit(3),
        Report.find().sort({ createdAt: -1 }).limit(3),
        Notification.find().sort({ createdAt: -1 }).limit(4),
        WorkOrder.find().sort({ createdAt: -1 }).limit(3),
      ]);

    const activityItems = [
      ...materialReqs.map((req) => ({
        id: `material-${req._id}`,
        title: req.material || "Material request",
        description: `Status: ${req.status || "Pending"} · ${req.site || ""}`,
        time: req.createdAt,
        type: "material",
      })),
      ...reports.map((report) => ({
        id: `report-${report._id}`,
        title: report.title || "Report",
        description: `${report.type || "Report"} · ${report.author || ""}`,
        time: report.createdAt,
        type: "report",
      })),
      ...notifications.map((notification) => ({
        id: `notification-${notification._id}`,
        title: notification.title || "Notification",
        description: notification.message || "",
        time: notification.createdAt,
        type: "notification",
      })),
      ...workOrders.map((workOrder) => ({
        id: `workorder-${workOrder._id}`,
        title: workOrder.title || "Work order",
        description: `${workOrder.status || "In Progress"} · ${workOrder.zone || workOrder.trade || ""}`,
        time: workOrder.createdAt,
        type: "workorder",
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 6);

    // ==============================================
    // DAILY ACTIVITY (events in the last 24 hours)
    // ==============================================

    const dailyCounts = await Promise.all(
      ACTIVITY_SOURCES.map((Model) =>
        Model.countDocuments({
          createdAt: { $gte: last24Hours },
        })
      )
    );

    const dailyActivity = dailyCounts.reduce(
      (total, count) => total + count,
      0
    );

    // ==============================================
    // SYSTEM HEALTH
    // ==============================================

    const connectionState = mongoose.connection.readyState;
    const operational = connectionState === 1;

    const recordCounts = await Promise.all(
      ALL_MODELS.map((Model) => Model.countDocuments())
    );

    const totalRecords = recordCounts.reduce(
      (total, count) => total + count,
      0
    );

    // ==============================================
    // RESPONSE
    // ==============================================

    res.status(200).json({
      success: true,
      fetchedAt: now.toISOString(),

      projectManager: {
        stage,
        progress: averageProgress,
        budgetUtilization,
        budget: {
          total: Number(totalBudget.toFixed(2)),
          spent: Number(totalSpent.toFixed(2)),
          remaining: Number(
            Math.max(totalBudget - totalSpent, 0).toFixed(2)
          ),
        },
        activeCrew: {
          active: activeCrew,
          total: totalCrew,
        },
        projectProgressSeries,
        budgetSeries,
        milestones: milestoneList,
        activity: activityItems,
      },

      administrator: {
        users: totalUsers,
        activeProjects,
        totalProjects,
        completedProjects,
        dailyActivity,
        roleDistribution,
        projectStatus: statusCounts,
        systemHealth: {
          operational,
          database:
            connectionState === 1 ? "connected" : "disconnected",
          dbName: mongoose.connection.name || "",
          dataModels: ALL_MODELS.length,
          totalRecords,
        },
      },
    });
  } catch (error) {
    console.error("Landing Metrics Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard metrics",
    });
  }
};

module.exports = { getLandingMetrics };