const Document = require("../models/Document");
const multer = require("multer");
const path = require("path");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).single("file");

// GET /api/documents
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/documents
exports.uploadDocument = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a file" });
    }

    try {
      const doc = await Document.create({
        name: req.body.name || req.file.originalname,
        category: req.body.category || "General",
        project: req.body.project || "All Projects",
        uploadedBy: req.user?.name || "Admin",
        fileUrl: `/uploads/${req.file.filename}`,
      });
      res.status(201).json({ success: true, data: doc });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
