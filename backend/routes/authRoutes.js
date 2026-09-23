const express = require("express");

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Authentication
router.post("/register", registerUser);
router.post("/login", loginUser);

// Password Reset
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Profile Management
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;