const express = require("express");

const router = express.Router();

const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectDashboardData,
} = require("../controllers/projectController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

router.use(protect);

// Dashboard route FIRST
router.get(
  "/dashboard",
  authorize("admin", "project_manager"),
  getProjectDashboardData
);

// Project routes
router
  .route("/")
  .get(getProjects)
  .post(
    authorize(
      "admin",
      "project_manager"
    ),
    createProject
  );

router
  .route("/:id")
  .get(getProjectById)
  .put(
    authorize(
      "admin",
      "project_manager"
    ),
    updateProject
  )
  .delete(
    authorize("admin"),
    deleteProject
  );

module.exports = router;