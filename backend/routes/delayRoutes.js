const express = require("express");
const router = express.Router();
const { getDelays, createDelay } = require("../controllers/delayController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getDelays).post(protect, createDelay);

module.exports = router;
