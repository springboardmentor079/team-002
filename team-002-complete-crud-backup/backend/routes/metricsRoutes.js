const express = require("express");

const {
  getLandingMetrics,
} = require("../controllers/metricsController");

const router = express.Router();

// =====================================================
// PUBLIC COMMAND CENTER METRICS
// Aggregates only - no sensitive data. Used by the
// public landing page dashboard section.
// =====================================================

router.get(
  "/dashboard/metrics",
  getLandingMetrics
);

module.exports = router;