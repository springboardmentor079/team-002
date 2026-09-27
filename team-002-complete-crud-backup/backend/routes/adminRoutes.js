const express = require("express");

const {
  getDashboardData,
  getSiteProgressData,
} = require("../controllers/adminController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();


// ================= ADMIN DASHBOARD =================

router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  getDashboardData
);


// ================= SITE PROGRESS =================
// Shared with Site Engineers (their widgets use this endpoint)

router.get(
  "/site-progress",
  protect,
  authorize("admin", "site_engineer"),
  getSiteProgressData
);


module.exports = router;