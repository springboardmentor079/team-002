const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables reliably regardless of cwd
dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const metricsRoutes = require("./routes/metricsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const projectRoutes = require("./routes/projectRoutes");
const materialRequestRoutes = require("./routes/materialRequestRoutes");
const workOrderRoutes = require("./routes/workOrderRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const documentRoutes = require("./routes/documentRoutes");
const seedInitialData = require("./config/seedData");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database
connectDB()
  .then(() => {
    seedInitialData();
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
  });

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "BuildTrack Construction Management API Running",
  });
});

// Authentication Routes
app.use("/api/auth", authRoutes);

// Public landing page metrics (mounted before protected role routers)
app.use("/api", metricsRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

// Role Dashboards
app.use("/api/dashboard", dashboardRoutes);

const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

// Feature Modules
app.use("/api/projects", projectRoutes);
app.use("/api/materials", materialRequestRoutes);
app.use("/api/work-orders", workOrderRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/documents", documentRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
