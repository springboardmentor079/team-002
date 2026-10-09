const mongoose = require("mongoose");

// =====================================================
// MAINTENANCE SCHEDULING
// Single source of truth for the module. The maintenance
// category list is exported so the API, the validation
// messages and the frontend filter options can never drift.
// Add a new category here and it is valid everywhere.
// =====================================================

const MAINTENANCE_TYPES = [
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

// "Overdue" is never stored: it is derived from the scheduled
// date/time of a task that is still "Scheduled" (see
// resolveEffectiveStatus) so a status can never be random.
const MAINTENANCE_STATUSES = [
  "Scheduled",
  "In Progress",
  "Completed",
  "Cancelled",
];

const MAINTENANCE_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const maintenanceSchema = new mongoose.Schema(
  {
    // Human readable reference shown in the UI and used by search
    maintenanceId: {
      type: String,
      required: [true, "Maintenance ID is required"],
      unique: true,
      trim: true,
    },

    title: {
      type: String,
      required: [true, "Maintenance title is required"],
      trim: true,
      maxlength: 160,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    maintenanceType: {
      type: String,
      required: [true, "Maintenance type is required"],
      enum: {
        values: MAINTENANCE_TYPES,
        message:
          "{VALUE} is not a valid maintenance type",
      },
      index: true,
    },

    // Real project / site reference (ObjectId is enough, the
    // project name is resolved with populate)
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project / site is required"],
      index: true,
    },

    // Optional asset. Null means the task is not tied to a machine
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      default: null,
    },

    // Real user reference of the worker / technician
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
      index: true,
    },

    // "HH:mm" - optional. Combined with scheduledDate by the
    // controller into scheduledFor so "overdue" and the date
    // filters are a single indexed comparison instead of
    // string maths on every read.
    scheduledTime: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (value) =>
          !value || TIME_PATTERN.test(value),
        message: "Scheduled time must be in HH:mm format",
      },
    },

    scheduledFor: {
      type: Date,
      default: null,
      index: true,
    },

    priority: {
      type: String,
      enum: {
        values: MAINTENANCE_PRIORITIES,
        message: "{VALUE} is not a valid priority",
      },
      default: "Medium",
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: MAINTENANCE_STATUSES,
        message: "{VALUE} is not a valid status",
      },
      default: "Scheduled",
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    completedAt: {
      type: Date,
      default: null,
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

// Backs the default list sort (upcoming / recently updated)
// and the "overdue" queries.
maintenanceSchema.index({ status: 1, scheduledFor: 1 });
maintenanceSchema.index({ createdAt: -1 });

// =====================================================
// HELPERS
// =====================================================

// A task is overdue while it is still "Scheduled" and its
// scheduled date/time is in the past. Completed and cancelled
// work is never overdue, whatever the schedule says.
const isOverdue = (record, now = new Date()) => {
  if (!record || record.status !== "Scheduled") return false;
  if (!record.scheduledFor) return false;

  return new Date(record.scheduledFor).getTime() <= now.getTime();
};

// Status shown in the UI / API. "Overdue" is added on the fly
// so the stored status stays factual.
const resolveEffectiveStatus = (record, now = new Date()) =>
  isOverdue(record, now) ? "Overdue" : record.status;

// Counts for the dashboard summary cards. Everything is read
// from MongoDB, nothing is estimated on the client.
maintenanceSchema.statics.getSummary = async function (
  scope = {},
  now = new Date()
) {
  const [row] = await this.aggregate([
    { $match: scope },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        scheduled: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "Scheduled"] },
                  {
                    $or: [
                      { $gt: ["$scheduledFor", now] },
                      { $eq: ["$scheduledFor", null] },
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "Scheduled"] },
                  { $ne: ["$scheduledFor", null] },
                  { $lte: ["$scheduledFor", now] },
                ],
              },
              1,
              0,
            ],
          },
        },
        inProgress: {
          $sum: {
            $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0],
          },
        },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
          },
        },
        cancelled: {
          $sum: {
            $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0],
          },
        },
        critical: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$priority", "Critical"] },
                  { $ne: ["$status", "Completed"] },
                  { $ne: ["$status", "Cancelled"] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return {
    total: row?.total || 0,
    scheduled: row?.scheduled || 0,
    overdue: row?.overdue || 0,
    inProgress: row?.inProgress || 0,
    completed: row?.completed || 0,
    cancelled: row?.cancelled || 0,
    critical: row?.critical || 0,
  };
};

const Maintenance = mongoose.model(
  "Maintenance",
  maintenanceSchema
);

module.exports = Maintenance;
module.exports.MAINTENANCE_TYPES = MAINTENANCE_TYPES;
module.exports.MAINTENANCE_STATUSES = MAINTENANCE_STATUSES;
module.exports.MAINTENANCE_PRIORITIES = MAINTENANCE_PRIORITIES;
module.exports.isOverdue = isOverdue;
module.exports.resolveEffectiveStatus = resolveEffectiveStatus;
