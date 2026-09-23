const express = require("express");
const router = express.Router();
const {
  getMyWages,
  getAllPayrolls,
  createPayroll,
} = require("../controllers/payrollController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

// Current worker wages and pay slip history
router.get("/me", getMyWages);

// Admin & Contractor full payroll endpoints
router
  .route("/")
  .get(authorize("admin", "project_manager", "contractor"), getAllPayrolls)
  .post(authorize("admin", "contractor"), createPayroll);

module.exports = router;
