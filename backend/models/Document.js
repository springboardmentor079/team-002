const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Document name is required"],
    },
    category: {
      type: String,
      required: true,
      default: "General",
    },
    project: {
      type: String,
      required: true,
      default: "All Projects",
    },
    uploadedBy: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);
