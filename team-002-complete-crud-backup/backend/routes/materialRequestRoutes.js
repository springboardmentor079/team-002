const express = require("express");
const router = express.Router();
const {
  getMaterialRequests,
  createMaterialRequest,
  updateMaterialRequestStatus,
  deleteMaterialRequest,
} = require("../controllers/materialRequestController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router
  .route("/")
  .get(getMaterialRequests)
  .post(authorize("admin", "project_manager", "contractor", "site_engineer"), createMaterialRequest);

router
  .route("/:id/status")
  .put(authorize("admin", "project_manager"), updateMaterialRequestStatus);

router
  .route("/:id")
  .delete(authorize("admin", "project_manager", "contractor"), deleteMaterialRequest);

module.exports = router;
