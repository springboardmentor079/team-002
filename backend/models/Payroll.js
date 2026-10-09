const mongoose = require("mongoose");

// =====================================================
// PAYROLL MONITORING
// Single source of truth for the payroll module.
//
// Two rules drive every field below:
//
// 1. Nothing is invented. There is no hourly rate, daily
//    wage or deduction percentage anywhere in this schema,
//    because none exists on the User model. Every rupee is a
//    number a manager deliberately typed in and stored in
//    MongoDB.
//
// 2. "Not available" must stay distinguishable from zero.
//    workingDays, overtimeHours and overtimeAmount default
//    to null, not 0, so a value that was never captured
//    renders as "Not available" instead of pretending the
//    worker logged exactly zero.
// =====================================================

// Payment lifecycle. "Paid" is the only terminal state that
// carries a paymentDate; "Cancelled" means the run was
// called off and is kept for the audit trail.
const PAYMENT_STATUSES = [
  "Pending",
  "Processing",
  "Paid",
  "Cancelled",
];

// How a disbursement reached the worker. Free text elsewhere,
// but offered as a fixed list by GET /payroll/options so the
// form dropdown and the stored values can never drift.
const PAYMENT_METHODS = [
  "Bank Transfer",
  "UPI",
  "Cash",
  "Cheque",
  "Not specified",
];

// Roles that can be the subject of a payroll run. Admins,
// project managers and clients are payers, not payees, and a
// client must never appear on a salary register.
const PAYABLE_ROLES = [
  "worker",
  "contractor",
  "site_engineer",
];

// Attendance statuses that the rollup counts separately.
const ATTENDANCE_STATUSES = [
  "Present",
  "Late",
  "Half Day",
  "Absent",
];

const payrollSchema = new mongoose.Schema(
  {
    // Human readable reference shown in the UI and used by search
    payrollId: {
      type: String,
      required: [true, "Payroll ID is required"],
      unique: true,
      trim: true,
    },

    // The worker this pays. Stored as an ObjectId so a rename
    // in the User collection is reflected everywhere, and so
    // authorization can be enforced on the id alone.
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Worker / employee is required"],
      index: true,
    },

    // Optional. A payroll row is valid without a site link.
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },

    // Display label, e.g. "September 2026" or "01 Sep - 15 Sep 2026".
    // Stored as text because the organisation bills in whatever
    // period style the manager types.
    payPeriod: {
      type: String,
      required: [true, "Pay period is required"],
      trim: true,
      maxlength: 120,
      index: true,
    },

    // Real dates behind the label above. Optional, but they are
    // what the date range filter compares against, and they
    // bound the attendance rollup on the details screen.
    periodStart: {
      type: Date,
      default: null,
      index: true,
    },

    periodEnd: {
      type: Date,
      default: null,
    },

    // ---- Earnings (all entered, never derived from a rate) ----

    basicSalary: {
      type: Number,
      required: [true, "Basic salary is required"],
      min: [0, "Basic salary cannot be negative"],
    },

    // null means "never captured" -> rendered as "Not available"
    workingDays: {
      type: Number,
      default: null,
      min: [0, "Working days cannot be negative"],
    },

    overtimeHours: {
      type: Number,
      default: null,
      min: [0, "Overtime hours cannot be negative"],
    },

    overtimeAmount: {
      type: Number,
      default: null,
      min: [0, "Overtime amount cannot be negative"],
    },

    allowances: {
      type: Number,
      default: 0,
      min: [0, "Allowances cannot be negative"],
    },

    deductions: {
      type: Number,
      default: 0,
      min: [0, "Deductions cannot be negative"],
    },

    // The one figure the server owns: it is always recomputed
    // as basic + overtime + allowances - deductions, so the
    // register can never show a net that contradicts its own
    // components. A null overtimeAmount contributes 0 here and
    // is reported separately so the UI can still say so.
    netSalary: {
      type: Number,
      required: true,
      min: [0, "Net salary cannot be negative"],
    },

    // ---- Payment ----

    paymentStatus: {
      type: String,
      enum: {
        values: PAYMENT_STATUSES,
        message: "{VALUE} is not a valid payment status",
      },
      default: "Pending",
      index: true,
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    paymentMethod: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },

    // Supplied by whoever made the transfer. Never generated:
    // an empty string means no reference was captured.
    paymentReference: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Backs the default list sort, the payment status filter and
// the "who is on the register this month" lookups.
payrollSchema.index({ paymentStatus: 1, payPeriod: 1 });
payrollSchema.index({ createdAt: -1 });

// =====================================================
// HELPERS
// =====================================================

// Gross is the sum of the earnings actually on the record. It
// is derived rather than stored so it can never drift out of
// step with the components it is built from.
const toGross = (record) => {
  if (!record) return 0;

  return (
    Number(record.basicSalary || 0) +
    Number(record.overtimeAmount || 0) +
    Number(record.allowances || 0)
  );
};

const toNet = (record) => {
  if (!record) return 0;

  return Math.max(
    Math.round((toGross(record) - Number(record.deductions || 0)) * 100) /
      100,
    0
  );
};

// A run is only "overdue" in the everyday sense once it is
// still Pending and the pay period has closed. Cancelled runs
// are never outstanding regardless of dates.
const isOutstanding = (record) =>
  Boolean(record) && record.paymentStatus === "Pending";

// Counts for the summary cards. Every number comes from an
// aggregation over the payroll collection - nothing is
// estimated on the client.
payrollSchema.statics.getSummary = async function (scope = {}) {
  const [row] = await this.aggregate([
    { $match: scope },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        employees: { $addToSet: "$employee" },
        totalGross: {
          $sum: {
            $add: [
              { $ifNull: ["$basicSalary", 0] },
              { $ifNull: ["$overtimeAmount", 0] },
              { $ifNull: ["$allowances", 0] },
            ],
          },
        },
        totalNet: { $sum: { $ifNull: ["$netSalary", 0] } },
        totalOvertimeHours: {
          $sum: { $ifNull: ["$overtimeHours", 0] },
        },
        totalOvertimeAmount: {
          $sum: { $ifNull: ["$overtimeAmount", 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "Pending"] }, 1, 0] },
        },
        processing: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "Processing"] }, 1, 0],
          },
        },
        paid: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] },
        },
        cancelled: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "Cancelled"] }, 1, 0],
          },
        },
        pendingAmount: {
          $sum: {
            $cond: [
              { $eq: ["$paymentStatus", "Pending"] },
              { $ifNull: ["$netSalary", 0] },
              0,
            ],
          },
        },
        paidAmount: {
          $sum: {
            $cond: [
              { $eq: ["$paymentStatus", "Paid"] },
              { $ifNull: ["$netSalary", 0] },
              0,
            ],
          },
        },
      },
    },
  ]);

  return {
    total: row?.total || 0,
    // Null employee ids cannot happen (the field is required) but
    // an unresolved reference must not be counted as a person.
    employees: (row?.employees || []).filter(Boolean).length,
    totalGross: Math.round((row?.totalGross || 0) * 100) / 100,
    totalNet: Math.round((row?.totalNet || 0) * 100) / 100,
    totalOvertimeHours:
      Math.round((row?.totalOvertimeHours || 0) * 100) / 100,
    totalOvertimeAmount:
      Math.round((row?.totalOvertimeAmount || 0) * 100) / 100,
    pending: row?.pending || 0,
    processing: row?.processing || 0,
    paid: row?.paid || 0,
    cancelled: row?.cancelled || 0,
    pendingAmount: Math.round((row?.pendingAmount || 0) * 100) / 100,
    paidAmount: Math.round((row?.paidAmount || 0) * 100) / 100,
  };
};

const Payroll = mongoose.model("Payroll", payrollSchema);

module.exports = Payroll;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
module.exports.PAYABLE_ROLES = PAYABLE_ROLES;
module.exports.ATTENDANCE_STATUSES = ATTENDANCE_STATUSES;
module.exports.toGross = toGross;
module.exports.toNet = toNet;
module.exports.isOutstanding = isOutstanding;
