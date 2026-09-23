const express = require("express");
const router = express.Router();
const Shift = require("../models/Shift");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", async (req, res) => {
  try {
    let shifts = await Shift.find().sort({ createdAt: -1 });
    if (shifts.length === 0) {
      shifts = await Shift.insertMany([
        {
          name: "Day Shift - Structural & Concreting",
          timing: "08:00 AM � 05:00 PM",
          crewCount: 42,
          supervisor: "Amit Sharma",
          zone: "Tower A - Floors 8-12",
          status: "Active",
        },
        {
          name: "Night Pouring & Curing Rotation",
          timing: "07:00 PM � 03:00 AM",
          crewCount: 18,
          supervisor: "Sunil Rawat",
          zone: "Basement 2 & Foundation",
          status: "Active",
        },
      ]);
    }
    res.json({ success: true, data: shifts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, timing, crewCount, supervisor, zone } = req.body;
    const shift = await Shift.create({
      name,
      timing: timing || "08:00 AM � 05:00 PM",
      crewCount: Number(crewCount) || 20,
      supervisor: supervisor || req.user.name || "Site Supervisor",
      zone: zone || "Tower A",
    });
    res.status(201).json({ success: true, data: shift });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
