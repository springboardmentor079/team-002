const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
    },
    category: {
      type: String,
      default: "Cement & Aggregates",
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      default: 0,
    },
    unit: {
      type: String,
      default: "Bags",
    },
    minQuantity: {
      type: Number,
      default: 50,
    },
    location: {
      type: String,
      default: "Warehouse 1 - North Yard",
    },
    unitPrice: {
      type: String,
      default: "₹ 380",
    },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);
