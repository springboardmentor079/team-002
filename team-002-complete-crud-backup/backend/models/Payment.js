const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  milestoneId: { type: mongoose.Schema.Types.ObjectId, ref: "Milestone", default: null },
  invoiceNumber: { type: String, required: true, unique: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date, default: null },
  paidDate: { type: Date, default: null },
  status: { type: String, enum: ["Due", "Paid", "Partially Paid", "Overdue", "Cancelled"], default: "Due" },
  method: { type: String, enum: ["Bank Transfer", "UPI", "Cheque", "Cash", "Card", "Other"], default: "Bank Transfer" },
  reference: { type: String, default: "" },
  notes: { type: String, default: "" },
}, { timestamps: true });
module.exports = mongoose.model("Payment", paymentSchema);
