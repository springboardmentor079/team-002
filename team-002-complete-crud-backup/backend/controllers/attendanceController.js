const Attendance = require("../models/Attendance");

// GET /api/attendance
const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/attendance
const logAttendance = async (req, res) => {
  try {
    const { userName, role, trade, status, site, shift } = req.body;

    const record = await Attendance.create({
      userName: userName || req.user.name || "Worker",
      userEmail: req.user.email || "worker@buildtrack.com",
      role: role || req.user.role || "worker",
      trade: trade || "Skilled Masonry",
      date: "Today",
      checkIn: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      checkOut: "--",
      status: status || "Present",
      site: site || "Metro Tower A - Floor 8",
      shift: shift || "Day Shift",
    });

    res.status(201).json({
      success: true,
      message: "Attendance recorded successfully",
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/attendance/punch
const punchClock = async (req, res) => {
  try {
    const { action } = req.body; // "in" or "out"
    const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    // Look for today's record for this user
    let record = await Attendance.findOne({
      userName: req.user.name,
      date: "Today",
    });

    if (!record) {
      record = await Attendance.create({
        userName: req.user.name,
        userEmail: req.user.email,
        role: req.user.role,
        trade: "Site Duty",
        date: "Today",
        checkIn: nowTime,
        checkOut: "--",
        status: "Present",
        site: "Metro Tower A - Floor 8",
      });
      return res.status(200).json({
        success: true,
        message: `Punched IN successfully at ${nowTime}`,
        data: record,
      });
    }

    if (action === "out" || record.checkOut === "--") {
      record.checkOut = nowTime;
      await record.save();
      return res.status(200).json({
        success: true,
        message: `Punched OUT successfully at ${nowTime}`,
        data: record,
      });
    } else {
      record.checkIn = nowTime;
      record.checkOut = "--";
      await record.save();
      return res.status(200).json({
        success: true,
        message: `Punched IN successfully at ${nowTime}`,
        data: record,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAttendance,
  logAttendance,
  punchClock,
};
