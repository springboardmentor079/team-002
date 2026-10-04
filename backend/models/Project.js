const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      default: function () {
        return "PRJ-" + Math.floor(1000 + Math.random() * 9000);
      },
    },
    description: {
      type: String,
      default: "",
    },
    client: {
      type: String,
      default: "Skyline Realty Ltd",
    },
    manager: {
      type: String,
      default: "Project Manager",
    },
    location: {
      type: String,
      default: "Sector 62, Metro City",
    },
    budget: {
      type: String,
      default: "₹ 15.0 Cr",
    },
    spent: {
      type: String,
      default: "₹ 0.0 Cr",
    },
    status: {
      type: String,
      enum: ["On Track", "Delayed", "At Risk", "Completed"],
      default: "On Track",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    startDate: {
      type: String,
      default: "01 Jan 2026",
    },
    endDate: {
      type: String,
      default: "31 Dec 2026",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    archived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    archivedBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
