const Project = require("../models/Project");
const Notification = require("../models/Notification");

const { parseAmountToCrores } = require("../utils/currency");

const parseAmount = parseAmountToCrores;

// =====================================================
// GET ALL PROJECTS
// GET /api/projects
// =====================================================

const getProjects = async (req, res) => {
  try {
    let query = {};

    if (req.user && req.user.role === "project_manager") {
      query.manager = req.user.name;
    }

    const projects = await Project.find(query)
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Get Projects Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};

// =====================================================
// GET SINGLE PROJECT
// GET /api/projects/:id
// =====================================================

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get Project Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
    });
  }
};

// =====================================================
// CREATE PROJECT
// POST /api/projects
// =====================================================

const createProject = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      client,
      manager,
      location,
      budget,
      spent,
      status,
      progress,
      startDate,
      endDate,
      priority,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      name,
      code,
      description,
      client,
      manager:
        manager ||
        req.user?.name ||
        "Project Manager",
      location,
      budget,
      spent: spent || "₹ 0.0 Cr",
      status,
      progress,
      startDate,
      endDate,
      priority,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Create Project Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create project",
    });
  }
};

// =====================================================
// UPDATE PROJECT
// PUT /api/projects/:id
// =====================================================

const updateProject = async (req, res) => {
  try {
    const oldProject = await Project.findById(req.params.id);
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (oldProject && req.body.status && oldProject.status !== req.body.status) {
      try {
        await Notification.create({
          title: "Project Status Updated",
          message: `Project ${project.name} is now marked as ${project.status}.`,
          role: "all",
          type: req.body.status === "Delayed" || req.body.status === "At Risk" ? "warning" : "info"
        });
      } catch (notifErr) {
        console.error("Failed to create project notification:", notifErr);
      }
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Update Project Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update project",
    });
  }
};

// =====================================================
// DELETE PROJECT
// DELETE /api/projects/:id
// =====================================================

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete Project Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};

// =====================================================
// PROJECT MANAGER DASHBOARD
// GET /api/projects/dashboard
// =====================================================

const getProjectDashboardData = async (req, res) => {
  try {
    // ================================================
    // GET PROJECTS
    // ================================================

    let query = {};

    /*
      If the logged-in user is a project manager,
      show projects assigned to that manager.

      Admin can see all projects.

      If the manager's name does not match any project
      (e.g. freshly registered user), fall back to all
      projects so the dashboard is never empty.
    */

    if (
      req.user &&
      req.user.role === "project_manager"
    ) {
      const assignedCount = await Project.countDocuments({
        manager: req.user.name,
      });

      if (assignedCount > 0) {
        query.manager = req.user.name;
      }
    }

    const projects = await Project.find(query)
      .sort({ updatedAt: -1 });

    // ================================================
    // BASIC STATISTICS
    // ================================================

    const totalProjects = projects.length;

    const activeProjects = projects.filter(
      (project) =>
        [
          "On Track",
          "Delayed",
          "At Risk",
        ].includes(project.status)
    ).length;

    const completedProjects = projects.filter(
      (project) =>
        project.status === "Completed"
    ).length;

    const delayedProjects = projects.filter(
      (project) =>
        project.status === "Delayed"
    ).length;

    const atRiskProjects = projects.filter(
      (project) =>
        project.status === "At Risk"
    ).length;

    // ================================================
    // PROJECT PROGRESS DATA
    // LIMIT TO 6 PROJECTS FOR CLEAN CHART
    // ================================================

    const projectProgressData = projects
      .slice(0, 6)
      .map((project) => ({
        id: project._id,

        name: project.name,

        shortName:
          project.name.length > 18
            ? `${project.name.substring(
                0,
                18
              )}...`
            : project.name,

        progress: Number(project.progress) || 0,

        status: project.status,

        priority: project.priority,
      }));

    // ================================================
    // BUDGET CALCULATIONS
    // ================================================

    let totalBudget = 0;
    let totalSpent = 0;

    projects.forEach((project) => {
      const budget = parseAmount(
        project.budget
      );

      const spent = parseAmount(
        project.spent
      );

      totalBudget += budget;
      totalSpent += spent;
    });

    // Prevent negative values
    const remainingBudget = Math.max(
      totalBudget - totalSpent,
      0
    );

    const budgetUtilization =
      totalBudget > 0
        ? Math.round(
            (totalSpent / totalBudget) * 100
          )
        : 0;

    // ================================================
    // RECENT PROJECTS
    // ================================================

    const recentProjects = projects
      .slice(0, 5)
      .map((project) => ({
        id: project._id,

        name: project.name,

        code: project.code,

        client: project.client,

        status: project.status,

        progress: project.progress || 0,

        budget: project.budget,

        spent: project.spent,

        priority: project.priority,

        updatedAt: project.updatedAt,
      }));

    // ================================================
    // DELAYED PROJECTS
    // ================================================

    const delayedProjectsData = projects
      .filter(
        (project) =>
          project.status === "Delayed" ||
          project.status === "At Risk"
      )
      .map((project) => ({
        id: project._id,

        name: project.name,

        status: project.status,

        progress: project.progress || 0,

        endDate: project.endDate,

        priority: project.priority,
      }));

    // ================================================
    // PROJECT STATUS DISTRIBUTION
    // ================================================

    const statusDistribution = {
      onTrack: 0,
      delayed: 0,
      atRisk: 0,
      completed: 0,
    };

    projects.forEach((project) => {
      switch (project.status) {
        case "On Track":
          statusDistribution.onTrack++;
          break;

        case "Delayed":
          statusDistribution.delayed++;
          break;

        case "At Risk":
          statusDistribution.atRisk++;
          break;

        case "Completed":
          statusDistribution.completed++;
          break;

        default:
          break;
      }
    });

    // ================================================
    // AVERAGE PROJECT PROGRESS
    // ================================================

    const averageProgress =
      totalProjects > 0
        ? Math.round(
            projects.reduce(
              (total, project) =>
                total +
                (Number(project.progress) || 0),
              0
            ) / totalProjects
          )
        : 0;

    // ================================================
    // RESPONSE
    // ================================================

    res.status(200).json({
      success: true,

      stats: {
        totalProjects,

        activeProjects,

        completedProjects,

        delayedProjects,

        atRiskProjects,

        averageProgress,
      },

      projectProgressData,

      budgetData: {
        totalBudget: Number(
          totalBudget.toFixed(2)
        ),

        totalSpent: Number(
          totalSpent.toFixed(2)
        ),

        remainingBudget: Number(
          remainingBudget.toFixed(2)
        ),

        budgetUtilization,
      },

      statusDistribution,

      recentProjects,

      delayedProjectsData,

      projects,
    });
  } catch (error) {
    console.error(
      "Project Dashboard Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch project dashboard data",
    });
  }
};

module.exports = {
  getProjects,

  getProjectById,

  createProject,

  updateProject,

  deleteProject,

  getProjectDashboardData,
};