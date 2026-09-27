const express = require("express");
const router = express.Router();

const {
  VIEW_ROLES,
  getMaintenance,
  getMaintenanceById,
  getMaintenanceOptions,
  getMaintenanceSummary,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} = require("../controllers/maintenanceController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

// Every route below belongs to the maintenance module, so
// clients are rejected before the controller runs.
router.use(authorize(...VIEW_ROLES));

// Reference data for the form and filters. Declared before
// "/:id" so "options" is not read as an id.
router.get("/options", getMaintenanceOptions);

// Dashboard counts (all read from MongoDB)
router.get("/summary", getMaintenanceSummary);

router
  .route("/")
  .get(getMaintenance)
  .post(authorize("admin", "project_manager", "site_engineer"), createMaintenance);

// Workers and contractors reach this route too, but the
// controller limits them to the status of their own job.
router
  .route("/:id")
  .get(getMaintenanceById)
  .put(updateMaintenance)
  .delete(authorize("admin", "project_manager"), deleteMaintenance);

module.exports = router;
