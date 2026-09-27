const WorkOrder = require("../models/WorkOrder");

// GET /api/work-orders
const getWorkOrders = async (req, res) => {
  try {
    const orders = await WorkOrder.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/work-orders
const createWorkOrder = async (req, res) => {
  try {
    const { title, lead, trade, progress, deadline, zone, status } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const order = await WorkOrder.create({
      title,
      lead: lead || req.user.name || "Supervisor",
      trade: trade || "General Masonry",
      progress: progress || 0,
      deadline: deadline || "30 Apr 2026",
      zone: zone || "Tower A",
      status: status || "In Progress",
      statusClass: status === "On Schedule" ? "good" : status === "Delayed" ? "danger" : "warning",
    });

    res.status(201).json({
      success: true,
      message: "Work order created successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/work-orders/:id
const updateWorkOrder = async (req, res) => {
  try {
    const { progress, status, statusClass, lead, deadline } = req.body;
    const updateData = {};
    if (progress !== undefined) updateData.progress = progress;
    if (status) {
      updateData.status = status;
      updateData.statusClass = status === "On Schedule" ? "good" : status === "Delayed" ? "danger" : "warning";
    }
    if (statusClass) updateData.statusClass = statusClass;
    if (lead) updateData.lead = lead;
    if (deadline) updateData.deadline = deadline;

    const order = await WorkOrder.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: "Work order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Work order updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/work-orders/:id
const deleteWorkOrder = async (req, res) => {
  try {
    const order = await WorkOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Work order not found" });
    }
    res.status(200).json({
      success: true,
      message: "Work order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
};
