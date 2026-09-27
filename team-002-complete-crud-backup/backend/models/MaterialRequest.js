const mongoose = require("mongoose");

const materialRequestSchema = new mongoose.Schema(
  {
    reqId: {
      type: String,
      default: function () {
        return "REQ-" + Math.floor(100 + Math.random() * 900);
      },
    },
    material: {
      type: String,
      required: [true, "Material name is required"],
    },
    category: {
      type: String,
      default: "General",
    },
    quantity: {
      type: String,
      required: [true, "Quantity is required"],
    },
    requestedBy: {
      type: String,
      default: "Contractor",
    },
    site: {
      type: String,
      default: "Tower A - Core",
    },
    status: {
      type: String,
      enum: ["Pending Approval", "Approved", "In Transit", "Delivered", "Rejected"],
      default: "Pending Approval",
    },
    badge: {
      type: String,
      default: "warning",
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
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MaterialRequest", materialRequestSchema);
