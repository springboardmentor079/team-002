const express = require("express");
const router = express.Router();
const {
  getEquipment,
  createEquipment,
  updateEquipment,
  scheduleMaintenance,
  deleteEquipment,
} = require("../controllers/equipmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router
  .route("/")
  .get(getEquipment)
  .post(authorize("admin", "project_manager", "site_engineer"), createEquipment);

router.post("/:id/maintenance", authorize("admin", "project_manager", "site_engineer", "contractor"), scheduleMaintenance);

router
  .route("/:id")
  .put(authorize("admin", "project_manager", "site_engineer", "contractor"), updateEquipment)
  .delete(authorize("admin", "project_manager"), deleteEquipment);

module.exports = router;
