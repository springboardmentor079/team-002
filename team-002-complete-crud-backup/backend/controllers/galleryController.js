const Gallery = require("../models/Gallery");
const Project = require("../models/Project");

const clientProjectFilter = (user) => ({
  $or: [{ clientId: user._id }, { client: user.name }, { client: user.email }],
});

const ensureProject = async (projectId) => {
  const project = await Project.findById(projectId);
  return project || null;
};

const getGallery = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "client") {
      const projects = await Project.find(clientProjectFilter(req.user)).select("_id");
      query.projectId = { $in: projects.map((p) => p._id) };
    }

    const items = await Gallery.find(query)
      .populate("projectId", "name code")
      .sort({ createdAt: -1 });

    const stats = {
      totalPhotos: items.length,
      droneFlights: new Set(items.filter((i) => i.source === "Drone").map((i) => i.date)).size,
      cameraNodes: items.filter((i) => i.source === "Camera").length,
      tours360: items.filter((i) => i.source === "360 Tour").length,
      qualityVerified: items.length
        ? Math.round((items.filter((i) => i.qualityVerified).length / items.length) * 100)
        : 0,
    };

    res.json({ success: true, stats, count: items.length, data: items });
  } catch (error) {
    console.error("Get gallery error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch gallery" });
  }
};

const createGalleryItem = async (req, res) => {
  try {
    const { projectId, title, imageUrl, tag, description, date, source, qualityVerified } = req.body;
    if (!projectId || !String(title || "").trim() || !String(imageUrl || "").trim()) {
      return res.status(400).json({ success: false, message: "Project, title and image are required" });
    }
    const project = await ensureProject(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const item = await Gallery.create({
      projectId,
      title: title.trim(),
      imageUrl,
      tag: tag || "Site Update",
      description: description || "",
      date: date || undefined,
      source: source || "Camera",
      qualityVerified: qualityVerified !== false,
    });

    res.status(201).json({
      success: true,
      message: "Gallery item created",
      data: await Gallery.findById(item._id).populate("projectId", "name code"),
    });
  } catch (error) {
    console.error("Create gallery error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGalleryItem = async (req, res) => {
  try {
    if (req.body.projectId) {
      const project = await ensureProject(req.body.projectId);
      if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    }
    const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("projectId", "name code");

    if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });
    res.json({ success: true, message: "Gallery item updated", data: item });
  } catch (error) {
    console.error("Update gallery error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });
    res.json({ success: true, message: "Gallery item deleted" });
  } catch (error) {
    console.error("Delete gallery error:", error);
    res.status(500).json({ success: false, message: "Failed to delete gallery item" });
  }
};

module.exports = { getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem };
