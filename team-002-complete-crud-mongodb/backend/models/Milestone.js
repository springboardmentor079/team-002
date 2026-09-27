const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema(
  {
    phase: {
      type: String,
      required: [true, "Phase / Milestone name is required"],
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    project: {
      type: String,
      default: "Skyline Heights - Tower A",
    },

    date: {
      type: String,
      default: "30 Mar 2026",
    },

    status: {
      type: String,
      default: "In Progress",
    },

    badge: {
      type: String,
      default: "progress",
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    amount: {
      type: String,
      default: "₹ 1.2 Cr",
    },

    clientApproved: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: String,
      default: "Site Engineer",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Milestone", milestoneSchema);