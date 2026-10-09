const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 120,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "admin",
        "project_manager",
        "site_engineer",
        "contractor",
        "worker",
        "client",
      ],
      default: "client",
    },

    // ================= PROFILE FIELDS =================
    // Optional contact / organisation details. Empty string means
    // "not provided" and is rendered as such in the UI.

    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "",
    },

    department: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    // Relative path of the uploaded avatar, e.g. /uploads/avatars/abc.png
    profileImage: {
      type: String,
      trim: true,
      maxlength: 255,
      default: "",
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpire: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
