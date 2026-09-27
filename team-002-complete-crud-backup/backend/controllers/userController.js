const User = require("../models/User");
const bcrypt = require("bcryptjs");

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt, updatedAt: u.updatedAt });

const getMe = async (req, res) => res.json({ success: true, data: publicUser(req.user) });

const updateMe = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ success: false, message: "Name cannot be empty" });
      user.name = String(name).trim();
    }
    if (email !== undefined) {
      const normalized = String(email).trim().toLowerCase();
      const exists = await User.findOne({ email: normalized, _id: { $ne: user._id } });
      if (exists) return res.status(409).json({ success: false, message: "Email is already in use" });
      user.email = normalized;
    }
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ success: false, message: "Current password is required" });
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) return res.status(400).json({ success: false, message: "Current password is incorrect" });
      if (newPassword.length < 6) return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
      user.password = await bcrypt.hash(newPassword, 12);
    }
    await user.save();
    res.json({ success: true, message: "Profile updated successfully", user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.code === 11000 ? "Email is already in use" : error.message });
  }
};

const getClients = async (req, res) => {
  try {
    const clients = await User.find({ role: "client" }).select("name email role createdAt").sort({ name: 1 });
    res.json({ success: true, data: clients });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to fetch clients" }); }
};

module.exports = { getMe, updateMe, getClients };
