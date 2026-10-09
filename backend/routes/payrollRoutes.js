const express = require("express");
const router = express.Router();

const {
  VIEW_ROLES,
  MANAGE_ROLES,
  getPayroll,
  getPayrollById,
  getPayrollOptions,
  getPayrollSummary,
  createPayroll,
  updatePayroll,
  updatePayrollStatus,
  deletePayroll,
} = require("../controllers/payrollController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

// Every route below belongs to the payroll module. The client
// role is rejected here, before any controller runs, so a
// client can never reach a salary figure. Workers pass the
// guard because they may read their own payslips; the
// controller narrows that to their own employee id and
// rejects every write.
router.use(authorize(...VIEW_ROLES));

// Reference data for the form and filters. Declared before
// "/:id" so "options" is not read as an id.
router.get("/options", getPayrollOptions);

// Dashboard counts (all read from MongoDB)
router.get("/summary", getPayrollSummary);

router
  .route("/")
  .get(getPayroll)
  .post(authorize(...MANAGE_ROLES), createPayroll);

// The quick status action, declared before "/:id" so
// "status" is not read as an id.
router.put("/:id/status", authorize(...MANAGE_ROLES), updatePayrollStatus);

router
  .route("/:id")
  .get(getPayrollById)
  .put(updatePayroll)
  .delete(authorize("admin"), deletePayroll);

module.exports = router;
