const Payment = require("../models/Payment");
const Project = require("../models/Project");
const User = require("../models/User");
const Milestone = require("../models/Milestone");

const populatePayment = (query) => query
  .populate("projectId", "name code client clientId")
  .populate("clientId", "name email")
  .populate("milestoneId", "phase project amount progress");

const validatePaymentRelations = async ({ projectId, clientId, milestoneId }) => {
  const [project, client] = await Promise.all([
    Project.findById(projectId),
    User.findOne({ _id: clientId, role: "client" }),
  ]);

  if (!project) return { error: "Project not found", status: 404 };
  if (!client) return { error: "Client not found", status: 404 };

  const assigned = String(project.clientId || "") === String(client._id) ||
    project.client === client.name ||
    project.client === client.email;

  if (!assigned) {
    return { error: "Selected client is not assigned to this project", status: 400 };
  }

  if (milestoneId) {
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) return { error: "Milestone not found", status: 404 };
    if (milestone.project && milestone.project !== project.name) {
      return { error: "Selected milestone does not belong to this project", status: 400 };
    }
  }

  return { project, client };
};

const getPayments = async (req, res) => {
  try {
    const query = req.user.role === "client" ? { clientId: req.user._id } : {};
    const payments = await populatePayment(Payment.find(query).sort({ createdAt: -1 }));
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch payment records" });
  }
};

const createPayment = async (req, res) => {
  try {
    const {
      projectId, clientId, milestoneId, invoiceNumber, amount,
      dueDate, paidDate, status, method, reference, notes,
    } = req.body;

    if (!projectId || !clientId || !String(invoiceNumber || "").trim() || amount === undefined) {
      return res.status(400).json({ success: false, message: "Project, client, invoice number and amount are required" });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({ success: false, message: "Amount must be a valid non-negative number" });
    }

    const relation = await validatePaymentRelations({ projectId, clientId, milestoneId });
    if (relation.error) return res.status(relation.status).json({ success: false, message: relation.error });

    const payment = await Payment.create({
      projectId,
      clientId,
      milestoneId: milestoneId || null,
      invoiceNumber: String(invoiceNumber).trim(),
      amount: numericAmount,
      dueDate: dueDate || null,
      paidDate: paidDate || null,
      status: status || "Due",
      method: method || "Bank Transfer",
      reference: reference || "",
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Payment record created",
      data: await populatePayment(Payment.findById(payment._id)),
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(error.code === 11000 ? 409 : 500).json({
      success: false,
      message: error.code === 11000 ? "Invoice number already exists" : error.message,
    });
  }
};

const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment record not found" });

    const next = {
      projectId: req.body.projectId ?? payment.projectId,
      clientId: req.body.clientId ?? payment.clientId,
      milestoneId: req.body.milestoneId === "" ? null : (req.body.milestoneId ?? payment.milestoneId),
    };

    const relation = await validatePaymentRelations(next);
    if (relation.error) return res.status(relation.status).json({ success: false, message: relation.error });

    const allowed = ["projectId", "clientId", "milestoneId", "invoiceNumber", "amount", "dueDate", "paidDate", "status", "method", "reference", "notes"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) payment[key] = req.body[key] === "" && key === "milestoneId" ? null : req.body[key];
    }

    if (payment.amount < 0) return res.status(400).json({ success: false, message: "Amount cannot be negative" });
    await payment.save();

    res.json({
      success: true,
      message: "Payment record updated",
      data: await populatePayment(Payment.findById(payment._id)),
    });
  } catch (error) {
    console.error("Update payment error:", error);
    res.status(error.code === 11000 ? 409 : 500).json({
      success: false,
      message: error.code === 11000 ? "Invoice number already exists" : error.message,
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment record not found" });
    res.json({ success: true, message: "Payment record deleted" });
  } catch (error) {
    console.error("Delete payment error:", error);
    res.status(500).json({ success: false, message: "Failed to delete payment record" });
  }
};

module.exports = { getPayments, createPayment, updatePayment, deletePayment };
