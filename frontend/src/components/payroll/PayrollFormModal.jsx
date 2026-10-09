import { useEffect, useMemo, useState } from "react";
import { Loader2, Wallet, X } from "lucide-react";

import API from "../../services/api";

import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  canCreatePayroll,
  formatMoney,
  isCaptured,
  roleLabel,
  toDateInputValue,
} from "../../utils/payroll";

const EMPTY_FORM = {
  employee: "",
  project: "",
  payPeriod: "",
  periodStart: "",
  periodEnd: "",
  basicSalary: "",
  workingDays: "",
  overtimeHours: "",
  overtimeAmount: "",
  allowances: "",
  deductions: "",
  paymentStatus: "Pending",
  paymentDate: "",
  paymentMethod: "",
  paymentReference: "",
  notes: "",
};

// The three fields the API insists on before it will store a run.
const REQUIRED_FIELDS = [
  ["employee", "Worker / employee is required"],
  ["payPeriod", "Pay period is required"],
  ["basicSalary", "Basic salary is required"],
];

const MONEY_FIELDS = [
  "basicSalary",
  "overtimeAmount",
  "allowances",
  "deductions",
];

const COUNT_FIELDS = ["workingDays", "overtimeHours"];

// Human labels for the numeric fields, used by the shared number
// validation below.
const LABELS = {
  basicSalary: "Basic salary",
  overtimeAmount: "Overtime amount",
  allowances: "Allowances",
  deductions: "Deductions",
  workingDays: "Working days",
  overtimeHours: "Overtime hours",
};

// An empty field is sent as "" on purpose. The API reads "" as
// "never captured" and stores null, which is what keeps
// "Not available" distinguishable from a real zero. Sending 0
// instead would invent a figure nobody typed in.
const toApiValue = (value) => {
  const trimmed = String(value ?? "").trim();
  return trimmed;
};

// Same formula the server applies, so the preview can never
// disagree with what gets stored:
//   net = basic + overtime + allowances - deductions
const computeGross = (formData) =>
  Number(formData.basicSalary || 0) +
  Number(formData.overtimeAmount || 0) +
  Number(formData.allowances || 0);

const computeNet = (formData) =>
  Math.max(computeGross(formData) - Number(formData.deductions || 0), 0);

const describe = (value, label) => {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) return `${label} is required`;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return `${label} must be a number`;
  if (parsed < 0) return `${label} cannot be negative`;

  return "";
};

// Create / edit form. Only a manager ever sees it - the API
// rejects a write from a worker, so the form is hidden for them
// rather than shown and then refused.
function PayrollFormModal({
  open = false,
  record = null,
  options = {},
  notify = () => {},
  onClose = () => {},
  onSaved = () => {},
}) {
  const isManager = canCreatePayroll();
  const isEditing = Boolean(record);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const employees = options.employees || [];
  const projects = options.projects || [];
  const payPeriods = options.payPeriods || [];

  const statuses = options.paymentStatuses?.length
    ? options.paymentStatuses
    : PAYMENT_STATUSES;

  const methods = options.paymentMethods?.length
    ? options.paymentMethods
    : PAYMENT_METHODS;

  // Prefill from the record that is being edited
  useEffect(() => {
    if (!open) return;

    if (!record) {
      setFormData(EMPTY_FORM);
    } else {
      setFormData({
        employee: record.employee?._id || "",
        project: record.project?._id || "",
        payPeriod: record.payPeriod || "",
        periodStart: toDateInputValue(record.periodStart),
        periodEnd: toDateInputValue(record.periodEnd),
        basicSalary: isCaptured(record.basicSalary)
          ? String(record.basicSalary)
          : "",
        workingDays: isCaptured(record.workingDays)
          ? String(record.workingDays)
          : "",
        overtimeHours: isCaptured(record.overtimeHours)
          ? String(record.overtimeHours)
          : "",
        overtimeAmount: isCaptured(record.overtimeAmount)
          ? String(record.overtimeAmount)
          : "",
        allowances: isCaptured(record.allowances)
          ? String(record.allowances)
          : "",
        deductions: isCaptured(record.deductions)
          ? String(record.deductions)
          : "",
        paymentStatus: record.paymentStatus || "Pending",
        paymentDate: toDateInputValue(record.paymentDate),
        paymentMethod: record.paymentMethod || "",
        paymentReference: record.paymentReference || "",
        notes: record.notes || "",
      });
    }

    setFieldErrors({});
    setFormError("");
  }, [open, record]);

  // Stop the page behind the modal from scrolling
  useEffect(() => {
    if (!open) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape closes the modal
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () =>
      document.removeEventListener("keydown", handleKeyDown);
  }, [open, submitting, onClose]);

  const title = isEditing ? "Edit Payroll Run" : "Raise Payroll";

  const gross = computeGross(formData);
  const net = computeNet(formData);

  const previewRows = useMemo(
    () => [
      {
        label: "Basic salary",
        value: formData.basicSalary,
        required: true,
      },
      {
        label: "Overtime amount",
        value: formData.overtimeAmount,
      },
      { label: "Allowances", value: formData.allowances },
      { label: "Deductions", value: formData.deductions, debit: true },
    ],
    [formData]
  );

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const errors = {};

    REQUIRED_FIELDS.forEach(([field, message]) => {
      if (!String(formData[field] || "").trim()) {
        errors[field] = message;
      }
    });

    MONEY_FIELDS.forEach((field) => {
      const message = describe(formData[field], LABELS[field]);
      if (message) errors[field] = message;
    });

    COUNT_FIELDS.forEach((field) => {
      const message = describe(formData[field], LABELS[field]);
      if (message) errors[field] = message;
    });

    if (
      formData.periodStart &&
      Number.isNaN(new Date(formData.periodStart).getTime())
    ) {
      errors.periodStart = "Enter a valid period start date";
    }

    if (
      formData.periodEnd &&
      Number.isNaN(new Date(formData.periodEnd).getTime())
    ) {
      errors.periodEnd = "Enter a valid period end date";
    }

    if (
      formData.periodStart &&
      formData.periodEnd &&
      new Date(formData.periodStart) > new Date(formData.periodEnd)
    ) {
      errors.periodEnd = "The period end date must not precede the start date";
    }

    // Mirrors the API rule so the form explains the problem before
    // the round trip rather than after it.
    if (
      !errors.deductions &&
      String(formData.deductions || "").trim() &&
      Number(formData.deductions) > gross
    ) {
      errors.deductions =
        "Deductions cannot be more than the gross pay (basic + overtime + allowances)";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Guards against a double click creating two records
    if (submitting) return;

    setFormError("");

    if (!validate()) return;

    const payload = {
      employee: formData.employee,
      project: formData.project || null,
      payPeriod: formData.payPeriod.trim(),
      periodStart: formData.periodStart || null,
      periodEnd: formData.periodEnd || null,
      basicSalary: toApiValue(formData.basicSalary),
      workingDays: toApiValue(formData.workingDays),
      overtimeHours: toApiValue(formData.overtimeHours),
      overtimeAmount: toApiValue(formData.overtimeAmount),
      allowances: toApiValue(formData.allowances),
      deductions: toApiValue(formData.deductions),
      paymentStatus: formData.paymentStatus,
      paymentDate: formData.paymentDate || null,
      paymentMethod: formData.paymentMethod,
      paymentReference: formData.paymentReference.trim(),
      notes: formData.notes.trim(),
    };

    try {
      setSubmitting(true);

      const response = isEditing
        ? await API.put(`/payroll/${record._id}`, payload)
        : await API.post("/payroll", payload);

      notify(
        response.data?.message ||
          (isEditing
            ? "Payroll run updated"
            : "Payroll run raised"),
        "success"
      );

      onSaved(response.data?.data || null);
      onClose();
    } catch (error) {
      const errors = error.response?.data?.errors;

      if (errors) setFieldErrors(errors);

      const message =
        error.response?.data?.message ||
        "Failed to save payroll";

      setFormError(message);
      notify(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !isManager) return null;

  return (
    <div
      className="pay-modal-backdrop"
      role="presentation"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="pay-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pay-modal-header">
          <div>
            <h3>{title}</h3>
            <p>
              {isEditing && record?.payrollId
                ? `${record.payrollId} · ${
                    record.employee?.name || "Worker"
                  }`
                : "Record a pay run against a real worker and project."}
            </p>
          </div>

          <button
            type="button"
            className="pay-icon-btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close payroll form"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="pay-modal-body">
            {formError ? (
              <div className="pay-alert pay-alert-error">
                {formError}
              </div>
            ) : null}

            <div className="pay-field">
              <label htmlFor="pay-employee">
                Worker / employee <span>*</span>
              </label>
              <select
                id="pay-employee"
                value={formData.employee}
                onChange={(event) =>
                  updateField("employee", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.employee)}
              >
                <option value="">Select a worker</option>
                {employees.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} — {roleLabel(user.role)}
                    {user.department ? ` (${user.department})` : ""}
                  </option>
                ))}
              </select>
              {fieldErrors.employee ? (
                <small className="pay-field-error">
                  {fieldErrors.employee}
                </small>
              ) : (
                <small className="pay-field-hint">
                  Loaded from the users collection. Payroll can only be
                  raised for a worker, contractor or site engineer.
                </small>
              )}
            </div>

            <div className="pay-field">
              <label htmlFor="pay-project">Project / site</label>
              <select
                id="pay-project"
                value={formData.project}
                onChange={(event) =>
                  updateField("project", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.project)}
              >
                <option value="">No project linked</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                    {project.location
                      ? ` — ${project.location}`
                      : ""}
                  </option>
                ))}
              </select>
              {fieldErrors.project ? (
                <small className="pay-field-error">
                  {fieldErrors.project}
                </small>
              ) : null}
            </div>

            <div className="pay-field">
              <label htmlFor="pay-period">
                Pay period <span>*</span>
              </label>
              <input
                id="pay-period"
                type="text"
                list="pay-period-options"
                value={formData.payPeriod}
                onChange={(event) =>
                  updateField("payPeriod", event.target.value)
                }
                placeholder="e.g. September 2026"
                aria-invalid={Boolean(fieldErrors.payPeriod)}
              />
              <datalist id="pay-period-options">
                {payPeriods.map((period) => (
                  <option key={period} value={period} />
                ))}
              </datalist>
              {fieldErrors.payPeriod ? (
                <small className="pay-field-error">
                  {fieldErrors.payPeriod}
                </small>
              ) : (
                <small className="pay-field-hint">
                  Free text, e.g. “September 2026” or “01 Sep - 15 Sep
                  2026”. Existing periods are suggested from MongoDB.
                </small>
              )}
            </div>

            <div className="pay-field-grid">
              <div className="pay-field">
                <label htmlFor="pay-period-start">
                  Period start date
                </label>
                <input
                  id="pay-period-start"
                  type="date"
                  value={formData.periodStart}
                  onChange={(event) =>
                    updateField("periodStart", event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.periodStart)}
                />
                {fieldErrors.periodStart ? (
                  <small className="pay-field-error">
                    {fieldErrors.periodStart}
                  </small>
                ) : (
                  <small className="pay-field-hint">
                    Used by the date filter and the attendance rollup.
                  </small>
                )}
              </div>

              <div className="pay-field">
                <label htmlFor="pay-period-end">Period end date</label>
                <input
                  id="pay-period-end"
                  type="date"
                  value={formData.periodEnd}
                  onChange={(event) =>
                    updateField("periodEnd", event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.periodEnd)}
                />
                {fieldErrors.periodEnd ? (
                  <small className="pay-field-error">
                    {fieldErrors.periodEnd}
                  </small>
                ) : null}
              </div>
            </div>

            <div className="pay-field-grid">
              <div className="pay-field">
                <label htmlFor="pay-basic">
                  Basic salary <span>*</span>
                </label>
                <input
                  id="pay-basic"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basicSalary}
                  onChange={(event) =>
                    updateField("basicSalary", event.target.value)
                  }
                  placeholder="0.00"
                  aria-invalid={Boolean(fieldErrors.basicSalary)}
                />
                {fieldErrors.basicSalary ? (
                  <small className="pay-field-error">
                    {fieldErrors.basicSalary}
                  </small>
                ) : null}
              </div>

              <div className="pay-field">
                <label htmlFor="pay-working-days">Working days</label>
                <input
                  id="pay-working-days"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.workingDays}
                  onChange={(event) =>
                    updateField("workingDays", event.target.value)
                  }
                  placeholder="Not captured"
                  aria-invalid={Boolean(fieldErrors.workingDays)}
                />
                {fieldErrors.workingDays ? (
                  <small className="pay-field-error">
                    {fieldErrors.workingDays}
                  </small>
                ) : (
                  <small className="pay-field-hint">
                    Leave blank to store “Not available”.
                  </small>
                )}
              </div>
            </div>

            <div className="pay-field-grid">
              <div className="pay-field">
                <label htmlFor="pay-ot-hours">Overtime hours</label>
                <input
                  id="pay-ot-hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.overtimeHours}
                  onChange={(event) =>
                    updateField("overtimeHours", event.target.value)
                  }
                  placeholder="Not captured"
                  aria-invalid={Boolean(fieldErrors.overtimeHours)}
                />
                {fieldErrors.overtimeHours ? (
                  <small className="pay-field-error">
                    {fieldErrors.overtimeHours}
                  </small>
                ) : null}
              </div>

              <div className="pay-field">
                <label htmlFor="pay-ot-amount">
                  Overtime amount
                </label>
                <input
                  id="pay-ot-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.overtimeAmount}
                  onChange={(event) =>
                    updateField("overtimeAmount", event.target.value)
                  }
                  placeholder="Not captured"
                  aria-invalid={Boolean(fieldErrors.overtimeAmount)}
                />
                {fieldErrors.overtimeAmount ? (
                  <small className="pay-field-error">
                    {fieldErrors.overtimeAmount}
                  </small>
                ) : null}
              </div>
            </div>

            <div className="pay-field-grid">
              <div className="pay-field">
                <label htmlFor="pay-allowances">Allowances</label>
                <input
                  id="pay-allowances"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.allowances}
                  onChange={(event) =>
                    updateField("allowances", event.target.value)
                  }
                  placeholder="0.00"
                  aria-invalid={Boolean(fieldErrors.allowances)}
                />
                {fieldErrors.allowances ? (
                  <small className="pay-field-error">
                    {fieldErrors.allowances}
                  </small>
                ) : null}
              </div>

              <div className="pay-field">
                <label htmlFor="pay-deductions">Deductions</label>
                <input
                  id="pay-deductions"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.deductions}
                  onChange={(event) =>
                    updateField("deductions", event.target.value)
                  }
                  placeholder="0.00"
                  aria-invalid={Boolean(fieldErrors.deductions)}
                />
                {fieldErrors.deductions ? (
                  <small className="pay-field-error">
                    {fieldErrors.deductions}
                  </small>
                ) : null}
              </div>
            </div>

            <div className="pay-block">
              <span className="pay-block-label">
                Net pay preview
              </span>

              <div className="pay-breakdown">
                {previewRows.map((row) => {
                  const captured = String(row.value ?? "").trim();

                  return (
                    <div
                      className={`pay-breakdown-row ${
                        row.debit ? "is-debit" : "is-credit"
                      } ${captured ? "" : "is-muted"}`}
                      key={row.label}
                    >
                      <span>
                        {row.label}
                        {row.debit ? " (deducted)" : ""}
                      </span>
                      <strong>
                        {captured
                          ? formatMoney(row.value)
                          : "Not available"}
                      </strong>
                    </div>
                  );
                })}

                <div className="pay-breakdown-row is-total">
                  <span>Net pay</span>
                  <strong>{formatMoney(net)}</strong>
                </div>
              </div>

              <small className="pay-field-hint">
                Recalculated and stored by the API on save. An empty
                component stays “Not available” rather than becoming
                a zero.
              </small>
            </div>

            <div className="pay-field-grid">
              <div className="pay-field">
                <label htmlFor="pay-status">Payment status</label>
                <select
                  id="pay-status"
                  value={formData.paymentStatus}
                  onChange={(event) =>
                    updateField("paymentStatus", event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.paymentStatus)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {fieldErrors.paymentStatus ? (
                  <small className="pay-field-error">
                    {fieldErrors.paymentStatus}
                  </small>
                ) : (
                  <small className="pay-field-hint">
                    Moving a run to Paid stamps the payment date.
                  </small>
                )}
              </div>

              <div className="pay-field">
                <label htmlFor="pay-date">Payment date</label>
                <input
                  id="pay-date"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(event) =>
                    updateField("paymentDate", event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.paymentDate)}
                />
                {fieldErrors.paymentDate ? (
                  <small className="pay-field-error">
                    {fieldErrors.paymentDate}
                  </small>
                ) : null}
              </div>
            </div>

            <div className="pay-field-grid">
              <div className="pay-field">
                <label htmlFor="pay-method">Payment method</label>
                <select
                  id="pay-method"
                  value={formData.paymentMethod}
                  onChange={(event) =>
                    updateField("paymentMethod", event.target.value)
                  }
                >
                  <option value="">Not recorded</option>
                  {methods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pay-field">
                <label htmlFor="pay-reference">
                  Payment reference
                </label>
                <input
                  id="pay-reference"
                  type="text"
                  value={formData.paymentReference}
                  onChange={(event) =>
                    updateField(
                      "paymentReference",
                      event.target.value
                    )
                  }
                  placeholder="UTR / transaction id"
                />
              </div>
            </div>

            <div className="pay-field">
              <label htmlFor="pay-notes">Notes</label>
              <textarea
                id="pay-notes"
                rows={3}
                value={formData.notes}
                onChange={(event) =>
                  updateField("notes", event.target.value)
                }
                placeholder="Arrears, bonuses, one-off adjustments"
              />
            </div>
          </div>

          <div className="pay-modal-footer">
            <button
              type="button"
              className="pay-btn pay-btn-ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="pay-btn pay-btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2
                    size={14}
                    className="pay-spin"
                    aria-hidden="true"
                  />
                  Saving...
                </>
              ) : isEditing ? (
                "Save changes"
              ) : (
                <>
                  <Wallet size={14} aria-hidden="true" />
                  Raise payroll
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PayrollFormModal;
