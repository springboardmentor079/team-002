const express = require("express");
const router = express.Router();
const {
  getPurchaseOrders,
  createPurchaseOrder,
  updatePOStatus,
  deletePurchaseOrder,
} = require("../controllers/purchaseOrderController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(getPurchaseOrders)
  .post(authorize("admin", "project_manager"), createPurchaseOrder);

router.put("/:id/status", authorize("admin", "project_manager"), updatePOStatus);
router.delete("/:id", authorize("admin", "project_manager"), deletePurchaseOrder);

module.exports = router;