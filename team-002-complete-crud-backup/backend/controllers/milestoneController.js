const Milestone = require("../models/Milestone");
const Project = require("../models/Project");

// GET /api/milestones
const getMilestones = async (req, res) => {
  try {
    let query = {};
    if (req.user?.role === "client") {
      const projects = await Project.find({
        $or: [{ clientId: req.user._id }, { client: req.user.name }, { client: req.user.email }],
      }).select("name");
      query.project = { $in: projects.map(p => p.name) };
    }
    const milestones = await Milestone.find(query).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      data: milestones,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/milestones
const createMilestone = async (req, res) => {
  try {
    const { phase, projectId, date, status, progress, amount } = req.body;
    if (!phase) {
      return res.status(400).json({ success: false, message: "Phase title is required" });
    }

   if (!projectId) {
  return res.status(400).json({
    success: false,
    message: "Project is required",
  });
}

const selectedProject = await Project.findById(projectId);

if (!selectedProject) {
  return res.status(404).json({
    success: false,
    message: "Selected project not found",
  });
}
    const numericProgress = Number(progress) || 0;
    const milestone = await Milestone.create({
  phase,
  projectId: selectedProject._id,
  project: selectedProject.name,
  date: date || "30 Apr 2026",
  status: status || (numericProgress === 100 ? "Verified & Approved" : "In Progress"),
      badge: numericProgress === 100 ? "good" : numericProgress > 0 ? "progress" : "pending",
      progress: numericProgress,
      amount: amount || "₹ 0.0 Cr",
      verifiedBy: req.user.name || "Site Engineer",
    });

    res.status(201).json({ success: true, message: "Milestone added successfully", data: milestone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/milestones/:id
const updateMilestone = async (req, res) => {
  try {
    const { status, progress, clientApproved, date, amount } = req.body;
    const updateData = {};
    if (progress !== undefined) {
      updateData.progress = progress;
      updateData.badge = progress === 100 ? "good" : progress > 0 ? "progress" : "pending";
    }
    if (status) updateData.status = status;
    if (clientApproved !== undefined) {
      if (req.user?.role === "client") {
        const currentMilestone = await Milestone.findById(req.params.id).select("projectId");

if (!currentMilestone) {
  return res.status(404).json({
    success: false,
    message: "Milestone not found",
  });
}

const project = await Project.findOne({
  _id: currentMilestone.projectId,
  $or: [
    { clientId: req.user._id },
    { client: req.user.name },
    { client: req.user.email },
  ],
});
        if (!project) return res.status(403).json({ success: false, message: "You cannot approve this milestone" });
      }
      updateData.clientApproved = clientApproved;
    }
    if (date) updateData.date = date;
    if (amount) updateData.amount = amount;

    const milestone = await Milestone.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone not found" });
    }

    res.status(200).json({
      success: true,
      message: "Milestone updated successfully",
      data: milestone,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/milestones/:id
const deleteMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndDelete(req.params.id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone not found" });
    }
    res.status(200).json({
      success: true,
      message: "Milestone removed successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
};
