const Invoice = require("../models/Invoice");
const PurchaseOrder = require("../models/PurchaseOrder");
const Notification = require("../models/Notification");

exports.getInvoices = async (req, res) => {
  try {
    const data = await Invoice.find()
      .populate({
        path: "purchaseOrder",
        select: "poNumber vendor totalAmount status",
        populate: { path: "vendor", select: "name category phone email" },
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, purchaseOrder, dueDate, status } = req.body;

    if (!purchaseOrder) {
      return res.status(400).json({ success: false, message: "Purchase order is required" });
    }

    // Directly calculate / verify amount from the linked Purchase Order
    let finalAmount = req.body.amount;
    const po = await PurchaseOrder.findById(purchaseOrder);
    if (po && po.totalAmount !== undefined && po.totalAmount !== null) {
      finalAmount = Number(po.totalAmount);
    }

    const data = await Invoice.create({
      invoiceNumber,
      purchaseOrder,
      amount: Number(finalAmount || 0),
      dueDate: dueDate || undefined,
      status: status || "Unpaid",
    });

    const populated = await Invoice.findById(data._id).populate({
      path: "purchaseOrder",
      select: "poNumber vendor totalAmount status",
      populate: { path: "vendor", select: "name category phone email" },
    });

    try {
      await Notification.create({
        title: "New Invoice Created",
        message: `Invoice ${data.invoiceNumber} for ₹${Number(data.amount || 0).toLocaleString("en-IN")} has been recorded and is due.`,
        role: "admin",
        type: "warning",
      });
    } catch (notifErr) {
      console.error("Failed to create invoice notification:", notifErr);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const update = { status: req.body.status };
    if (req.body.status === "Paid") update.paidOn = new Date();

    const data = await Invoice.findByIdAndUpdate(req.params.id, update, {
      returnDocument: "after",
      runValidators: true,
    }).populate({
      path: "purchaseOrder",
      select: "poNumber vendor totalAmount status",
      populate: { path: "vendor", select: "name category phone email" },
    });

    try {
      await Notification.create({
        title: `Invoice ${data.status}`,
        message: `Invoice ${data.invoiceNumber} has been marked as ${data.status}.`,
        role: "admin",
        type: data.status === "Paid" ? "success" : "info",
      });
    } catch (notifErr) {
      console.error("Failed to create invoice status notification:", notifErr);
    }

    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Invoice deleted" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};