const Notification = require("../models/Notification");

// ================= HELPERS =================

const buildRoleQuery = (user) => {
  if (!user) return {};
  return {
    $or: [{ role: "all" }, { role: user.role }],
  };
};

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const query = buildRoleQuery(req.user);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 });

    const totalUnread = await Notification.countDocuments({
      ...query,
      read: false,
    });

    res.status(200).json({
      success: true,
      data: notifications,
      totalUnread,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const query = buildRoleQuery(req.user);

    const totalUnread = await Notification.countDocuments({
      ...query,
      read: false,
    });

    res.status(200).json({
      success: true,
      totalUnread,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/notifications/mark-all-read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { ...buildRoleQuery(req.user), read: false },
      { read: true }
    );
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};