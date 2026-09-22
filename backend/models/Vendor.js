const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Raw Materials", "Equipment", "Machinery", "Safety Equipment", "Office Supplies"],
      default: "Raw Materials",
    },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);