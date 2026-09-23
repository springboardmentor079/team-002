const express = require("express");
const router = express.Router();
const { getDocuments, uploadDocument, deleteDocument } = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getDocuments).post(protect, uploadDocument);
router.route("/:id").delete(protect, deleteDocument);

module.exports = router;
