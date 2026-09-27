const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getMe, updateMe, getClients } = require("../controllers/userController");
router.use(protect);
router.get("/me", getMe);
router.put("/me", updateMe);
router.get("/clients", authorize("admin"), getClients);
module.exports = router;
