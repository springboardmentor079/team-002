const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    tag: { type: String, default: "Site Update" },
    description: { type: String, default: "" },
    date: { type: String, default: () => new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
    source: { type: String, enum: ["Drone", "Camera", "360 Tour"], default: "Camera" },
    qualityVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);
