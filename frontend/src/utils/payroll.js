import { canEdit, hasRole } from "./auth";

// =====================================================
// PAYROLL MONITORING HELPERS
// Shared by the register page, the details page, the form
// modal and the payment-status chips, so status colours,
// labels, money formatting and permissions can never drift
// between screens.
//
// Nothing in here invents a value. The User collection stores
// no salary information, so a figure that was never captured
// arrives as null and is rendered as "Not available" rather
// than being defaulted to zero.
// =====================================================

// Kept in sync with backend/models/Payroll.js. The form and the
// filters prefer the values returned by GET /payroll/options, so
// these are only the fallback labels.
export const PAYMENT_STATUSES = [
  "Pending",
  "Processing",
  "Paid",
  "Cancelled",
];

export const PAYMENT_METHODS = [
  "Bank Transfer",
  "UPI",
  "Cash",
  "Cheque",
  "Not specified",
];

// Roles that can be the subject of a payroll run. Admins, project
// managers and clients are payers, not payees.
export const PAYABLE_ROLES = [
  "worker",
  "contractor",
  "site_engineer",
];

// Mirrors the backend transition map. "Cancelled" is reachable
// from either open state; a disbursement that is already Paid can
// still be moved to Cancelled, and a cancelled run can be
// reinstated by a manager through the edit form.
export const STATUS_TONE = {
  Pending: "pending",
  Processing: "processing",
  Paid: "paid",
  Cancelled: "cancelled",
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
// The read set matches the API's VIEW_ROLES exactly, so a role
// that is refused here is also refused by the backend. A worker
// reaches this page to read their own payslips, which is why
// "worker" is a viewer even though it is never a writer.
// =====================================================

export const canViewPayroll = () =>
  hasRole("admin", "project_manager", "worker");

// An admin or a project manager may raise and edit a payroll run.
export const canCreatePayroll = () => canEdit("payroll");

// Cancelled runs are kept for the audit trail, so removing one
// outright is reserved for an admin.
export const canDeletePayroll = () => canEdit("payroll_delete");

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
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

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

// "Not available" is a real, meaningful answer on this screen: a
// null workingDays / overtimeHours / overtimeAmount means nobody
// ever captured it, which is not the same as the worker having
// logged zero. Collapsing the two would be a lie, so a number
// field that is null renders as text and a stored zero renders as
// the digit.
export const NOT_AVAILABLE = "Not available";

export const isCaptured = (value) =>
  value !== null && value !== undefined && value !== "";

export const formatNumber = (value) => {
  if (!isCaptured(value)) return NOT_AVAILABLE;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return NOT_AVAILABLE;

  return parsed.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatMoney = (value) => {
  if (!isCaptured(value)) return NOT_AVAILABLE;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return NOT_AVAILABLE;

  return `₹${parsed.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Counts on the summary cards are always aggregations over
// MongoDB, so a missing figure is a genuine zero and is rendered
// as such - unlike an uncaptured money field.
export const formatCount = (value) =>
  Number.isFinite(Number(value)) ? Number(value).toLocaleString("en-IN") : "0";

export const formatHours = (value) => {
  if (!isCaptured(value)) return NOT_AVAILABLE;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return NOT_AVAILABLE;

  return `${parsed} hr${parsed === 1 ? "" : "s"}`;
};

export const formatDays = (value) => {
  if (!isCaptured(value)) return NOT_AVAILABLE;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return NOT_AVAILABLE;

  return `${parsed} day${parsed === 1 ? "" : "s"}`;
};

// =====================================================
// LABELS
// =====================================================

export const employeeLabel = (employee) => {
  if (!employee || !employee._id) return "Unknown worker";
  return employee.name || "Unnamed worker";
};

export const projectLabel = (project) => {
  if (!project || !project._id) return "No project linked";
  return project.name || "Unnamed project";
};

export const roleLabel = (role) =>
  SHORT_ROLE_LABELS[role] || role || "";

// A run is only "overdue" in the everyday sense while it is still
// Pending, which is what the API's isOutstanding reports.
export const isOutstanding = (record) =>
  Boolean(record) && record.paymentStatus === "Pending";

// A pay period label is stored as free text ("September 2026",
// "01 Sep - 15 Sep 2026"), so it is shown exactly as the manager
// typed it rather than being reformatted.
export const payPeriodLabel = (record) => {
  const label = record?.payPeriod;
  if (label) return label;

  const start = parseDate(record?.periodStart);
  const end = parseDate(record?.periodEnd);

  if (start && end) {
    const sameMonth =
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear();

    if (sameMonth) {
      return start.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
    }

    return `${formatDate(start)} - ${formatDate(end)}`;
  }

  if (start) return formatDate(start);
  if (end) return formatDate(end);

  return "No pay period set";
};
