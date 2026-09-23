const Milestone = require("../models/Milestone");
const Notification = require("../models/Notification");

// GET /api/milestones
const getMilestones = async (req, res) => {
  try {
    const milestones = await Milestone.find().sort({ createdAt: 1 });
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
    const { phase, project, date, status, progress, amount } = req.body;
    if (!phase) {
      return res.status(400).json({ success: false, message: "Phase title is required" });
    }

    const badge = progress === 100 ? "good" : progress > 0 ? "progress" : "pending";

    const milestone = await Milestone.create({
      phase,
      project: project || "Skyline Heights - Tower A",
      date: date || "30 Apr 2026",
      status: status || (progress === 100 ? "Verified & Approved" : "In Progress"),
      badge,
      progress: progress || 0,
      amount: amount || "₹ 1.0 Cr",
      verifiedBy: req.user.name || "Site Engineer",
    });

    try {
      await Notification.create({
        title: "New Project Milestone",
        message: `Milestone '${milestone.phase}' scheduled for ${milestone.project} (Target: ${milestone.date}).`,
        role: "all",
        type: "info",
      });
    } catch (notifErr) {
      console.error("Milestone notification error:", notifErr);
    }

    res.status(201).json({
      success: true,
      message: "Milestone added successfully",
      data: milestone,
    });
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
    if (clientApproved !== undefined) updateData.clientApproved = clientApproved;
    if (date) updateData.date = date;
    if (amount) updateData.amount = amount;

    const milestone = await Milestone.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone not found" });
    }

    if (clientApproved) {
      try {
        await Notification.create({
          title: "Milestone Client Approved",
          message: `Client approved milestone '${milestone.phase}' for ${milestone.project}.`,
          role: "all",
          type: "success",
        });
      } catch (notifErr) {
        console.error("Milestone approval notification error:", notifErr);
      }
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
