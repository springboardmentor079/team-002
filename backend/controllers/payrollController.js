const mongoose = require("mongoose");

const Payroll = require("../models/Payroll");
const Project = require("../models/Project");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Notification = require("../models/Notification");

// =====================================================
// PAYROLL MONITORING CONTROLLER
// Every rupee, day and hour on this screen is read from or
// written to MongoDB. There is no fallback list, no demo
// dataset and no rate table - the User collection carries no
// salary information, so a figure that is not stored here does
// not exist and is reported as "Not available" instead.
//
// Worker and project references are stored as ObjectIds and
// resolved on read, so a record created today still shows the
// current name after a rename.
// =====================================================

// Roles allowed to open the payroll module. The client role is
// deliberately absent: a client is never shown private worker
// salary information.
const VIEW_ROLES = [
  "admin",
  "project_manager",
  "worker",
];

// Roles allowed to create and edit payroll runs.
const MANAGE_ROLES = [
  "admin",
  "project_manager",
];

// Cancellation is not deletion: the audit trail is kept, so
// only an admin can remove a run outright.
const DELETE_ROLES = ["admin"];

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

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) &&
  String(new mongoose.Types.ObjectId(value)) === String(value);

// Numbers arrive from a form as strings and an omitted field
// arrives as "" - both mean "not captured", which is null and
// not 0.
const toNullableNumber = (value, label) => {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return { error: `${label} must be a number` };
  }

  if (parsed < 0) {
    return { error: `${label} cannot be negative` };
  }

  return { value: Math.round(parsed * 100) / 100 };
};

const toDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

// Resolves worker / project references for the client. Email is
// never returned - it is only used server side to match
// attendance rows.
const withReferences = (query) =>
  query
    .populate("employee", "name role department")
    .populate("project", "name code location")
    .populate("createdBy", "name role");

const referenceShape = (ref, fields) => {
  if (!ref || !ref._id) return null;

  return fields.reduce(
    (shape, field) => ({ ...shape, [field]: ref[field] }),
    { _id: ref._id }
  );
};

// =====================================================
// ATTENDANCE ROLLUP
// The existing Attendance collection stores its date as free
// text ("Today", "18 Sept 2026", ISO) and its clock times as
// locale strings, so a pay period cannot be matched against
// the stored "date" field without guessing. createdAt is a real
// Date on every row, and userEmail / user / userId are real
// references, so the rollup uses those two and nothing else.
//
// Anything that cannot be answered from a real row comes back
// as available: false with a reason - never as an estimate.
// =====================================================

const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const endOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const UNAVAILABLE = (message) => ({
  available: false,
  reason: message,
  present: 0,
  late: 0,
  halfDay: 0,
  absent: 0,
  totalRecords: 0,
});

const buildAttendanceSummary = async (record) => {
  const employee = record.employee;

  if (!employee || !employee._id) {
    return UNAVAILABLE("No worker reference on this payroll record");
  }

  if (!record.periodStart || !record.periodEnd) {
    return UNAVAILABLE(
      "Set a pay period start and end date to read attendance for this run"
    );
  }

  // Match the worker by the identity the Attendance collection
  // actually stores. Its schema has no user / userId field - the
  // references are userName and userEmail - so those are the only
  // keys that can match a row. Email is preferred because it is
  // unique per person; userName is the fallback for a worker whose
  // email is not on file.
  const identity = [
    ...(employee.email
      ? [{ userEmail: employee.email }]
      : [{ userName: employee.name }]),
  ];

  const rows = await Attendance.find({
    $and: [
      { $or: identity },
      {
        createdAt: {
          $gte: startOfDay(record.periodStart),
          $lte: endOfDay(record.periodEnd),
        },
      },
    ],
  })
    .select("status date checkIn checkOut site")
    .lean();

  if (!rows.length) {
    return UNAVAILABLE(
      "No attendance records found for this worker in this pay period"
    );
  }

  const tally = rows.reduce(
    (counts, row) => {
      counts.totalRecords += 1;

      if (row.status === "Present") counts.present += 1;
      else if (row.status === "Late") counts.late += 1;
      else if (row.status === "Half Day") counts.halfDay += 1;
      else if (row.status === "Absent") counts.absent += 1;

      return counts;
    },
    { present: 0, late: 0, halfDay: 0, absent: 0, totalRecords: 0 }
  );

  return {
    available: true,
    reason: "",
    ...tally,
    window: {
      from: record.periodStart,
      to: endOfDay(record.periodEnd),
    },
  };
};

// Single response shape for the list, the details page and the
// create / update responses so the frontend never has to guess.
// Attendance is only resolved for a single record, so it is
// opt-in and the list stays at one query.
const toApiRecord = (document, { attendance = null } = {}) => {
  const record =
    document && typeof document.toObject === "function"
      ? document.toObject()
      : document;

  if (!record) return null;

  return {
    _id: record._id,
    payrollId: record.payrollId,

    employee: referenceShape(record.employee, [
      "name",
      "role",
      "department",
    ]),
    project: referenceShape(record.project, [
      "name",
      "code",
      "location",
    ]),
    createdBy: referenceShape(record.createdBy, ["name", "role"]),

    payPeriod: record.payPeriod,
    periodStart: record.periodStart || null,
    periodEnd: record.periodEnd || null,

    basicSalary: record.basicSalary,
    // null is preserved so the UI can say "Not available"
    workingDays: record.workingDays ?? null,
    overtimeHours: record.overtimeHours ?? null,
    overtimeAmount: record.overtimeAmount ?? null,
    allowances: record.allowances ?? 0,
    deductions: record.deductions ?? 0,

    grossSalary: Payroll.toGross(record),
    netSalary: record.netSalary,

    paymentStatus: record.paymentStatus,
    paymentDate: record.paymentDate || null,
    paymentMethod: record.paymentMethod || "",
    paymentReference: record.paymentReference || "",
    isOutstanding: Payroll.isOutstanding(record),

    notes: record.notes || "",
    attendance,

    createdAt: record.createdAt || null,
    updatedAt: record.updatedAt || null,
  };
};

// =====================================================
// ROLE SCOPING
// Enforced here rather than in the route so a worker who
// swaps an id in the URL still cannot read someone else's
// salary: their scope is their own employee id and nothing
// else can widen it.
// =====================================================

const buildScopeFilter = async (user) => {
  if (!user) return { _id: null };

  switch (user.role) {
    case "admin":
      return {};

    case "project_manager": {
      // A manager sees payroll for the projects they manage,
      // plus anything they raised themselves. Unlike the project
      // dashboard this does NOT fall back to "everything" -
      // salary figures for other people's crews are not
      // something a fresh account should inherit by default.
      const projectIds = await Project.find({
        manager: user.name,
      }).distinct("_id");

      return {
        $or: [
          ...(projectIds.length
            ? [{ project: { $in: projectIds } }]
            : []),
          { createdBy: user._id },
        ],
      };
    }

    case "worker":
      return { employee: user._id };

    default:
      // Unreachable while the router guards VIEW_ROLES, but a
      // payroll list must never default to "all" on a new role.
      return { _id: null };
  }
};

// Search runs against the real collections: a match on the
// payroll row itself, plus the resolved names of the linked
// worker and project.
const buildSearchFilter = async (search) => {
  const term = cleanString(search);
  if (!term) return null;

  const pattern = new RegExp(escapeRegExp(term), "i");

  const [employees, projects] = await Promise.all([
    User.find({
      $or: [
        { name: pattern },
        { email: pattern },
        { department: pattern },
      ],
    }).distinct("_id"),
    Project.find({
      $or: [{ name: pattern }, { code: pattern }, { location: pattern }],
    }).distinct("_id"),
  ]);

  return {
    $or: [
      { payrollId: pattern },
      { payPeriod: pattern },
      { notes: pattern },
      { paymentReference: pattern },
      { paymentMethod: pattern },
      ...(employees.length ? [{ employee: { $in: employees } }] : []),
      ...(projects.length ? [{ project: { $in: projects } }] : []),
    ],
  };
};

const buildStatusFilter = (status) => {
  const requested = cleanString(status);
  if (!requested) return null;

  return { paymentStatus: requested };
};

const buildPeriodFilter = (payPeriod) => {
  const requested = cleanString(payPeriod);
  if (!requested) return null;

  return { payPeriod: requested };
};

const buildIdFilter = (value) => {
  const id = cleanString(value);
  if (!id || !isValidObjectId(id)) return null;

  return { _id: id };
};

// Date range compares the pay period, not createdAt, so
// "September" selects the September run however late it was
// entered. A run matches when its period overlaps the range.
const buildDateFilter = (from, to) => {
  const start = toDate(cleanString(from));
  const end = toDate(cleanString(to));

  if (!start && !end) return null;

  const conditions = [];

  if (start) {
    conditions.push({ periodEnd: { $gte: startOfDay(start) } });
  }

  if (end) {
    conditions.push({ periodStart: { $lte: endOfDay(end) } });
  }

  if (!conditions.length) return null;

  return { $and: conditions };
};

const parseLimit = (value, fallback = 10) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;

  return Math.min(parsed, 100);
};

const SORT_OPTIONS = {
  createdAt: { createdAt: -1 },
  "-createdAt": { createdAt: 1 },
  payPeriod: { payPeriod: 1 },
  "-payPeriod": { payPeriod: -1 },
  paymentDate: { paymentDate: 1 },
  "-paymentDate": { paymentDate: -1 },
  netSalary: { netSalary: -1 },
  "-netSalary": { netSalary: 1 },
  employee: { employee: 1 },
  "-employee": { employee: -1 },
};

const buildSort = (value) => {
  const key = cleanString(value);
  if (!key) return { payPeriod: -1, createdAt: -1 };

  return SORT_OPTIONS[key] || { payPeriod: -1, createdAt: -1 };
};

// =====================================================
// NOTIFICATIONS (existing notification feed)
// =====================================================

const pushNotification = async (payload) => {
  try {
    await Notification.create(payload);
  } catch (error) {
    console.error(
      "Failed to create payroll notification:",
      error.message
    );
  }
};

// =====================================================
// GET /api/payroll/options
// Reference data for the create / edit form and the filters.
// Workers, projects and pay periods all come from MongoDB -
// no hardcoded names.
// =====================================================

const getPayrollOptions = async (req, res) => {
  try {
    const scope = await buildScopeFilter(req.user);

    // A worker only ever sees their own name in the dropdown,
    // and the form is hidden for them anyway.
    const workerFilter =
      req.user.role === "worker"
        ? { _id: req.user._id }
        : { role: { $in: Payroll.PAYABLE_ROLES } };

    const [employees, projects, payPeriods] = await Promise.all([
      User.find(workerFilter, "name role department")
        .sort({ name: 1 })
        .lean(),
      Project.find({}, "name code location")
        .sort({ name: 1 })
        .lean(),
      Payroll.distinct("payPeriod", scope),
    ]);

    res.status(200).json({
      success: true,
      data: {
        paymentStatuses: Payroll.PAYMENT_STATUSES,
        paymentMethods: Payroll.PAYMENT_METHODS,
        // The distinct list is raw strings from MongoDB, so it
        // is only cosmetic to order it for the dropdown.
        payPeriods: payPeriods
          .filter(Boolean)
          .sort((a, b) => String(a).localeCompare(String(b))),
        employees: employees.map((user) => ({
          _id: user._id,
          name: user.name,
          role: user.role,
          department: user.department || "",
        })),
        projects: projects.map((project) => ({
          _id: project._id,
          name: project.name,
          code: project.code,
          location: project.location,
        })),
      },
    });
  } catch (error) {
    console.error("Get Payroll Options Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch payroll options",
    });
  }
};

// =====================================================
// GET /api/payroll/summary
// Counts for the summary cards. Every figure is an aggregation
// over MongoDB.
// =====================================================

const getPayrollSummary = async (req, res) => {
  try {
    const scope = await buildScopeFilter(req.user);
    const summary = await Payroll.getSummary(scope);

    // The headline worker count is the real number of payroll
    // eligible accounts, straight from the users collection -
    // not an estimate of how many are on this register.
    const totalWorkers = await User.countDocuments({
      role: { $in: Payroll.PAYABLE_ROLES },
    });

    res.status(200).json({
      success: true,
      data: {
        ...summary,
        // Scoped for managers, global for the register they own.
        totalWorkers,
        // How many of those accounts appear on this register.
        onRegister: summary.employees,
      },
    });
  } catch (error) {
    console.error("Get Payroll Summary Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch payroll summary",
    });
  }
};

// =====================================================
// GET /api/payroll
// List + search + filter
// =====================================================

const getPayroll = async (req, res) => {
  try {
    const [scope, search] = await Promise.all([
      buildScopeFilter(req.user),
      buildSearchFilter(req.query.search),
    ]);

    const query = combineConditions([
      buildStatusFilter(req.query.status),
      buildPeriodFilter(req.query.payPeriod),
      buildIdFilter(req.query.employee),
      buildIdFilter(req.query.project),
      buildDateFilter(req.query.from, req.query.to),
    ]);

    const combinedQuery = combineConditions([scope, search, query]);

    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1
    );
    const limit = parseLimit(req.query.limit);
    const sort = buildSort(req.query.sort);

    const [records, total] = await Promise.all([
      withReferences(
        Payroll.find(combinedQuery)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
      ).lean(),
      Payroll.countDocuments(combinedQuery),
    ]);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page,
      limit,
      pages: Math.max(Math.ceil(total / limit), 1),
      data: records.map((record) => toApiRecord(record)),
    });
  } catch (error) {
    console.error("Get Payroll Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch payroll records",
    });
  }
};

// =====================================================
// GET /api/payroll/:id
// =====================================================

const getPayrollById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payroll id",
      });
    }

    const scope = await buildScopeFilter(req.user);

    // The scope is part of the lookup, so a worker asking for
    // someone else's id gets the same 404 as a missing record -
    // the endpoint never confirms that the id exists.
    const record = await withReferences(
      Payroll.findOne(combineConditions([scope, { _id: req.params.id }]))
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    // The attendance rollup needs the worker's email and name,
    // which are deliberately absent from the API shape.
    const employee = await User.findById(record.employee, "name email").lean();
    const attendance = await buildAttendanceSummary({
      ...record.toObject(),
      employee: {
        _id: record.employee._id,
        name: employee?.name || "",
        email: employee?.email || "",
      },
    });

    res.status(200).json({
      success: true,
      data: toApiRecord(record, { attendance }),
    });
  } catch (error) {
    console.error("Get Payroll Detail Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch payroll record",
    });
  }
};

// =====================================================
// POST /api/payroll
// =====================================================

// Next human readable payroll id (PAY-0001). The unique index
// is the source of truth, so a collision (two requests at the
// same time) simply retries with the next number.
const buildPayrollId = async () => {
  const latest = await Payroll.findOne({}, "payrollId").sort({
    payrollId: -1,
  });

  const latestNumber = latest
    ? Number.parseInt(
        String(latest.payrollId).split("-").pop(),
        10
      )
    : 0;

  const next = Number.isFinite(latestNumber) ? latestNumber + 1 : 1;

  return `PAY-${String(next).padStart(4, "0")}`;
};

// Shared field validation for create and update. The return
// value is `{ errors }` on failure and `{ data }` on success,
// which is what lets an update re-validate the merged record.
const validatePayload = async (payload) => {
  const errors = {};
  const employeeId = cleanString(payload.employee);
  const projectId = cleanString(payload.project);

  if (!employeeId) {
    errors.employee = "Worker / employee is required";
  } else if (!isValidObjectId(employeeId)) {
    errors.employee = "Select a valid worker";
  }

  const payPeriod = cleanString(payload.payPeriod);
  if (!payPeriod) {
    errors.payPeriod = "Pay period is required";
  }

  if (projectId && !isValidObjectId(projectId)) {
    errors.project = "Select a valid project";
  }

  const periodStart = toDate(payload.periodStart);
  const periodEnd = toDate(payload.periodEnd);

  if (payload.periodStart && !periodStart) {
    errors.periodStart = "Enter a valid period start date";
  }

  if (payload.periodEnd && !periodEnd) {
    errors.periodEnd = "Enter a valid period end date";
  }

  if (periodStart && periodEnd && periodStart > periodEnd) {
    errors.periodEnd = "The period end date must not precede the start date";
  }

  // ---- Money ----

  const basicSalary = toNullableNumber(payload.basicSalary, "Basic salary");

  if (basicSalary?.error) {
    errors.basicSalary = basicSalary.error;
  } else if (basicSalary?.value === null) {
    errors.basicSalary = "Basic salary is required";
  }

  const numeric = {};

  [
    ["workingDays", "Working days"],
    ["overtimeHours", "Overtime hours"],
    ["overtimeAmount", "Overtime amount"],
    ["allowances", "Allowances"],
    ["deductions", "Deductions"],
  ].forEach(([field, label]) => {
    const result = toNullableNumber(payload[field], label);

    if (result?.error) {
      errors[field] = result.error;
      return;
    }

    numeric[field] = result?.value ?? null;
  });

  const allowances = numeric.allowances ?? 0;
  const deductions = numeric.deductions ?? 0;

  const gross =
    (basicSalary?.value ?? 0) +
    (numeric.overtimeAmount ?? 0) +
    allowances;

  if (!errors.deductions && deductions > gross) {
    errors.deductions =
      "Deductions cannot be more than the gross pay (basic + overtime + allowances)";
  }

  // ---- Payment ----

  const paymentStatus = cleanString(payload.paymentStatus);

  if (paymentStatus && !Payroll.PAYMENT_STATUSES.includes(paymentStatus)) {
    errors.paymentStatus = "Select a valid payment status";
  }

  const paymentDate = toDate(payload.paymentDate);

  if (payload.paymentDate && !paymentDate) {
    errors.paymentDate = "Enter a valid payment date";
  }

  if (Object.keys(errors).length) {
    return { errors };
  }

  // ---- Confirm the references really exist ----

  const [employee, project] = await Promise.all([
    User.findById(employeeId, "name role").lean(),
    projectId
      ? Project.findById(projectId, "name code").lean()
      : null,
  ]);

  if (!employee) {
    errors.employee = "Selected worker was not found";
  } else if (!Payroll.PAYABLE_ROLES.includes(employee.role)) {
    errors.employee =
      "Payroll can only be raised for a worker, contractor or site engineer";
  }

  if (projectId && !project) {
    errors.project = "Selected project was not found";
  }

  if (Object.keys(errors).length) {
    return { errors };
  }

  return {
    data: {
      employee: employeeId,
      project: projectId || null,
      payPeriod,
      periodStart,
      periodEnd,
      basicSalary: basicSalary.value,
      workingDays: numeric.workingDays,
      overtimeHours: numeric.overtimeHours,
      overtimeAmount: numeric.overtimeAmount,
      allowances,
      deductions,
      netSalary: Payroll.toNet({
        basicSalary: basicSalary.value,
        overtimeAmount: numeric.overtimeAmount,
        allowances,
        deductions,
      }),
      paymentStatus: paymentStatus || "Pending",
      paymentDate,
      paymentMethod: cleanString(payload.paymentMethod),
      paymentReference: cleanString(payload.paymentReference),
      notes: cleanString(payload.notes),
    },
    employee,
    project,
  };
};

const createPayroll = async (req, res) => {
  try {
    const { errors, data, employee, project } = await validatePayload(
      req.body
    );

    if (errors) {
      return res.status(400).json({
        success: false,
        message: "Please correct the highlighted fields",
        errors,
      });
    }

    // A run marked Paid without a date is dated now, so the
    // register never shows a disbursement with no date.
    const paymentDate =
      data.paymentStatus === "Paid"
        ? data.paymentDate || new Date()
        : data.paymentDate;

    const payload = {
      ...data,
      paymentDate,
      payrollId: await buildPayrollId(),
      createdBy: req.user._id,
    };

    // Concurrent inserts can pick the same number; the unique
    // index rejects the loser and it is retried with the next.
    let record = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        record = await Payroll.create(payload);
        break;
      } catch (error) {
        const isIdCollision =
          error?.code === 11000 && error?.keyPattern?.payrollId;

        if (!isIdCollision) throw error;

        payload.payrollId = await buildPayrollId();
      }
    }

    if (!record) {
      return res.status(409).json({
        success: false,
        message: "Could not allocate a payroll id, please try again",
      });
    }

    await pushNotification({
      title: "Payroll Raised",
      message: `${record.payrollId} for ${employee.name} (${data.payPeriod}) is ${data.paymentStatus.toLowerCase()}.`,
      role: employee.role,
      type: "info",
    });

    const created = await withReferences(
      Payroll.findById(record._id)
    );

    res.status(201).json({
      success: true,
      message: "Payroll record created successfully",
      data: toApiRecord(created),
    });
  } catch (error) {
    console.error("Create Payroll Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payroll record",
    });
  }
};

// =====================================================
// PUT /api/payroll/:id
// =====================================================

const updatePayroll = async (req, res) => {
  try {
    // The router lets a worker through on the read routes, so
    // the write permission is re-checked here.
    if (!MANAGE_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to edit payroll records",
      });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payroll id",
      });
    }

    const scope = await buildScopeFilter(req.user);

    const existing = await Payroll.findOne(
      combineConditions([scope, { _id: req.params.id }])
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    // The merged record is always revalidated, so a partial
    // update can never leave a record in an invalid state.
    const { errors, data, employee, project } = await validatePayload({
      ...existing.toObject(),
      ...req.body,
    });

    if (errors) {
      return res.status(400).json({
        success: false,
        message: "Please correct the highlighted fields",
        errors,
      });
    }

    const movingToPaid =
      data.paymentStatus === "Paid" &&
      existing.paymentStatus !== "Paid";

    const update = {
      ...data,
      // Stamp the date on the transition into Paid. A record
      // moving back out of Paid keeps whatever date it already
      // has - a recorded fact is never silently deleted.
      paymentDate:
        movingToPaid && !data.paymentDate
          ? existing.paymentDate || new Date()
          : data.paymentDate,
    };

    const updated = await withReferences(
      Payroll.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true,
      })
    );

    if (movingToPaid) {
      await pushNotification({
        title: "Salary Paid",
        message: `${updated.payrollId} for ${employee.name} (${data.payPeriod}) has been marked paid.`,
        role: employee.role,
        type: "success",
      });
    } else if (data.paymentStatus !== existing.paymentStatus) {
      await pushNotification({
        title: "Payroll Status Updated",
        message: `${updated.payrollId} for ${employee.name} is now ${data.paymentStatus.toLowerCase()}.`,
        role: employee.role,
        type: "info",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payroll record updated successfully",
      data: toApiRecord(updated),
    });
  } catch (error) {
    console.error("Update Payroll Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update payroll record",
    });
  }
};

// =====================================================
// PUT /api/payroll/:id/status
// The quick "mark as paid / processing" action. Status is
// written to MongoDB like any other field; it is never a
// frontend-only toggle.
// =====================================================

const updatePayrollStatus = async (req, res) => {
  try {
    if (!MANAGE_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update payment status",
      });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payroll id",
      });
    }

    const status = cleanString(req.body.paymentStatus);

    if (!Payroll.PAYMENT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid payment status",
        errors: {
          paymentStatus: "Select a valid payment status",
        },
      });
    }

    const scope = await buildScopeFilter(req.user);

    const existing = await Payroll.findOne(
      combineConditions([scope, { _id: req.params.id }])
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    const movingToPaid =
      status === "Paid" && existing.paymentStatus !== "Paid";

    const update = {
      paymentStatus: status,
      // Only stamp a date if one is supplied or if the run is
      // entering Paid. An existing date is left alone otherwise.
      paymentDate:
        req.body.paymentDate !== undefined
          ? toDate(req.body.paymentDate)
          : movingToPaid
            ? existing.paymentDate || new Date()
            : existing.paymentDate,
    };

    if (req.body.paymentMethod !== undefined) {
      update.paymentMethod = cleanString(req.body.paymentMethod);
    }

    if (req.body.paymentReference !== undefined) {
      update.paymentReference = cleanString(req.body.paymentReference);
    }

    const updated = await withReferences(
      Payroll.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true,
      })
    );

    if (movingToPaid) {
      await pushNotification({
        title: "Salary Paid",
        message: `${updated.payrollId} for ${updated.employee.name} (${updated.payPeriod}) has been marked paid.`,
        role: updated.employee.role,
        type: "success",
      });
    } else if (status !== existing.paymentStatus) {
      await pushNotification({
        title: "Payroll Status Updated",
        message: `${updated.payrollId} for ${updated.employee.name} is now ${status.toLowerCase()}.`,
        role: updated.employee.role,
        type: "info",
      });
    }

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${status}`,
      data: toApiRecord(updated),
    });
  } catch (error) {
    console.error("Update Payroll Status Error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to update payment status",
    });
  }
};

// =====================================================
// DELETE /api/payroll/:id
// =====================================================

const deletePayroll = async (req, res) => {
  try {
    if (!DELETE_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only an admin can delete a payroll record",
      });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payroll id",
      });
    }

    const record = await Payroll.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payroll record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Payroll Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete payroll record",
    });
  }
};

module.exports = {
  VIEW_ROLES,
  MANAGE_ROLES,
  DELETE_ROLES,
  getPayroll,
  getPayrollById,
  getPayrollOptions,
  getPayrollSummary,
  createPayroll,
  updatePayroll,
  updatePayrollStatus,
  deletePayroll,
};
