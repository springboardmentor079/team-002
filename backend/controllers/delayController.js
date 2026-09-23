const Delay = require("../models/Delay");

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
    res.status(201).json({ success: true, data: delay });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
