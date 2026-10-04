const Report = require("../models/Report");
const Attendance = require("../models/Attendance");
const MaterialRequest = require("../models/MaterialRequest");
const PurchaseOrder = require("../models/PurchaseOrder");
const Invoice = require("../models/Invoice");
const Equipment = require("../models/Equipment");
const Project = require("../models/Project");
const { parseAmountToCrores } = require("../utils/currency");

// GET /api/reports
const getReports = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type && type !== "All") {
      query.type = type;
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
    const { title, type, summary, location, snagsFound, status } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Report title is required" });
    }

    const report = await Report.create({
      title,
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

// ================= GENERATORS =================

const generateWorkforceReport = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-IN");
    const todayRegex = /Today/i;

    const attendance = await Attendance.find({
      $or: [{ date: todayRegex }, { date: today }]
    });

    const totalWorkers = attendance.length;
    const present = attendance.filter(a => a.status === "Present").length;
    const absent = totalWorkers - present;
    const rate = totalWorkers > 0 ? Math.round((present/totalWorkers)*100) : 0;

    const summary = `Workforce Report for ${today}: ${totalWorkers} Total Workers logged. ${present} Present, ${absent} Absent. Overall Attendance Rate: ${rate}%.`;

    const report = await Report.create({
      title: `Daily Workforce Summary`,
      type: "Workforce",
      author: req.user.name || "System",
      summary: summary,
      location: "System-wide",
      snagsFound: 0,
      status: "Approved",
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateProcurementReport = async (req, res) => {
  try {
    const materials = await MaterialRequest.find();
    const pos = await PurchaseOrder.find();
    const invoices = await Invoice.find();

    const pendingMaterials = materials.filter(m => m.status === "Pending Approval").length;
    const activePOs = pos.filter(p => p.status !== "Completed").length;
    const unpaidInvoices = invoices.filter(i => i.status !== "Paid").length;

    const summary = `Procurement Report: ${materials.length} Total Material Requests (${pendingMaterials} Pending). ${pos.length} Purchase Orders (${activePOs} Active). ${invoices.length} Invoices (${unpaidInvoices} Unpaid).`;

    const report = await Report.create({
      title: `Procurement & Supply Summary`,
      type: "Procurement",
      author: req.user.name || "System",
      summary: summary,
      location: "System-wide",
      status: "Approved",
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateResourceReport = async (req, res) => {
  try {
    const equipment = await Equipment.find();
    const operational = equipment.filter(e => e.status === "Operational" || e.status === "In Use").length;
    const maintenance = equipment.filter(e => e.status === "Maintenance").length;

    const utilization = equipment.length > 0 ? Math.round((operational / equipment.length) * 100) : 0;

    const summary = `Resource Utilization: ${equipment.length} Total Equipment/Machinery units. ${operational} Operational, ${maintenance} Under Maintenance. Fleet Utilization Rate: ${utilization}%.`;

    const report = await Report.create({
      title: `Resource & Machinery Summary`,
      type: "Resource",
      author: req.user.name || "System",
      summary: summary,
      location: "System-wide",
      status: "Approved",
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateBudgetReport = async (req, res) => {
  try {
    const projects = await Project.find();
    let totalBudget = 0;
    let totalSpent = 0;

    projects.forEach(p => {
      totalBudget += parseAmountToCrores(p.budget);
      totalSpent += parseAmountToCrores(p.spent);
    });

    const remaining = totalBudget - totalSpent;
    const util = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    const summary = `Budget Overview across ${projects.length} Projects: Total Budget ₹${totalBudget.toFixed(2)} Cr. Total Spent ₹${totalSpent.toFixed(2)} Cr. Remaining ₹${remaining.toFixed(2)} Cr. Overall Utilization: ${util}%.`;

    const report = await Report.create({
      title: `Financial Budget Summary`,
      type: "Budget",
      author: req.user.name || "System",
      summary: summary,
      location: "System-wide",
      status: "Approved",
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getReports,
  createReport,
  updateReport,
  deleteReport,
  generateWorkforceReport,
  generateProcurementReport,
  generateResourceReport,
  generateBudgetReport
};
