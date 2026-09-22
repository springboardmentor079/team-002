const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, trim: true },
    purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", required: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date },
    status: { type: String, enum: ["Unpaid", "Paid", "Overdue"], default: "Unpaid" },
    paidOn: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);