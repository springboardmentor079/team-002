const express = require("express");
const router = express.Router();
const {
  getReports,
  createReport,
  updateReport,
  deleteReport,
  generateWorkforceReport,
  generateProcurementReport,
  generateResourceReport,
  generateBudgetReport
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/generate/workforce", authorize("admin", "project_manager", "contractor"), generateWorkforceReport);
router.post("/generate/procurement", authorize("admin", "project_manager"), generateProcurementReport);
router.post("/generate/resource", authorize("admin", "project_manager", "site_engineer"), generateResourceReport);
router.post("/generate/budget", authorize("admin", "project_manager", "client"), generateBudgetReport);

router
  .route("/")
  .get(getReports)
  .post(authorize("admin", "project_manager", "site_engineer"), createReport);

router
  .route("/:id")
  .put(authorize("admin", "project_manager", "site_engineer"), updateReport)
  .delete(authorize("admin", "project_manager"), deleteReport);

module.exports = router;
