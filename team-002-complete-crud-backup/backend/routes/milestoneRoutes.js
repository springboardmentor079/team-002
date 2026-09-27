const express = require("express");
const router = express.Router();
const {
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} = require("../controllers/milestoneController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router
  .route("/")
  .get(getMilestones)
  .post(authorize("admin", "project_manager", "site_engineer"), createMilestone);

router
  .route("/:id")
  .put(authorize("admin", "project_manager", "site_engineer", "client"), updateMilestone)
  .delete(authorize("admin", "project_manager"), deleteMilestone);

module.exports = router;
