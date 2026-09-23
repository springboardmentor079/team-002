const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    workerName: {
      type: String,
      required: true,
      default: "Site Worker",
    },
    trade: {
      type: String,
      default: "Masons & Structural",
    },
    slipId: {
      type: String,
      required: true,
      unique: true,
    },
    period: {
      type: String,
      required: true, // e.g., "01 Sep – 15 Sep 2026"
    },
    regularHours: {
      type: Number,
      default: 80,
    },
    otHours: {
      type: Number,
      default: 12,
    },
    hourlyRate: {
      type: Number,
      default: 350, // INR per hour or USD
    },
    rateLabel: {
      type: String,
      default: "₹350/hr",
    },
    grossPay: {
      type: Number,
      required: true,
    },
    grossLabel: {
      type: String,
      default: "₹ 34,300",
    },
    deductions: {
      type: Number,
      default: 2100,
    },
    deductionsLabel: {
      type: String,
      default: "₹ 2,100",
    },
    netPay: {
      type: Number,
      required: true,
    },
    netLabel: {
      type: String,
      default: "₹ 32,200",
    },
    payDate: {
      type: String,
      default: "16 Sep 2026",
    },
    status: {
      type: String,
      enum: ["Disbursed", "Pending", "Processing"],
      default: "Disbursed",
    },
    account: {
      type: String,
      default: "HDFC Bank •••• 4912",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payroll", payrollSchema);
