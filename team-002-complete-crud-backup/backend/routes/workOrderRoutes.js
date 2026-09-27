const express = require("express");
const router = express.Router();
const {
  getWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
} = require("../controllers/workOrderController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router
  .route("/")
  .get(getWorkOrders)
  .post(authorize("admin", "project_manager", "contractor"), createWorkOrder);

router
  .route("/:id")
  .put(authorize("admin", "project_manager", "contractor"), updateWorkOrder)
  .delete(authorize("admin", "project_manager"), deleteWorkOrder);

module.exports = router;
