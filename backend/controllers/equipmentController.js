const Equipment = require("../models/Equipment");

// GET /api/equipment
const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/equipment
const createEquipment = async (req, res) => {
  try {
    const { name, type, status, operator, location } = req.body;
    if (!name || !type) {
      return res.status(400).json({ success: false, message: "Name and type are required" });
    }

    const badge =
      status === "Operational" || status === "In Use"
        ? "status-operational"
        : status === "Maintenance"
        ? "status-maintenance"
        : "status-scheduled";

    const eq = await Equipment.create({
      name,
      type,
      status: status || "Operational",
      operator: operator || "Site Crew",
      location: location || "Site Yard A",
      badge,
    });

    res.status(201).json({
      success: true,
      message: "Equipment added successfully",
      data: eq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/equipment/:id
const updateEquipment = async (req, res) => {
  try {
    const { status, operator, location } = req.body;
    const updateData = {};
    if (status) {
      updateData.status = status;
      updateData.badge =
        status === "Operational" || status === "In Use"
          ? "status-operational"
          : status === "Maintenance"
          ? "status-maintenance"
          : "status-scheduled";
    }
    if (operator) updateData.operator = operator;
    if (location) updateData.location = location;
    if (req.body.nextMaintenanceDate) updateData.nextMaintenanceDate = req.body.nextMaintenanceDate;
    if (req.body.maintenanceNotes) updateData.maintenanceNotes = req.body.maintenanceNotes;
    if (req.body.lastInspection) updateData.lastInspection = req.body.lastInspection;

    const eq = await Equipment.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!eq) {
      return res.status(404).json({ success: false, message: "Equipment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Equipment updated successfully",
      data: eq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/equipment/:id/maintenance
const scheduleMaintenance = async (req, res) => {
  try {
    const { nextMaintenanceDate, maintenanceNotes, servicedBy, cost } = req.body;
    const eq = await Equipment.findById(req.params.id);
    if (!eq) {
      return res.status(404).json({ success: false, message: "Equipment not found" });
    }

    if (nextMaintenanceDate) eq.nextMaintenanceDate = nextMaintenanceDate;
    if (maintenanceNotes) eq.maintenanceNotes = maintenanceNotes;
    eq.status = "Maintenance";
    eq.badge = "status-maintenance";

    if (servicedBy || cost || maintenanceNotes) {
      eq.maintenanceHistory.unshift({
        serviceDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        servicedBy: servicedBy || "Site Maintenance Team",
        notes: maintenanceNotes || "Routine servicing & inspection",
        cost: cost || "₹ 15,000",
      });
    }

    await eq.save();

    res.status(200).json({
      success: true,
      message: "Maintenance scheduled and logged successfully",
      data: eq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/equipment/:id
const deleteEquipment = async (req, res) => {
  try {
    const eq = await Equipment.findByIdAndDelete(req.params.id);
    if (!eq) {
      return res.status(404).json({ success: false, message: "Equipment not found" });
    }
    res.status(200).json({
      success: true,
      message: "Equipment removed successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEquipment,
  createEquipment,
  updateEquipment,
  scheduleMaintenance,
  deleteEquipment,
};
