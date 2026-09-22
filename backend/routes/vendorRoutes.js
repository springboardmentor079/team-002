const express = require("express");
const router = express.Router();
const { getVendors, createVendor, updateVendor, deleteVendor } = require("../controllers/vendorController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(getVendors)
  .post(authorize("admin", "project_manager"), createVendor);

router.route("/:id")
  .put(authorize("admin", "project_manager"), updateVendor)
  .delete(authorize("admin", "project_manager"), deleteVendor);

module.exports = router;