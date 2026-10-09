const express = require("express");

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadProfileImage,
  removeProfileImage,
  handleAvatarUpload,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Authentication
router.post("/register", registerUser);
router.post("/login", loginUser);

// Password Reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
// Backwards compatible route for tokens supplied in the URL
router.put("/reset-password/:token", resetPassword);

// Profile Management (authenticated user only, id taken from the JWT)
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/profile-image", protect, handleAvatarUpload, uploadProfileImage);
router.delete("/profile-image", protect, removeProfileImage);
router.put("/change-password", protect, changePassword);

module.exports = router;
