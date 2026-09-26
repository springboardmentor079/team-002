const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const sendEmail = require("../utils/sendEmail");
const { buildPasswordResetEmail, isEmailConfigured } = sendEmail;

// Keep in sync with the `minlength` on the User model password field
const MIN_PASSWORD_LENGTH = 6;
const BCRYPT_SALT_ROUNDS = 12;

// Generic message so an attacker cannot enumerate registered emails
const GENERIC_FORGOT_PASSWORD_MESSAGE =
  "If an account exists with this email, a password reset link has been sent.";

const INVALID_TOKEN_MESSAGE =
  "Password reset link is invalid or has expired.";

const RESET_SUCCESS_MESSAGE =
  "Password reset successful. Please login with your new password.";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Normalise user supplied email before it hits the database
const normalizeEmail = (email) => String(email).trim().toLowerCase();

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

// SHA-256 is sufficient here: the token is 256 bits of CSPRNG output, so there
// is nothing to brute force and the plaintext token never touches the database.
const hashResetToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

const getResetTokenExpiryMs = () => {
  const minutes = Number.parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES, 10);
  return (Number.isFinite(minutes) && minutes > 0 ? minutes : 10) * 60 * 1000;
};

// Frontend base URL comes from the environment, never hardcoded
const getFrontendUrl = () => {
  const url = (process.env.FRONTEND_URL || "").trim().replace(/\/+$/, "");
  return url || "http://localhost:5173";
};

const buildResetUrl = (rawToken) =>
  `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;

// ================= PROFILE PHOTO UPLOAD =================
// Reuses the same multer disk-storage approach as the existing document
// upload feature: files land in `uploads/` which server.js already serves
// statically at /uploads. No new upload infrastructure is introduced.

const AVATAR_DIR = path.join(__dirname, "..", "uploads", "avatars");

// multer will not create the destination folder for us
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// The extension is derived from the validated MIME type, never from the
// client-supplied filename, so a spoofed upload cannot be stored (and later
// served by express.static) as a script or markup file.
const IMAGE_EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, AVATAR_DIR);
  },
  filename: function (req, file, cb) {
    const ext = IMAGE_EXTENSIONS[file.mimetype] || ".jpg";
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG, WEBP or GIF images are allowed")
      );
    }
    cb(null, true);
  },
}).single("image");

// Delete an uploaded avatar, ignoring any failure (best effort cleanup)
const removeUploadedFile = (filename) => {
  if (!filename) return;
  try {
    const target = path.join(AVATAR_DIR, path.basename(filename));
    if (fs.existsSync(target)) fs.unlinkSync(target);
  } catch {
    // Ignore cleanup errors
  }
};

// Wrap multer so validation/size failures become clean JSON responses
// instead of Express' default HTML 500 page.
const handleAvatarUpload = (req, res, next) => {
  avatarUpload(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Image is too large. Maximum size is 2MB."
          : "Could not upload the image. Please try another file.";

      return res.status(400).json({ success: false, message });
    }

    return res.status(400).json({
      success: false,
      message: err.message || "Could not upload the image.",
    });
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

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    // Generic response regardless of whether the account exists, so this
    // endpoint can never be used to discover registered email addresses.
    if (user) {
      // 256 bits of cryptographically secure randomness (single use only)
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = hashResetToken(rawToken);
      const expiryMs = getResetTokenExpiryMs();
      const expireAt = new Date(Date.now() + expiryMs);

      // Overwrite any previous token so only one link is ever valid
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            resetPasswordToken: hashedToken,
            resetPasswordExpire: expireAt,
          },
        }
      );

      const resetUrl = buildResetUrl(rawToken);
      const expiryMinutes = Math.round(expiryMs / (60 * 1000));
      const { subject, text, html } = buildPasswordResetEmail({
        name: user.name,
        resetUrl,
        expiryMinutes,
      });

      try {
        // The raw token is only ever present in the email body sent to the
        // account owner. It is never logged and never returned over the API.
        await sendEmail({ email: user.email, subject, text, html });
      } catch (mailError) {
        // Still answer with the generic success message to avoid leaking
        // whether the account exists or whether SMTP is misconfigured.
        console.error(
          `[forgotPassword] Email delivery failed for user ${user._id}: ${
            mailError instanceof Error ? mailError.message : "unknown error"
          }`
        );
      }
    }

    res.status(200).json({
      success: true,
      message: GENERIC_FORGOT_PASSWORD_MESSAGE,
    });
  } catch (error) {
    console.error(
      `[forgotPassword] Unexpected error: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

// ================= RESET PASSWORD =================

const resetPassword = async (req, res) => {
  try {
    // Accept the token from the request body (POST) or the URL (legacy PUT)
    const rawToken =
      (req.body && req.body.token) || (req.params && req.params.token);

    if (!rawToken || !String(rawToken).trim()) {
      return res.status(400).json({
        success: false,
        message: INVALID_TOKEN_MESSAGE,
      });
    }

    const { password, confirmPassword } = req.body || {};

    if (!password || !String(password).length) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      });
    }

    if (typeof confirmPassword === "string" && confirmPassword.length) {
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match",
        });
      }
    }

    const hashedToken = hashResetToken(String(rawToken).trim());

    const user = await User.findOne({ resetPasswordToken: hashedToken }).select(
      "+resetPasswordToken +resetPasswordExpire"
    );

    // Covers invalid tokens, already used tokens and expired tokens
    if (
      !user ||
      !user.resetPasswordExpire ||
      user.resetPasswordExpire.getTime() <= Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: INVALID_TOKEN_MESSAGE,
      });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Atomic update guarded by the still-valid token, which makes the token
    // strictly single use even if two requests arrive at the same moment.
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: new Date() },
      },
      {
        $set: { password: hashedPassword },
        $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 },
      }
    );

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: INVALID_TOKEN_MESSAGE,
      });
    }

    res.status(200).json({
      success: true,
      message: RESET_SUCCESS_MESSAGE,
    });
  } catch (error) {
    console.error(
      `[resetPassword] Unexpected error: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

// ================= PROFILE =================

// Build the only shape of a user that is ever allowed to leave the API.
// `password`, `resetPasswordToken` and `resetPasswordExpire` are excluded by
// the schema (select: false) and are never referenced here.
const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  department: user.department || "",
  profileImage: user.profileImage || "",
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// The authenticated user always comes from the JWT via the `protect`
// middleware, so a user can never read or edit somebody else's profile.
const getAuthenticatedUserId = (req) =>
  req.user && (req.user._id || req.user.id);

// GET /api/auth/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(getAuthenticatedUserId(req));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error(
      `[getUserProfile] Unexpected error: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

// PUT /api/auth/profile
// Only the whitelisted fields below are ever written. `email` and `role` are
// deliberately ignored so a user can neither change their login identity nor
// escalate their own privileges.
const updateUserProfile = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { name, phone, department } = req.body || {};

    const updates = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }
      if (trimmedName.length > 120) {
        return res.status(400).json({
          success: false,
          message: "Name must be 120 characters or fewer",
        });
      }
      updates.name = trimmedName;
    }

    if (phone !== undefined) {
      const trimmedPhone = String(phone).trim();
      // Accept digits, spaces and the usual separators only
      if (trimmedPhone && !/^[0-9+()\-\s]{6,20}$/.test(trimmedPhone)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid phone number (6-20 digits, optional +, -, ( ) and spaces)",
        });
      }
      updates.phone = trimmedPhone;
    }

    if (department !== undefined) {
      const trimmedDepartment = String(department).trim();
      if (trimmedDepartment.length > 120) {
        return res.status(400).json({
          success: false,
          message: "Department must be 120 characters or fewer",
        });
      }
      updates.department = trimmedDepartment;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No profile fields to update",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error(
      `[updateUserProfile] Unexpected error: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      });
    }

    if (
      typeof confirmPassword === "string" &&
      confirmPassword.length &&
      confirmPassword !== newPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password",
      });
    }

    // The password field is select: false, so request it explicitly
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Your current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully. Please use your new password the next time you sign in.",
    });
  } catch (error) {
    console.error(
      `[changePassword] Unexpected error: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

// POST /api/auth/profile-image
// Reuses the project's existing multer + local `uploads/` infrastructure.
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image to upload",
      });
    }

    const user = await User.findById(getAuthenticatedUserId(req));

    if (!user) {
      // Remove the orphaned upload straight away
      removeUploadedFile(req.file.filename);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const previousImage = user.profileImage;

    user.profileImage = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    // Best effort cleanup of the replaced avatar
    if (previousImage && previousImage !== user.profileImage) {
      removeUploadedFile(path.basename(previousImage));
    }

    res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      user: toPublicUser(user),
    });
  } catch (error) {
    if (req.file) removeUploadedFile(req.file.filename);

    console.error(
      `[uploadProfileImage] Unexpected error: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

// DELETE /api/auth/profile-image
const removeProfileImage = async (req, res) => {
  try {
    const user = await User.findById(getAuthenticatedUserId(req));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.profileImage) {
      removeUploadedFile(path.basename(user.profileImage));
    }

    user.profileImage = "";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile photo removed",
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error(
      `[removeProfileImage] Unexpected error: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadProfileImage,
  removeProfileImage,
  avatarUpload,
  handleAvatarUpload,
  MIN_PASSWORD_LENGTH,
  isEmailConfigured,
  toPublicUser,
};
