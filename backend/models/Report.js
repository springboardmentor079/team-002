const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Report title is required"],
    },
    type: {
      type: String,
      enum: ["Daily Progress", "Inspection", "Safety & Audit", "Financial", "Quality", "Workforce", "Procurement", "Resource", "Budget"],
      default: "Daily Progress",
    },
    author: {
      type: String,
      default: "Site Engineer",
    },
    date: {
      type: String,
      default: function () {
        return new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    },
    summary: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Approved", "Flagged"],
      default: "Approved",
    },
    location: {
      type: String,
      default: "Zone A - Tower 1",
    },
    snagsFound: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);
