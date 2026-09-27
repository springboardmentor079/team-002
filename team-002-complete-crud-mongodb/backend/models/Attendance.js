const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      default: "Site Worker",
    },
    userEmail: {
      type: String,
      default: "worker@buildtrack.com",
    },
    role: {
      type: String,
      default: "worker",
    },
    trade: {
      type: String,
      default: "Skilled Masonry & Rebar",
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
    checkIn: {
      type: String,
      default: "08:00 AM",
    },
    checkOut: {
      type: String,
      default: "05:00 PM",
    },
    status: {
      type: String,
      enum: ["Present", "Late", "Absent", "Half Day"],
      default: "Present",
    },
    site: {
      type: String,
      default: "Metro Tower A - Floor 8",
    },
    shift: {
      type: String,
      default: "Day Shift (08:00 AM - 05:00 PM)",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
