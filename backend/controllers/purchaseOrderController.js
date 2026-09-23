const PurchaseOrder = require("../models/PurchaseOrder");
const Notification = require("../models/Notification");

exports.getPurchaseOrders = async (req, res) => {
  try {
    const data = await PurchaseOrder.find()
      .populate("vendor", "name category phone email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { vendor, items, expectedDelivery, notes } = req.body;

    if (!vendor) {
      return res.status(400).json({ success: false, message: "Please select a vendor" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "At least one item is required" });
    }

    // Accurately calculate totalAmount from items or explicit totalAmount
    let computedSum = items.reduce(
      (sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPrice || 0),
      0
    );

    const totalAmount =
      req.body.totalAmount !== undefined &&
      req.body.totalAmount !== null &&
      !isNaN(req.body.totalAmount) &&
      Number(req.body.totalAmount) > 0
        ? Number(req.body.totalAmount)
        : computedSum;

    const data = await PurchaseOrder.create({
      poNumber: "PO-" + Math.floor(100000 + Math.random() * 900000),
      vendor,
      items,
      totalAmount,
      expectedDelivery,
      notes,
      createdBy: req.user?._id,
    });

    const populated = await PurchaseOrder.findById(data._id).populate("vendor", "name category phone email");

    try {
      await Notification.create({
        title: "New Purchase Order Created",
        message: `PO ${data.poNumber} has been generated for vendor ${populated.vendor?.name || 'Direct Supplier'}.`,
        role: "admin",
        type: "info"
      });
    } catch (notifErr) {
      console.error("Failed to create PO notification:", notifErr);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.updatePOStatus = async (req, res) => {
  try {
    const data = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { returnDocument: "after", runValidators: true }
    ).populate("vendor", "name category phone email");

    try {
      await Notification.create({
        title: "Purchase Order Updated",
        message: `PO ${data.poNumber} status has been updated to ${data.status}.`,
        role: "project_manager",
        type: data.status === "Cancelled" ? "warning" : "success",
      });
    } catch (notifErr) {
      console.error("Failed to create PO status notification:", notifErr);
    }

    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.deletePurchaseOrder = async (req, res) => {
  try {
    await PurchaseOrder.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Purchase order deleted" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};