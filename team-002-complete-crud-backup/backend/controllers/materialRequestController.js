const MaterialRequest = require("../models/MaterialRequest");

// GET /api/materials
const getMaterialRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== "All") {
      query.status = status;
    }
    const requests = await MaterialRequest.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/materials
const createMaterialRequest = async (req, res) => {
  try {
    const { material, category, quantity, site, notes } = req.body;
    if (!material || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Material name and quantity are required",
      });
    }

    const newReq = await MaterialRequest.create({
      material,
      category: category || "General",
      quantity,
      requestedBy: req.user.name || "Contractor",
      site: site || "Main Construction Site",
      status: "Pending Approval",
      badge: "warning",
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Material request submitted successfully",
      data: newReq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/materials/:id/status
const updateMaterialRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let badge = "warning";
    if (status === "Approved" || status === "Delivered") badge = "good";
    else if (status === "In Transit") badge = "transit";
    else if (status === "Rejected") badge = "danger";

    const updated = await MaterialRequest.findByIdAndUpdate(
      req.params.id,
      { status, badge },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({
      success: true,
      message: `Material request marked as ${status}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/materials/:id
const deleteMaterialRequest = async (req, res) => {
  try {
    const deleted = await MaterialRequest.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    res.status(200).json({
      success: true,
      message: "Material request deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMaterialRequests,
  createMaterialRequest,
  updateMaterialRequestStatus,
  deleteMaterialRequest,
};
