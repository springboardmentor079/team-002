const express = require("express");
const router = express.Router();
const {
  getReports,
  createReport,
  updateReport,
  deleteReport,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router
  .route("/")
  .get(getReports)
  .post(authorize("admin", "project_manager", "site_engineer"), createReport);

router
  .route("/:id")
  .put(authorize("admin", "project_manager", "site_engineer"), updateReport)
  .delete(authorize("admin", "project_manager"), deleteReport);

module.exports = router;
