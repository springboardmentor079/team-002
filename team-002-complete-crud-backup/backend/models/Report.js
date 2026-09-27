const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Report title is required"] },
    type: { type: String, enum: ["Daily Progress", "Inspection", "Safety & Audit", "Financial", "Quality"], default: "Daily Progress" },
    author: { type: String, default: "Site Engineer" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },
    project: { type: String, default: "" },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    },
    summary: { type: String, default: "" },
    status: { type: String, enum: ["Draft", "Submitted", "Approved", "Flagged"], default: "Approved" },
    location: { type: String, default: "Site" },
    snagsFound: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
