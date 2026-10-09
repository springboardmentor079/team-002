const mongoose = require("mongoose");

const Maintenance = require("../models/Maintenance");
const Project = require("../models/Project");
const Equipment = require("../models/Equipment");
const User = require("../models/User");
const Notification = require("../models/Notification");

// =====================================================
// MAINTENANCE SCHEDULING CONTROLLER
// Every record is read from / written to MongoDB. Project,
// equipment and worker references are stored as ObjectIds and
// resolved on read, so a record created today still shows the
// current name after a rename.
// =====================================================

// Roles that take part in the maintenance module. Everyone
// else (client) is rejected by the route guard.
const VIEW_ROLES = [
  "admin",
  "project_manager",
  "site_engineer",
  "contractor",
  "worker",
];

// Roles allowed to plan and reassign maintenance work
const MANAGE_ROLES = [
  "admin",
  "project_manager",
  "site_engineer",
];

// Workers and contractors may only move a task they own
// through the workflow - they can never reschedule it.
const STATUS_TRANSITIONS = {
  Scheduled: ["In Progress", "Completed", "Cancelled"],
  "In Progress": ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

// A user can be assigned a maintenance job
const ASSIGNABLE_ROLES = [
  "worker",
  "contractor",
  "site_engineer",
  "project_manager",
];

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const cleanString = (value) =>
  typeof value === "string" ? value.trim() : "";

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Mongo treats an empty / undefined value as "no filter", so
// the conditions are combined explicitly instead.
const combineConditions = (conditions) => {
  const active = conditions.filter(Boolean);

  if (active.length === 0) return {};
  if (active.length === 1) return active[0];

  return { $and: active };
};

// scheduledDate + optional scheduledTime -> one comparable date.
// Without a time the task is due at the end of that day, which
// keeps "scheduled today" from being flagged overdue at 09:00.
const buildScheduledFor = (scheduledDate, scheduledTime) => {
  if (!scheduledDate) return null;

  const base = new Date(scheduledDate);
  if (Number.isNaN(base.getTime())) return null;

  const time = cleanString(scheduledTime);

  if (!TIME_PATTERN.test(time)) {
    base.setHours(23, 59, 59, 999);
    return base;
  }

  const [hours, minutes] = time.split(":").map(Number);
  base.setHours(hours, minutes, 0, 0);

  return base;
};

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) &&
  String(new mongoose.Types.ObjectId(value)) === String(value);

// Resolves project / equipment / user references for the client
const withReferences = (query) =>
  query
    .populate("project", "name code location")
    .populate("equipment", "name type status")
    .populate("assignedTo", "name role department")
    .populate("createdBy", "name role");

const referenceShape = (ref, fields) => {
  if (!ref || !ref._id) return null;

  return fields.reduce(
    (shape, field) => ({ ...shape, [field]: ref[field] }),
    { _id: ref._id }
  );
};

// Single response shape for the list, the details page and the
// create / update responses so the frontend never has to guess.
const toApiRecord = (document) => {
  const record =
    document && typeof document.toObject === "function"
      ? document.toObject()
      : document;

  if (!record) return null;

  const now = new Date();
  const overdue = Maintenance.isOverdue(record, now);

  return {
    _id: record._id,
    maintenanceId: record.maintenanceId,
    title: record.title,
    description: record.description || "",
    maintenanceType: record.maintenanceType,

    project: referenceShape(record.project, [
      "name",
      "code",
      "location",
    ]),
    equipment: referenceShape(record.equipment, [
      "name",
      "type",
      "status",
    ]),
    assignedTo: referenceShape(record.assignedTo, [
      "name",
      "role",
      "department",
    ]),
    createdBy: referenceShape(record.createdBy, ["name", "role"]),

    scheduledDate: record.scheduledDate || null,
    scheduledTime: record.scheduledTime || "",
    scheduledFor: record.scheduledFor || null,

    priority: record.priority,

    // Display status (may be Overdue) and the persisted one
    status: overdue ? "Overdue" : record.status,
    storedStatus: record.status,
    isOverdue: overdue,

    notes: record.notes || "",
    completedAt: record.completedAt || null,
    createdAt: record.createdAt || null,
    updatedAt: record.updatedAt || null,
  };
};

// =====================================================
// ROLE SCOPING
// =====================================================

// A project manager only sees maintenance for the projects they
// manage. A worker only sees the jobs assigned to them. Freshly
// registered managers (no project yet) fall back to everything so
// the screen is never mysteriously empty - same rule the project
// dashboard already uses.
const buildScopeFilter = async (user) => {
  if (!user) return { _id: null };

  switch (user.role) {
    case "admin":
    case "site_engineer":
    case "contractor":
      return {};

    case "project_manager": {
      const projectIds = await Project.find({
        manager: user.name,
      }).distinct("_id");

      return projectIds.length
        ? { project: { $in: projectIds } }
        : {};
    }

    case "worker":
      return {
        $or: [
          { assignedTo: user._id },
          { createdBy: user._id },
        ],
      };

    default:
      return { _id: null };
  }
};

// Search runs against the real collections: a match on the task
// itself, plus the resolved names of the linked project,
// equipment and worker.
const buildSearchFilter = async (search) => {
  const term = cleanString(search);
  if (!term) return null;

  const pattern = new RegExp(escapeRegExp(term), "i");

  const [projects, equipment, users] = await Promise.all([
    Project.find({
      $or: [{ name: pattern }, { code: pattern }, { location: pattern }],
    }).distinct("_id"),
    Equipment.find({
      $or: [{ name: pattern }, { type: pattern }],
    }).distinct("_id"),
    User.find({
      $or: [{ name: pattern }, { email: pattern }],
    }).distinct("_id"),
  ]);

  return {
    $or: [
      { title: pattern },
      { description: pattern },
      { notes: pattern },
      { maintenanceId: pattern },
      { maintenanceType: pattern },
      ...(projects.length ? [{ project: { $in: projects } }] : []),
      ...(equipment.length ? [{ equipment: { $in: equipment } }] : []),
      ...(users.length ? [{ assignedTo: { $in: users } }] : []),
    ],
  };
};

// "Overdue" is a derived status, so it is translated into the
// query that produces it instead of being stored.
const buildStatusFilter = (status, now) => {
  const requested = cleanString(status);
  if (!requested) return null;

  if (requested === "Overdue") {
    return {
      status: "Scheduled",
      scheduledFor: { $ne: null, $lte: now },
    };
  }

  if (requested === "Scheduled") {
    return {
      status: "Scheduled",
      $or: [
        { scheduledFor: { $gt: now } },
        { scheduledFor: null },
      ],
    };
  }

  return { status: requested };
};

const buildDateFilter = (from, to) => {
  const start = cleanString(from);
  const end = cleanString(to);

  if (!start && !end) return null;

  const range = {};

  if (start) {
    const startDate = new Date(start);
    if (!Number.isNaN(startDate.getTime())) {
      range.$gte = startDate;
    }
  }

  if (end) {
    const endDate = new Date(end);
    if (!Number.isNaN(endDate.getTime())) {
      endDate.setHours(23, 59, 59, 999);
      range.$lte = endDate;
    }
  }

  return Object.keys(range).length ? { scheduledDate: range } : null;
};

const buildIdFilter = (value) => {
  const id = cleanString(value);
  if (!id || !isValidObjectId(id)) return null;

  return { _id: id };
};

const parseLimit = (value, fallback = 10) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;

  return Math.min(parsed, 100);
};

const SORT_OPTIONS = {
  scheduledFor: { scheduledFor: 1 },
  "-scheduledFor": { scheduledFor: -1 },
  createdAt: { createdAt: 1 },
  "-createdAt": { createdAt: -1 },
  updatedAt: { updatedAt: 1 },
  "-updatedAt": { updatedAt: -1 },
};

const buildSort = (value) => {
  const key = cleanString(value);
  if (!key) return { scheduledFor: 1, createdAt: -1 };

  return SORT_OPTIONS[key] || { scheduledFor: 1, createdAt: -1 };
};

// =====================================================
// NOTIFICATIONS (existing notification feed)
// =====================================================

const pushNotification = async (payload) => {
  try {
    await Notification.create(payload);
  } catch (error) {
    console.error(
      "Failed to create maintenance notification:",
      error.message
    );
  }
};

// =====================================================
// GET /api/maintenance/options
// Reference data for the create / edit form and the filters.
// Everything comes from MongoDB - no hardcoded names.
// =====================================================

const getMaintenanceOptions = async (req, res) => {
  try {
    const [projects, equipment, assignees] = await Promise.all([
      Project.find({}, "name code location status")
        .sort({ name: 1 })
        .lean(),
      Equipment.find({}, "name type status")
        .sort({ name: 1 })
        .lean(),
      User.find(
        { role: { $in: ASSIGNABLE_ROLES } },
        "name role department"
      )
        .sort({ name: 1 })
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        maintenanceTypes: Maintenance.MAINTENANCE_TYPES,
        priorities: Maintenance.MAINTENANCE_PRIORITIES,
        statuses: Maintenance.MAINTENANCE_STATUSES,
        projects: projects.map((project) => ({
          _id: project._id,
          name: project.name,
          code: project.code,
          location: project.location,
        })),
        equipment: equipment.map((item) => ({
          _id: item._id,
          name: item.name,
          type: item.type,
          status: item.status,
        })),
        assignees: assignees.map((user) => ({
          _id: user._id,
          name: user.name,
          role: user.role,
          department: user.department || "",
        })),
      },
    });
  } catch (error) {
    console.error(
      "Get Maintenance Options Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch maintenance options",
    });
  }
};

// =====================================================
// GET /api/maintenance/summary
// Counts for the summary cards (all read from MongoDB)
// =====================================================

const getMaintenanceSummary = async (req, res) => {
  try {
    const scope = await buildScopeFilter(req.user);
    const summary = await Maintenance.getSummary(scope);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Get Maintenance Summary Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch maintenance summary",
    });
  }
};

// =====================================================
// GET /api/maintenance
// List + search + filter
// =====================================================

const getMaintenance = async (req, res) => {
  try {
    const now = new Date();

    const [scope, search] = await Promise.all([
      buildScopeFilter(req.user),
      buildSearchFilter(req.query.search),
    ]);

    const priority = cleanString(req.query.priority);
    const maintenanceType = cleanString(req.query.maintenanceType);

    const query = combineConditions([
      buildStatusFilter(req.query.status, now),
      priority ? { priority } : null,
      maintenanceType ? { maintenanceType } : null,
      buildIdFilter(req.query.project),
      buildIdFilter(req.query.assignedTo),
      buildDateFilter(req.query.from, req.query.to),
    ]);

    const combinedQuery = combineConditions([
      scope,
      search,
      query,
    ]);

    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1
    );
    const limit = parseLimit(req.query.limit);
    const sort = buildSort(req.query.sort);

    const [records, total] = await Promise.all([
      withReferences(
        Maintenance.find(combinedQuery)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
      ).lean(),
      Maintenance.countDocuments(combinedQuery),
    ]);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page,
      limit,
      pages: Math.max(Math.ceil(total / limit), 1),
      data: records.map(toApiRecord),
    });
  } catch (error) {
    console.error("Get Maintenance Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch maintenance records",
    });
  }
};

// =====================================================
// GET /api/maintenance/:id
// =====================================================

const getMaintenanceById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance id",
      });
    }

    const scope = await buildScopeFilter(req.user);

    const record = await withReferences(
      Maintenance.findOne(
        combineConditions([scope, { _id: req.params.id }])
      )
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: toApiRecord(record),
    });
  } catch (error) {
    console.error("Get Maintenance Detail Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch maintenance record",
    });
  }
};

// =====================================================
// POST /api/maintenance
// =====================================================

// Next human readable maintenance id (MNT-0001). The unique
// index is the source of truth, so a collision (two requests at
// the same time) simply retries with the next number.
const buildMaintenanceId = async () => {
  const latest = await Maintenance.findOne({}, "maintenanceId").sort({
    maintenanceId: -1,
  });

  const latestNumber = latest
    ? Number.parseInt(
        String(latest.maintenanceId).split("-").pop(),
        10
      )
    : 0;

  const next =
    Number.isFinite(latestNumber) ? latestNumber + 1 : 1;

  return `MNT-${String(next).padStart(4, "0")}`;
};

// Shared field validation for create and update
const validatePayload = async (payload) => {
  const errors = {};

  const title = cleanString(payload.title);
  if (!title) {
    errors.title = "Maintenance title is required";
  }

  const maintenanceType = cleanString(payload.maintenanceType);
  if (!maintenanceType) {
    errors.maintenanceType = "Maintenance type is required";
  } else if (
    !Maintenance.MAINTENANCE_TYPES.includes(maintenanceType)
  ) {
    errors.maintenanceType = "Select a valid maintenance type";
  }

  const projectId = cleanString(payload.project);
  if (!projectId) {
    errors.project = "Project / site is required";
  } else if (!isValidObjectId(projectId)) {
    errors.project = "Select a valid project";
  }

  const priority = cleanString(payload.priority);
  if (priority && !Maintenance.MAINTENANCE_PRIORITIES.includes(priority)) {
    errors.priority = "Select a valid priority";
  }

  const status = cleanString(payload.status);
  if (status && !Maintenance.MAINTENANCE_STATUSES.includes(status)) {
    errors.status = "Select a valid status";
  }

  const scheduledTime = cleanString(payload.scheduledTime);
  if (scheduledTime && !TIME_PATTERN.test(scheduledTime)) {
    errors.scheduledTime = "Time must be in HH:mm format";
  }

  const scheduledDate = payload.scheduledDate
    ? new Date(payload.scheduledDate)
    : null;

  if (!payload.scheduledDate || Number.isNaN(scheduledDate.getTime())) {
    errors.scheduledDate = "A valid scheduled date is required";
  }

  const equipmentId = cleanString(payload.equipment);
  if (equipmentId && !isValidObjectId(equipmentId)) {
    errors.equipment = "Select a valid equipment record";
  }

  const assignedToId = cleanString(payload.assignedTo);
  if (assignedToId && !isValidObjectId(assignedToId)) {
    errors.assignedTo = "Select a valid user";
  }

  if (Object.keys(errors).length) {
    return { errors };
  }

  // Confirm the references really exist before writing
  const [project, equipment, assignedTo] = await Promise.all([
    Project.findById(projectId, "name code location").lean(),
    equipmentId
      ? Equipment.findById(equipmentId, "name").lean()
      : null,
    assignedToId
      ? User.findById(assignedToId, "name role").lean()
      : null,
  ]);

  if (!project) errors.project = "Selected project was not found";

  if (equipmentId && !equipment) {
    errors.equipment = "Selected equipment was not found";
  }

  if (assignedToId && !assignedTo) {
    errors.assignedTo = "Selected user was not found";
  } else if (assignedTo && !ASSIGNABLE_ROLES.includes(assignedTo.role)) {
    errors.assignedTo =
      "Maintenance can only be assigned to a worker, technician or site role";
  }

  if (Object.keys(errors).length) {
    return { errors };
  }

  return {
    data: {
      title,
      description: cleanString(payload.description),
      maintenanceType,
      project: projectId,
      equipment: equipmentId || null,
      assignedTo: assignedToId || null,
      scheduledDate,
      scheduledTime,
      scheduledFor: buildScheduledFor(
        scheduledDate,
        scheduledTime
      ),
      priority: priority || "Medium",
      status: status || "Scheduled",
      notes: cleanString(payload.notes),
    },
    project,
    assignedTo,
  };
};

const createMaintenance = async (req, res) => {
  try {
    const { errors, data, project, assignedTo } =
      await validatePayload(req.body);

    if (errors) {
      return res.status(400).json({
        success: false,
        message: "Please correct the highlighted fields",
        errors,
      });
    }

    const payload = {
      ...data,
      maintenanceId: await buildMaintenanceId(),
      createdBy: req.user._id,
      completedAt:
        data.status === "Completed" ? new Date() : null,
    };

    // Concurrent inserts can pick the same number; the unique
    // index rejects the loser and it is retried with the next.
    let record = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        record = await Maintenance.create(payload);
        break;
      } catch (error) {
        const isIdCollision =
          error?.code === 11000 && error?.keyPattern?.maintenanceId;

        if (!isIdCollision) throw error;

        payload.maintenanceId = await buildMaintenanceId();
      }
    }

    if (!record) {
      return res.status(409).json({
        success: false,
        message:
          "Could not allocate a maintenance id, please try again",
      });
    }

    await pushNotification({
      title: "Maintenance Scheduled",
      message: `${record.maintenanceId} - ${record.title} is scheduled for ${project.name}.`,
      role: assignedTo ? assignedTo.role : "all",
      type: data.priority === "Critical" ? "warning" : "info",
    });

    const created = await withReferences(
      Maintenance.findById(record._id)
    );

    res.status(201).json({
      success: true,
      message: "Maintenance scheduled successfully",
      data: toApiRecord(created),
    });
  } catch (error) {
    console.error("Create Maintenance Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to schedule maintenance",
    });
  }
};

// =====================================================
// PUT /api/maintenance/:id
// =====================================================

const updateMaintenance = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance id",
      });
    }

    const existing = await Maintenance.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    const isManager = MANAGE_ROLES.includes(req.user.role);
    const isAssignee =
      existing.assignedTo &&
      String(existing.assignedTo) === String(req.user._id);

    // Workers / contractors may only progress their own job
    if (!isManager && !isAssignee) {
      return res.status(403).json({
        success: false,
        message:
          "You can only update maintenance assigned to you",
      });
    }

    // A manager may edit the whole schedule. Anyone else is
    // limited to the workflow fields of their own job.
    const changes = isManager
      ? { ...req.body }
      : Object.keys(req.body).reduce((allowed, key) => {
          if (["status", "notes"].includes(key)) {
            allowed[key] = req.body[key];
          }
          return allowed;
        }, {});

    const attempted = Object.keys(req.body).filter(
      (key) =>
        !(key in changes)
    );

    if (attempted.length) {
      return res.status(403).json({
        success: false,
        message:
          "Only the status and notes can be updated on an assigned job",
      });
    }

    // The merged record is always revalidated, so a partial
    // update can never leave a record in an invalid state.
    const { errors, data, project, assignedTo } =
      await validatePayload({
        ...existing.toObject(),
        ...changes,
      });

    if (errors) {
      return res.status(400).json({
        success: false,
        message: "Please correct the highlighted fields",
        errors,
      });
    }

    const nextStatus = cleanString(data.status) || existing.status;

    if (nextStatus !== existing.status) {
      const allowed =
        STATUS_TRANSITIONS[existing.status] || [];

      if (!allowed.includes(nextStatus)) {
        return res.status(400).json({
          success: false,
          message: `A ${existing.status.toLowerCase()} maintenance task cannot be moved to ${nextStatus.toLowerCase()}`,
        });
      }
    }

    const completedAt =
      nextStatus === "Completed"
        ? existing.completedAt || new Date()
        : null;

    const update = isManager
      ? { ...data, completedAt }
      : {
          status: nextStatus,
          notes: data.notes,
          completedAt,
        };

    const updated = await withReferences(
      Maintenance.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true, runValidators: true }
      )
    );

    if (nextStatus === "Completed" && existing.status !== "Completed") {
      await pushNotification({
        title: "Maintenance Completed",
        message: `${updated.maintenanceId} - ${updated.title} was completed on ${project.name}.`,
        role: assignedTo ? assignedTo.role : "all",
        type: "success",
      });
    }

    res.status(200).json({
      success: true,
      message: "Maintenance updated successfully",
      data: toApiRecord(updated),
    });
  } catch (error) {
    console.error("Update Maintenance Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to update maintenance",
    });
  }
};

// =====================================================
// DELETE /api/maintenance/:id
// =====================================================

const deleteMaintenance = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance id",
      });
    }

    const record = await Maintenance.findByIdAndDelete(
      req.params.id
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Maintenance record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Maintenance Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete maintenance record",
    });
  }
};

module.exports = {
  VIEW_ROLES,
  MANAGE_ROLES,
  getMaintenance,
  getMaintenanceById,
  getMaintenanceOptions,
  getMaintenanceSummary,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
};
