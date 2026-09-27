const express = require("express");

const {
  getSiteEngineerDashboard,
  getContractorDashboard,
  getWorkerDashboard,
  getClientDashboard,
} = require("../controllers/dashboardController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// ================= ROLE DASHBOARDS =================

router.get(
  "/site-engineer",
  authorize("admin", "site_engineer"),
  getSiteEngineerDashboard
);

router.get(
  "/contractor",
  authorize("admin", "contractor"),
  getContractorDashboard
);

router.get(
  "/worker",
  authorize("admin", "worker"),
  getWorkerDashboard
);

router.get(
  "/client",
  authorize("admin", "client"),
  getClientDashboard
);

module.exports = router;