const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ================= REGISTER =================

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "client",
    });

    // Generate Token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= LOGIN =================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Get user including password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate Token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= FORGOT PASSWORD =================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token valid for 10 minutes
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
        <h2 style="color: #d97706; margin-top: 0;">BuildTrack Password Reset</h2>
        <p style="color: #334155; font-size: 15px;">Hello <strong>${user.name}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">You requested a password reset for your BuildTrack Construction Management account. Click the button below to reset your password. This link is valid for <strong>10 minutes</strong>.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset My Password</a>
        </div>
        <p style="color: #64748b; font-size: 13px;">Or copy and paste this URL into your browser:<br><a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a></p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: user.email,
      subject: "BuildTrack - Password Reset Request",
      text: `Hello ${user.name},\n\nPlease reset your password using the following link: ${resetUrl}\n\nThis link is valid for 10 minutes.`,
      html: emailHtml,
    });

    res.status(200).json({
      success: true,
      message: emailResult.success
        ? "Password reset email sent successfully"
        : "Reset token generated successfully",
      resetUrl,
      resetToken,
      emailSent: emailResult.success,
      previewUrl: emailResult.previewUrl || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= RESET PASSWORD =================

const resetPassword = async (req, res) => {
  try {
    const resetToken = req.params.token;

    // Hash received token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Validate new password
    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // Hash new password
    user.password = await bcrypt.hash(req.body.password, 12);

    // Remove reset data
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET PROFILE =================

const getProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE PROFILE =================

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, bio, company } = req.body;
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (bio !== undefined) updateFields.bio = bio;
    if (company !== undefined) updateFields.company = company;

    if (email && email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const emailInUse = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
      });
      if (emailInUse) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
      updateFields.email = email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: false,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        bio: user.bio || "",
        company: user.company || "",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};