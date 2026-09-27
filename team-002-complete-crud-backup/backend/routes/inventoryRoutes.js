const express = require("express");
const router = express.Router();
const {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require("../controllers/inventoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router
  .route("/")
  .get(getInventory)
  .post(authorize("admin", "project_manager"), createInventoryItem);

router
  .route("/:id")
  .put(authorize("admin", "project_manager", "contractor"), updateInventoryItem)
  .delete(authorize("admin", "project_manager"), deleteInventoryItem);

module.exports = router;
