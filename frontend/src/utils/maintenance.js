import { canEdit, getCurrentUser } from "./auth";

// =====================================================
// MAINTENANCE MODULE HELPERS
// Shared by the list page, the details page, the form
// modal and the dashboard summary card, so status colours,
// labels and permissions can never drift between screens.
// =====================================================

// Kept in sync with backend/models/Maintenance.js. The form
// prefers the values returned by GET /maintenance/options,
// these are the fallback labels.
export const MAINTENANCE_TYPES = [
  "Preventive Maintenance",
  "Corrective Maintenance",
  "Equipment Maintenance",
  "Electrical Maintenance",
  "Mechanical Maintenance",
  "Plumbing Maintenance",
  "Safety Maintenance",
  "Site Maintenance",
  "Other",
];

export const MAINTENANCE_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

// "Overdue" is never stored - the API derives it for a task
// that is still scheduled after its date/time has passed.
export const MAINTENANCE_STATUSES = [
  "Scheduled",
  "In Progress",
  "Completed",
  "Overdue",
  "Cancelled",
];

export const STORED_STATUSES = [
  "Scheduled",
  "In Progress",
  "Completed",
  "Cancelled",
];

// Scheduled -> In Progress -> Completed, plus cancellation
// from either open state. Mirrors the backend transition map.
export const STATUS_TRANSITIONS = {
  Scheduled: ["In Progress", "Completed", "Cancelled"],
  "In Progress": ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

export const STATUS_TONE = {
  Scheduled: "scheduled",
  "In Progress": "in-progress",
  Completed: "completed",
  Overdue: "overdue",
  Cancelled: "cancelled",
};

export const PRIORITY_TONE = {
  Low: "low",
  Medium: "medium",
  High: "high",
  Critical: "critical",
};

export const SHORT_ROLE_LABELS = {
  admin: "Admin",
  project_manager: "Project Manager",
  site_engineer: "Site Engineer",
  contractor: "Contractor",
  worker: "Worker",
  client: "Client",
};

// =====================================================
// PERMISSIONS
// Reuses the existing canEdit() role matrix in utils/auth
// =====================================================

export const canCreateMaintenance = () => canEdit("maintenance");

export const canDeleteMaintenance = () =>
  canEdit("maintenance_delete");

const isAssignee = (record) => {
  const user = getCurrentUser();
  const assignedTo = record?.assignedTo?._id;

  if (!user?._id || !assignedTo) return false;

  return String(assignedTo) === String(user._id);
};

// Managers plan and reschedule any task; an assignee can only
// move their own job through the workflow (enforced again on
// the API).
export const canEditMaintenanceRecord = (record) =>
  canCreateMaintenance() || isAssignee(record);

export const nextStatuses = (record) => {
  const stored = record?.storedStatus || record?.status;
  const allowed = STATUS_TRANSITIONS[stored] || [];
  const effective = record?.status;

  // An overdue task is still stored as "Scheduled", so the
  // backend transitions are shown as-is.
  if (effective && effective !== stored && !allowed.length) {
    return [];
  }

  return allowed;
};

// =====================================================
// FORMATTING
// =====================================================

const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value) => {
  const date = parseDate(value);
  if (!date) return "--";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatTime = (value) => {
  if (!value) return "--";

  const [hours, minutes] = String(value)
    .split(":")
    .map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return "--";
  }

  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

export const formatDateTime = (value) => {
  const date = parseDate(value);
  if (!date) return "--";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatRelativeTime = (value) => {
  const date = parseDate(value);
  if (!date) return "--";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${
    diffHours === 1 ? "" : "s"
  } ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return formatDate(date);
};

// yyyy-mm-dd for <input type="date">
export const toDateInputValue = (value) => {
  const date = parseDate(value);
  if (!date) return "";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
};

export const projectLabel = (project) => {
  if (!project) return "No project linked";
  return project.name || "Unnamed project";
};

export const equipmentLabel = (equipment) => {
  if (!equipment) return "No equipment";
  return equipment.name || "Unnamed asset";
};

export const assigneeLabel = (assignee) => {
  if (!assignee) return "Unassigned";
  return assignee.name || "Unassigned";
};

export const roleLabel = (role) =>
  SHORT_ROLE_LABELS[role] || role || "";
