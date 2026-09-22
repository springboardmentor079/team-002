const express = require("express");
const router = express.Router();
const {
  getInvoices,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} = require("../controllers/invoiceController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(getInvoices)
  .post(authorize("admin", "project_manager"), createInvoice);

router.put("/:id/status", authorize("admin", "project_manager"), updateInvoiceStatus);
router.delete("/:id", authorize("admin", "project_manager"), deleteInvoice);

module.exports = router;