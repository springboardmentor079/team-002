const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    role: {
      type: String,
      default: "all",
    },
    type: {
      type: String,
      enum: ["info", "alert", "success", "warning"],
      default: "info",
    },
    read: {
      type: Boolean,
      default: false,
    },
    time: {
      type: String,
      default: function () {
        return "Just now";
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
