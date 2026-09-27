const Inventory = require("../models/Inventory");

// GET /api/inventory
const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/inventory
const createInventoryItem = async (req, res) => {
  try {
    const { name, category, quantity, unit, minQuantity, location, unitPrice } = req.body;
    if (!name || quantity === undefined) {
      return res.status(400).json({ success: false, message: "Name and quantity are required" });
    }

    const qty = Number(quantity);
    const minQty = Number(minQuantity) || 50;
    const status = qty <= 0 ? "Out of Stock" : qty < minQty ? "Low Stock" : "In Stock";

    const item = await Inventory.create({
      name,
      category: category || "General Materials",
      quantity: qty,
      unit: unit || "Units",
      minQuantity: minQty,
      location: location || "Central Yard",
      unitPrice: unitPrice || "₹ 500",
      status,
    });

    res.status(201).json({
      success: true,
      message: "Inventory item added",
      data: item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/inventory/:id
const updateInventoryItem = async (req, res) => {
  try {
    const { quantity, minQuantity } = req.body;
    const updateData = { ...req.body };

    if (quantity !== undefined) {
      const qty = Number(quantity);
      const minQty = minQuantity !== undefined ? Number(minQuantity) : 50;
      updateData.status = qty <= 0 ? "Out of Stock" : qty < minQty ? "Low Stock" : "In Stock";
    }

    const item = await Inventory.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.status(200).json({
      success: true,
      message: "Inventory item updated",
      data: item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/inventory/:id
const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    res.status(200).json({
      success: true,
      message: "Item removed from inventory",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};
