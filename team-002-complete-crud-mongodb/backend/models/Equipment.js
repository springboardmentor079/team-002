const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Equipment name is required"],
    },
    type: {
      type: String,
      required: [true, "Equipment type is required"],
    },
    status: {
      type: String,
      enum: ["Operational", "In Use", "Scheduled Delivery", "Maintenance", "Standby"],
      default: "Operational",
    },
    operator: {
      type: String,
      default: "Site Crew",
    },
    location: {
      type: String,
      default: "Site Yard A",
    },
    badge: {
      type: String,
      default: "status-operational",
    },
    lastInspection: {
      type: String,
      default: "24 Aug 2026",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Equipment", equipmentSchema);
