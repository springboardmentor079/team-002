const Project = require("../models/Project");
const WorkOrder = require("../models/WorkOrder");
const MaterialRequest = require("../models/MaterialRequest");
const Equipment = require("../models/Equipment");
const Milestone = require("../models/Milestone");
const Attendance = require("../models/Attendance");
const Notification = require("../models/Notification");
const Report = require("../models/Report");

const { parseAmountToCrores } = require("../utils/currency");

const parseAmount = parseAmountToCrores;

const formatCrores = (amount) => {
  return `₹ ${Number(amount || 0).toFixed(1)} Cr`;
};

// Build a query that matches the logged-in user's name or email,
// falling back to an empty match so dashboards never break.
const matchUser = (user, field) => {
  if (!user) return {};
  return {
    $or: [{ [field]: user.name }, { [field]: user.email }],
  };
};

// Extract role-relevant notifications (all + current role)
const getNotificationsForRole = async (user) => {
  const notifications = await Notification.find({
    $or: [{ role: "all" }, { role: user.role }],
  })
    .sort({ createdAt: -1 })
    .limit(6);

  return {
    list: notifications,
    unread: notifications.filter((n) => !n.read).length,
    totalUnread: await Notification.countDocuments({
      $or: [{ role: "all" }, { role: user.role }],
      read: false,
    }),
  };
};

// =====================================================
// SITE ENGINEER DASHBOARD
// GET /api/dashboard/site-engineer
// =====================================================

const getSiteEngineerDashboard = async (req, res) => {
  try {
    const user = req.user;

    // ---------------- PROJECTS ----------------
    const projects = await Project.find().sort({ updatedAt: -1 });
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) =>
      ["On Track", "Delayed", "At Risk"].includes(p.status)
    ).length;

    // ---------------- MILESTONES / SITE PROGRESS ----------------
    const milestones = await Milestone.find().sort({ createdAt: 1 });

    const totalMilestones = milestones.length;

    let averageCompletion = 0;
    if (totalMilestones > 0) {
      averageCompletion =
        Math.round(
          (milestones.reduce((t, m) => t + (m.progress || 0), 0) /
            totalMilestones) *
            10
        ) / 10;
    }

    const activeDelays = milestones.filter((m) => {
      const status = m.status?.toLowerCase() || "";
      return status.includes("delayed") || status.includes("delay");
    });

    const criticalDelays = activeDelays.filter(
      (m) => (m.progress || 0) < 50
    ).length;

    const phasesInProgress = milestones.filter(
      (m) => m.progress > 0 && m.progress < 100
    ).length;

    const delayedMilestones = activeDelays.map((m) => ({
      _id: m._id,
      phase: m.phase,
      project: m.project,
      date: m.date,
      status: m.status,
      progress: m.progress,
      amount: m.amount,
    }));

    const phaseStatusDistribution = {
      completed: 0,
      inProgress: 0,
      starting: 0,
      delayed: 0,
    };

    milestones.forEach((m) => {
      const status = m.status?.toLowerCase() || "";
      if (m.progress >= 100 || status.includes("completed")) {
        phaseStatusDistribution.completed++;
      } else if (status.includes("delayed") || status.includes("delay")) {
        phaseStatusDistribution.delayed++;
      } else if (m.progress > 0) {
        phaseStatusDistribution.inProgress++;
      } else {
        phaseStatusDistribution.starting++;
      }
    });

    // ---------------- TODAY'S TASKS ----------------
    const todayKey = new RegExp(
      new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      "i"
    );

    const reportsToday = await Report.find({
      $or: [{ date: /Today/i }, { date: todayKey }],
    })
      .sort({ createdAt: -1 })
      .limit(6);

    const inspectionsToday = await Report.countDocuments({
      type: "Inspection",
      $or: [{ date: /Today/i }, { date: todayKey }],
    });

    const attendance = await Attendance.find().sort({ createdAt: -1 }).limit(6);

    const attendanceToday = await Attendance.countDocuments({
      $or: [{ date: /Today/i }, { date: todayKey }],
    });

    // ---------------- MATERIAL & EQUIPMENT STATUS ----------------
    const materialRequests = await MaterialRequest.find().sort({ createdAt: -1 });

    const materialStatus = {
      pending: materialRequests.filter((r) => r.status === "Pending Approval").length,
      approved: materialRequests.filter((r) => r.status === "Approved").length,
      inTransit: materialRequests.filter((r) => r.status === "In Transit").length,
      delivered: materialRequests.filter((r) => r.status === "Delivered").length,
      rejected: materialRequests.filter((r) => r.status === "Rejected").length,
    };

    const equipment = await Equipment.find().sort({ createdAt: -1 });

    const equipmentStatus = {
      operational: equipment.filter((e) => e.status === "Operational" || e.status === "In Use").length,
      scheduled: equipment.filter((e) => e.status === "Scheduled Delivery" || e.status === "Standby").length,
      maintenance: equipment.filter((e) => e.status === "Maintenance").length,
      total: equipment.length,
    };

    // ---------------- RECENT SITE ACTIVITIES ----------------
    const recentActivities = reportsToday.map((report) => ({
      _id: report._id,
      title: report.title,
      location: report.location,
      status: report.status === "Approved" ? "Passed" : report.status,
      time: report.date,
      type: report.type?.toLowerCase().includes("inspection")
        ? "inspection"
        : report.type?.toLowerCase().includes("safety")
        ? "issue"
        : "report",
    }));

    const notifications = await getNotificationsForRole(user);

    res.status(200).json({
      success: true,
      stats: {
        totalProjects,
        activeProjects,
        totalMilestones,
        averageCompletion,
        activeDelays: activeDelays.length,
        criticalDelays,
        phasesInProgress,
        inspectionsToday,
        attendanceToday,
        machineryOnSite: equipmentStatus.operational + equipmentStatus.scheduled,
        equipmentTotal: equipmentStatus.total,
        pendingMaterials: materialStatus.pending,
      },
      milestones,
      delayedMilestones,
      phaseStatusDistribution,
      materialStatus,
      equipment,
      equipmentStatus,
      attendance,
      materialRequests: materialRequests.slice(0, 6),
      recentActivities,
      notifications: notifications.list,
      notificationsUnread: notifications.totalUnread,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Site Engineer Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch site engineer dashboard data",
    });
  }
};

// =====================================================
// CONTRACTOR DASHBOARD
// GET /api/dashboard/contractor
// =====================================================

const getContractorDashboard = async (req, res) => {
  try {
    const user = req.user;

    // ---------------- WORK ORDERS ----------------
    let workOrderQuery = {};
    const byLead = await WorkOrder.countDocuments(matchUser(user, "lead"));
    if (byLead > 0) workOrderQuery = matchUser(user, "lead");

    const workOrders = await WorkOrder.find(workOrderQuery).sort({ createdAt: -1 });

    const totalWorkOrders = workOrders.length;
    const activeWork = workOrders.filter((wo) =>
      ["On Schedule", "In Progress"].includes(wo.status)
    ).length;
    const completedWork = workOrders.filter((wo) => wo.status === "Completed").length;
    const pendingWork = workOrders.filter((wo) => wo.status === "Delayed").length;

    const workOrderStatus = {
      onSchedule: workOrders.filter((wo) => wo.status === "On Schedule").length,
      inProgress: workOrders.filter((wo) => wo.status === "In Progress").length,
      delayed: workOrders.filter((wo) => wo.status === "Delayed").length,
      completed: workOrders.filter((wo) => wo.status === "Completed").length,
    };

    // ---------------- MATERIAL REQUESTS ----------------
    let materialQuery = {};
    const byRequested = await MaterialRequest.countDocuments(
      matchUser(user, "requestedBy")
    );
    if (byRequested > 0) materialQuery = matchUser(user, "requestedBy");

    const materialRequests = await MaterialRequest.find(materialQuery).sort({
      createdAt: -1,
    });

    const materialStatus = {
      pending: materialRequests.filter((r) => r.status === "Pending Approval").length,
      approved: materialRequests.filter((r) => r.status === "Approved").length,
      inTransit: materialRequests.filter((r) => r.status === "In Transit").length,
      delivered: materialRequests.filter((r) => r.status === "Delivered").length,
      rejected: materialRequests.filter((r) => r.status === "Rejected").length,
    };

    // ---------------- PROJECT PROGRESS ----------------
    const projects = await Project.find().sort({ updatedAt: -1 });

    const projectProgress = projects.slice(0, 6).map((p) => ({
      _id: p._id,
      name: p.name,
      progress: Number(p.progress) || 0,
      status: p.status,
    }));

    // ---------------- PAYMENT / AMOUNT DATA ----------------
    let totalDisbursed = 0;
    let totalContractAmount = 0;

    const milestones = await Milestone.find();

    milestones.forEach((m) => {
      const amount = parseAmount(m.amount);
      totalContractAmount += amount;
      if (m.clientApproved || m.progress >= 100) {
        totalDisbursed += amount;
      }
    });

    // ---------------- WORKFORCE / ATTENDANCE ----------------
    const attendance = await Attendance.find().sort({ createdAt: -1 });

    const todayAttendance = attendance.filter(
      (a) => a.date === "Today" || /Today/i.test(a.date || "")
    );

    const totalCrew = todayAttendance.length || attendance.length;

    const presentToday = todayAttendance.filter((a) => a.status === "Present").length;
    const attendanceRate =
      todayAttendance.length > 0
        ? Math.round((presentToday / todayAttendance.length) * 100)
        : attendance.length > 0
        ? Math.round(
            (attendance.filter((a) => a.status === "Present").length /
              attendance.length) *
              100
          )
        : 0;

    const equipmentDeployed = await Equipment.countDocuments({
      status: { $in: ["Operational", "In Use"] },
    });

    const workforceData = attendance.reduce((acc, curr) => {
      const trade = curr.trade || "General Site Labor";
      acc[trade] = (acc[trade] || 0) + 1;
      return acc;
    }, {});

    const workforceDistribution = [
      {
        name: "Supervisors & Engineers",
        value: (workforceData["Supervisors & Engineers"] || 0) +
          (workforceData["Supervisor"] || 0),
        color: "#3b82f6",
      },
      {
        name: "Masons & Structural",
        value: (workforceData["Masons & Structural"] || 0) +
          (workforceData["Skilled Masonry & Rebar"] || 0),
        color: "#f59e0b",
      },
      {
        name: "Electricians & MEP",
        value: workforceData["Electricians & MEP"] || 0,
        color: "#10b981",
      },
      {
        name: "Carpenters & Riggers",
        value: workforceData["Carpenters & Riggers"] || 0,
        color: "#8b5cf6",
      },
      {
        name: "General Site Labor",
        value: workforceData["General Site Labor"] || 0,
        color: "#64748b",
      },
    ].map((item) => ({ ...item, value: item.value || 0 }));

    const notifications = await getNotificationsForRole(user);

    res.status(200).json({
      success: true,
      stats: {
        totalWorkOrders,
        activeWork,
        completedWork,
        pendingWork,
        totalMaterialRequests: materialRequests.length,
        pendingMaterialRequests: materialStatus.pending,
        totalCrew: Number(totalCrew) || 0,
        attendanceRate,
        equipmentDeployed,
      },
      workOrders: workOrders.slice(0, 6),
      workOrderStatus,
      materialRequests: materialRequests.slice(0, 6),
      materialStatus,
      projectProgress,
      workforceData: workforceDistribution,
      financialData: {
        totalContractAmount: Number(totalContractAmount.toFixed(2)),
        totalDisbursed: Number(totalDisbursed.toFixed(2)),
        totalContractAmountLabel: formatCrores(totalContractAmount),
        totalDisbursedLabel: formatCrores(totalDisbursed),
      },
      notifications: notifications.list,
      notificationsUnread: notifications.totalUnread,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Contractor Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contractor dashboard data",
    });
  }
};

// =====================================================
// WORKER DASHBOARD
// GET /api/dashboard/worker
// =====================================================

const getWorkerDashboard = async (req, res) => {
  try {
    const user = req.user;

    // ---------------- ASSIGNED TASKS (WORK ORDERS) ----------------
    let workOrderQuery = {};
    const byLead = await WorkOrder.countDocuments(matchUser(user, "lead"));
    if (byLead > 0) workOrderQuery = matchUser(user, "lead");

    const workOrders = await WorkOrder.find(workOrderQuery).sort({ createdAt: -1 });

    const assignedTasks = workOrders.length;
    const completedTasks = workOrders.filter((wo) => wo.status === "Completed").length;
    const pendingTasks = workOrders.filter((wo) => wo.status !== "Completed").length;
    const inProgressTasks = workOrders.filter((wo) =>
      ["In Progress", "On Schedule"].includes(wo.status)
    ).length;

    const tasks = workOrders.slice(0, 6).map((wo) => ({
      _id: wo._id,
      title: wo.title,
      zone: wo.zone,
      status: wo.status === "Completed" ? "Completed" : wo.progress > 0 ? "In Progress" : "Pending",
      progress: wo.progress || 0,
    }));

    // ---------------- ATTENDANCE ----------------
    const attendance = await Attendance.find({
      $or: [{ userName: user.name }, { userEmail: user.email }],
    }).sort({ createdAt: -1 });

    const todayRecord = attendance.find(
      (a) => a.date === "Today" || /Today/i.test(a.date || "")
    );

    const presentCount = attendance.filter((a) => a.status === "Present").length;
    const attendanceRate =
      attendance.length > 0
        ? Math.round((presentCount / attendance.length) * 100)
        : 0;

    // ---------------- WORK PROGRESS (MILESTONES) ----------------
    const milestones = await Milestone.find().sort({ createdAt: 1 });

    const workProgress = milestones.slice(0, 6).map((m) => ({
      _id: m._id,
      phase: m.phase,
      progress: Number(m.progress) || 0,
      status: m.status,
    }));

    const overallProgress =
      milestones.length > 0
        ? Math.round(
            milestones.reduce((t, m) => t + (m.progress || 0), 0) /
              milestones.length
          )
        : 0;

    const notifications = await getNotificationsForRole(user);

    res.status(200).json({
      success: true,
      stats: {
        assignedTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        hoursThisWeek: todayRecord?.checkIn ? "Punched In" : "--",
        checkIn: todayRecord?.checkIn || "--",
        monthlyAttendance: `${presentCount} Days`,
        attendanceRate,
        // No backend safety/PPE model exists yet, so compliance is 0 (empty state)
        safetyCompliance: 0,
        assignedSite: todayRecord?.site || "Assigned Site",
        shift: todayRecord?.shift || "Not on shift today",
      },
      tasks,
      workOrders,
      attendance: attendance.slice(0, 10),
      todayRecord,
      workProgress,
      overallProgress,
      notifications: notifications.list,
      notificationsUnread: notifications.totalUnread,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Worker Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch worker dashboard data",
    });
  }
};

// =====================================================
// CLIENT DASHBOARD
// GET /api/dashboard/client
// =====================================================

const getClientDashboard = async (req, res) => {
  try {
    const user = req.user;

    // A client only sees projects assigned by clientId, name or email.
    const projectQuery = {
      $or: [
        { clientId: user._id },
        { client: user.name },
        { client: user.email },
      ],
    };
    const projects = await Project.find(projectQuery).sort({ updatedAt: -1 });
    const projectIds = projects.map((p) => p._id);
    const projectNames = projects.map((p) => p.name);

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p =>
      ["On Track", "Delayed", "At Risk"].includes(p.status)
    ).length;
    const completedProjects = projects.filter(p => p.status === "Completed").length;
    const overallProgress = totalProjects
      ? Math.round(projects.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / totalProjects)
      : 0;

    let totalBudget = 0;
    let totalSpent = 0;
    projects.forEach(p => {
      totalBudget += parseAmount(p.budget);
      totalSpent += parseAmount(p.spent);
    });
    const remainingBudget = Math.max(totalBudget - totalSpent, 0);
    const budgetUtilization = totalBudget ? Math.round(totalSpent / totalBudget * 100) : 0;

    const milestones = await Milestone.find({
      project: { $in: projectNames },
    }).sort({ createdAt: 1 });

    const totalMilestones = milestones.length;
    const signedMilestones = milestones.filter(m => m.clientApproved || m.progress >= 100).length;
    const nextHandover = projects.reduce((earliest, p) => {
      if (!earliest) return p;
      return String(earliest.endDate) <= String(p.endDate) ? earliest : p;
    }, null);

    const reports = await Report.find({
      $or: [
        { projectId: { $in: projectIds } },
        { project: { $in: projectNames } },
      ],
    }).sort({ createdAt: -1 }).limit(20);

    const siteUpdates = reports.slice(0, 6).map(r => ({
      _id: r._id,
      title: r.title,
      desc: r.summary || `Report logged at ${r.location || "site"}.`,
      date: r.date,
      type: r.type?.toLowerCase().includes("inspection") ? "verified"
        : r.type?.toLowerCase().includes("safety") ? "info" : "media",
      badge: r.status || "Submitted",
    }));

    const notifications = await getNotificationsForRole(user);

    res.status(200).json({
      success: true,
      stats: {
        totalProjects, activeProjects, completedProjects, overallProgress,
        totalBudget: Number(totalBudget.toFixed(2)),
        totalSpent: Number(totalSpent.toFixed(2)),
        remainingBudget: Number(remainingBudget.toFixed(2)),
        budgetUtilization,
        totalBudgetLabel: formatCrores(totalBudget),
        totalSpentLabel: formatCrores(totalSpent),
        remainingBudgetLabel: formatCrores(remainingBudget),
        signedMilestones, totalMilestones,
        nextHandover: nextHandover?.endDate || "--",
      },
      projects,
      milestones,
      financialData: {
        totalBudget: Number(totalBudget.toFixed(2)),
        totalSpent: Number(totalSpent.toFixed(2)),
        remainingBudget: Number(remainingBudget.toFixed(2)),
        budgetUtilization,
        totalBudgetLabel: formatCrores(totalBudget),
        totalSpentLabel: formatCrores(totalSpent),
        remainingBudgetLabel: formatCrores(remainingBudget),
      },
      siteUpdates,
      notifications: notifications.list,
      notificationsUnread: notifications.totalUnread,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Client Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch client dashboard data" });
  }
};
module.exports = {
  getSiteEngineerDashboard,
  getContractorDashboard,
  getWorkerDashboard,
  getClientDashboard,
};