const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Shift name is required"],
    },
    timing: {
      type: String,
      default: "08:00 AM � 05:00 PM",
    },
    crewCount: {
      type: Number,
      default: 20,
    },
    supervisor: {
      type: String,
      default: "Site Supervisor",
    },
    zone: {
      type: String,
      default: "Tower A - Core",
    },
    status: {
      type: String,
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shift", shiftSchema);
