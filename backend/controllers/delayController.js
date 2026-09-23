const Delay = require("../models/Delay");
const Notification = require("../models/Notification");

// GET /api/delays
exports.getDelays = async (req, res) => {
  try {
    const delays = await Delay.find().sort({ createdAt: -1 });
    res.json({ success: true, data: delays });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/delays
exports.createDelay = async (req, res) => {
  try {
    const delay = await Delay.create(req.body);

    try {
      await Notification.create({
        title: "Site Delay Reported",
        message: `Site bottleneck flagged: ${delay.name || "Task"} has been delayed by ${delay.delay || "unspecified duration"}.`,
        role: "project_manager",
        type: "warning",
      });
      await Notification.create({
        title: "Engineering Delay Alert",
        message: `Delay logged for ${delay.name || "Task"} (${delay.due || "Due date"}).`,
        role: "admin",
        type: "warning",
      });
    } catch (notifErr) {
      console.error("Delay notification failed:", notifErr);
    }

    res.status(201).json({ success: true, data: delay });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
