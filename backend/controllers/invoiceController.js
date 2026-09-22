const Invoice = require("../models/Invoice");
const PurchaseOrder = require("../models/PurchaseOrder");

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