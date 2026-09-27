const mongoose = require("mongoose");

const workOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      default: function () {
        return "WO-2026-" + Math.floor(100 + Math.random() * 900);
      },
    },
    title: {
      type: String,
      required: [true, "Work order title is required"],
    },
    lead: {
      type: String,
      default: "Supervisor",
    },
    trade: {
      type: String,
      default: "Masonry & Structural",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    deadline: {
      type: String,
      default: "30 Mar 2026",
    },
    status: {
      type: String,
      enum: ["On Schedule", "In Progress", "Delayed", "Completed"],
      default: "In Progress",
    },
    statusClass: {
      type: String,
      default: "good",
    },
    zone: {
      type: String,
      default: "Tower A - Floor 8",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WorkOrder", workOrderSchema);
