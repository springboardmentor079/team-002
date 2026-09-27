const Report = require("../models/Report");
const Project = require("../models/Project");

// GET /api/reports
const getReports = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type && type !== "All") query.type = type;

    if (req.user?.role === "client") {
      const projects = await Project.find({
        $or: [{ clientId: req.user._id }, { client: req.user.name }, { client: req.user.email }],
      }).select("_id name");
      query.$or = [
        { projectId: { $in: projects.map(p => p._id) } },
        { project: { $in: projects.map(p => p.name) } },
      ];
    }
    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/reports
const createReport = async (req, res) => {
  try {
    const { title, type, summary, location, snagsFound, status, projectId, project } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Report title is required" });
    }

    let linkedProjectId = projectId || null;
    let linkedProjectName = project || "";
    if (!linkedProjectId && !linkedProjectName) {
      const availableProjects = await Project.find().select("_id name").limit(2);
      if (availableProjects.length === 1) {
        linkedProjectId = availableProjects[0]._id;
        linkedProjectName = availableProjects[0].name;
      }
    }

    const report = await Report.create({
      title,
      projectId: linkedProjectId,
      project: linkedProjectName,
      type: type || "Daily Progress",
      author: req.user.name || "Site Engineer",
      summary: summary || "",
      location: location || "Main Campus",
      snagsFound: snagsFound || 0,
      status: status || "Approved",
    });

    res.status(201).json({
      success: true,
      message: "Report logged successfully",
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/reports/:id
const updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    res.status(200).json({
      success: true,
      message: "Report updated",
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    res.status(200).json({
      success: true,
      message: "Report deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getReports,
  createReport,
  updateReport,
  deleteReport,
};
