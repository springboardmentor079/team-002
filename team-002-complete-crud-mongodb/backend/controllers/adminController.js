const User = require("../models/User");
const Project = require("../models/Project");
const MaterialRequest = require("../models/MaterialRequest");
const Notification = require("../models/Notification");
const Milestone = require("../models/Milestone");


// ================= ADMIN DASHBOARD =================

const getDashboardData = async (req, res) => {
  try {
    // ==========================================
    // USERS
    // ==========================================

    const totalUsers = await User.countDocuments();

    const roleStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    const roleDistribution = {};

    roleStats.forEach((item) => {
      roleDistribution[item._id] = item.count;
    });

    const recentUsers = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    // ==========================================
    // PROJECTS
    // ==========================================

    const totalProjects = await Project.countDocuments();

    const activeProjects = await Project.countDocuments({
      status: {
        $in: ["On Track", "Delayed", "At Risk"],
      },
    });

    const completedProjects = await Project.countDocuments({
      status: "Completed",
    });

    const projectStatusStats = await Project.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const projectStatusDistribution = {};

    projectStatusStats.forEach((item) => {
      projectStatusDistribution[item._id] = item.count;
    });

    const recentProjects = await Project.find()
      .select("name status updatedAt createdAt")
      .sort({ updatedAt: -1 })
      .limit(5);

    // ==========================================
    // MATERIAL REQUESTS
    // ==========================================

    const pendingApprovals =
      await MaterialRequest.countDocuments({
        status: "Pending Approval",
      });

    // ==========================================
    // SYSTEM ALERTS
    // ==========================================

    const systemAlerts =
      await Notification.countDocuments({
        read: false,
        type: {
          $in: ["alert", "warning"],
        },
      });

    // ==========================================
    // RECENT ACTIVITIES
    // ==========================================

    const userActivities = recentUsers.map((user) => ({
      id: `user-${user._id}`,
      title: "New user registered",
      description: `${user.name} joined the platform.`,
      time: user.createdAt,
      type: "user",
    }));

    const projectActivities = recentProjects.map((project) => ({
      id: `project-${project._id}`,
      title: `Project '${project.name}' updated`,
      description: `Project status: ${project.status}`,
      time: project.updatedAt || project.createdAt,
      type: "project",
    }));

    const recentActivities = [
      ...userActivities,
      ...projectActivities,
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 6);

    // ==========================================
    // SYSTEM ANALYTICS - LAST 30 DAYS
    // ==========================================

    const now = new Date();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const usersLast30Days = await User.find({
      createdAt: {
        $gte: thirtyDaysAgo,
      },
    }).select("createdAt");

    const projectsLast30Days = await Project.find({
      createdAt: {
        $gte: thirtyDaysAgo,
      },
    }).select("createdAt");

    const analyticsData = [];

    for (let i = 4; i >= 0; i--) {
      const pointDate = new Date();

      pointDate.setDate(now.getDate() - i * 7);

      const usersCount = usersLast30Days.filter(
        (user) =>
          new Date(user.createdAt) <= pointDate
      ).length;

      const projectsCount = projectsLast30Days.filter(
        (project) =>
          new Date(project.createdAt) <= pointDate
      ).length;

      analyticsData.push({
        date: pointDate.toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
          }
        ),

        users: usersCount,
        projects: projectsCount,
      });
    }

    // ==========================================
    // API RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalProjects,
        activeProjects,
        completedProjects,
        pendingApprovals,
        systemAlerts,
      },

      roleDistribution,
      projectStatusDistribution,
      recentUsers,
      recentActivities,
      analyticsData,

      admin: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};

// =====================================================
// ADMIN SITE PROGRESS
// GET /api/admin/site-progress
// =====================================================

const getSiteProgressData = async (req, res) => {
  try {
    // ==========================================
    // TOTAL ACTIVE SITES
    // ==========================================

    const totalActiveSites =
      await Project.countDocuments({
        status: {
          $in: ["On Track", "Delayed", "At Risk"],
        },
      });

    // ==========================================
    // ALL MILESTONES
    // ==========================================

    const milestones = await Milestone.find()
      .sort({ createdAt: 1 });

    const totalMilestones = milestones.length;

    // ==========================================
    // AVERAGE COMPLETION
    // ==========================================

    let averageCompletion = 0;

    if (totalMilestones > 0) {
      const totalProgress =
        milestones.reduce(
          (total, milestone) =>
            total + (milestone.progress || 0),
          0
        );

      averageCompletion =
        Math.round(
          (totalProgress / totalMilestones) * 10
        ) / 10;
    }

    // ==========================================
    // ACTIVE DELAYS
    // ==========================================

    const activeDelays =
      milestones.filter((milestone) => {
        const status =
          milestone.status?.toLowerCase() || "";

        return (
          status.includes("delayed") ||
          status.includes("delay")
        );
      });

    const activeDelaysCount =
      activeDelays.length;

    // Critical delays
    const criticalDelays =
      activeDelays.filter(
        (milestone) =>
          (milestone.progress || 0) < 50
      ).length;

    // ==========================================
    // FIELD ENGINEERS
    // ==========================================

    const fieldEngineers =
  await User.countDocuments({
    role: "site_engineer",
  });

    // ==========================================
    // PHASES IN PROGRESS
    // ==========================================

    const phasesInProgress =
      milestones.filter(
        (milestone) =>
          milestone.progress > 0 &&
          milestone.progress < 100
      ).length;

    // ==========================================
    // STATUS DISTRIBUTION
    // ==========================================

    const phaseStatusDistribution = {
      completed: 0,
      inProgress: 0,
      starting: 0,
      delayed: 0,
    };

    milestones.forEach((milestone) => {
      const status =
        milestone.status?.toLowerCase() || "";

      if (
        milestone.progress >= 100 ||
        status.includes("completed")
      ) {
        phaseStatusDistribution.completed++;
      } else if (
        status.includes("delayed") ||
        status.includes("delay")
      ) {
        phaseStatusDistribution.delayed++;
      } else if (milestone.progress > 0) {
        phaseStatusDistribution.inProgress++;
      } else {
        phaseStatusDistribution.starting++;
      }
    });

    // ==========================================
    // DELAYED MILESTONES
    // FOR SITE DELAY TRACKER
    // ==========================================

    const delayedMilestones =
      activeDelays.map((milestone) => ({
        _id: milestone._id,
        phase: milestone.phase,
        project: milestone.project,
        date: milestone.date,
        status: milestone.status,
        progress: milestone.progress,
        amount: milestone.amount,
      }));

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,

      stats: {
        totalActiveSites,
        averageCompletion,
        activeDelays: activeDelaysCount,
        criticalDelays,
        fieldEngineers,
        phasesInProgress,
        totalMilestones,
      },

      phaseStatusDistribution,

      milestones,

      delayedMilestones,
    });
  } catch (error) {
    console.error(
      "Site Progress Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch site progress data",
    });
  }
};

module.exports = {
  getDashboardData,
  getSiteProgressData,
};