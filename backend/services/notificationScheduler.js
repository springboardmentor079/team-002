const cron = require("node-cron");
const Shift = require("../models/Shift");
const Attendance = require("../models/Attendance");
const Notification = require("../models/Notification");
const Project = require("../models/Project");

const checkAttendanceAlerts = async () => {
  try {
    const todayRegex = /Today/i;
    const activeShifts = await Shift.find({ status: "Active" });

    // Date range for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    for (const shift of activeShifts) {
      const assignee = shift.supervisor;
      if (!assignee) continue; // Skip if no one assigned

      const attendanceRecord = await Attendance.findOne({
        $or: [{ userName: assignee }, { userEmail: assignee }],
        $or: [{ date: todayRegex }, { date: new Date().toLocaleDateString("en-IN") }, { createdAt: { $gte: startOfDay, $lt: endOfDay } }]
      });

      if (!attendanceRecord) {
        const exist = await Notification.findOne({
          title: "Attendance Alert",
          assignee: assignee,
          createdAt: { $gte: startOfDay, $lt: endOfDay }
        });

        if (!exist) {
          await Notification.create({
            title: "Attendance Alert",
            message: `No attendance punch record found for your assigned shift: ${shift.name}.`,
            role: "worker",
            assignee: assignee,
            type: "warning"
          });
        }
      }
    }
  } catch (error) {
    console.error("Scheduler: checkAttendanceAlerts Error", error);
  }
};

const checkDeadlineNotifications = async () => {
  try {
    const projects = await Project.find({ status: { $ne: "Completed" } });
    const today = new Date();

    for (const project of projects) {
      if (!project.endDate) continue;

      const endDate = new Date(project.endDate);
      if (isNaN(endDate)) continue; // ignore non-standard date strings

      const diffTime = Math.abs(endDate - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 3) {
        const exist = await Notification.findOne({
          title: "Deadline Approaching",
          message: new RegExp(project.name),
        });

        if (!exist) {
          await Notification.create({
            title: "Deadline Approaching",
            message: `Project ${project.name} is due in ${diffDays} day(s).`,
            role: "project_manager",
            assignee: project.manager,
            type: "alert",
          });
        }
      }
    }
  } catch (error) {
    console.error("Scheduler: checkDeadlineNotifications Error", error);
  }
};

const startScheduler = () => {
  // Run every 4 hours
  cron.schedule("0 */4 * * *", () => {
    console.log("Running scheduled notification checks...");
    checkAttendanceAlerts();
    checkDeadlineNotifications();
  });
  console.log("Notification scheduler initialized.");
};

module.exports = startScheduler;
