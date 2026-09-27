const express = require("express");
const router = express.Router();
const {
  getAttendance,
  logAttendance,
  punchClock,
} = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getAttendance).post(logAttendance);
router.route("/punch").post(punchClock);

module.exports = router;
