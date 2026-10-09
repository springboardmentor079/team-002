import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Ban,
  CalendarClock,
  CheckCircle2,
  Clock3,
  HandCoins,
  Pencil,
  Trash2,
  TriangleAlert,
  Wallet,
} from "lucide-react";

import API from "../../services/api";
import Toast from "../../components/common/Toast";
import ConfirmDialog from "../../components/payroll/ConfirmDialog";
import PayrollFormModal from "../../components/payroll/PayrollFormModal";
import {
  MethodChip,
  OutstandingChip,
  PaymentStatusBadge,
} from "../../components/payroll/PayrollBadges";

import {
  canCreatePayroll,
  canDeletePayroll,
  employeeLabel,
  formatDate,
  formatDateTime,
  formatDays,
  formatHours,
  formatMoney,
  formatRelativeTime,
  isCaptured,
  payPeriodLabel,
  projectLabel,
  roleLabel,
} from "../../utils/payroll";
import { useToasts } from "../../utils/toast";

import "../../styles/payroll.css";

// The quick status actions offered from the details screen. Each
// one is a real write to the payroll collection via
// PUT /payroll/:id/status, never a client-only toggle.
const STATUS_ACTIONS = {
  Processing: {
    label: "Mark processing",
    icon: HandCoins,
    tone: "primary",
    confirm: false,
  },
  Paid: {
    label: "Mark as paid",
    icon: CheckCircle2,
    tone: "primary",
    confirm: true,
  },
  Cancelled: {
    label: "Cancel run",
    icon: Ban,
    tone: "warning",
    confirm: true,
  },
};

const ATTENDANCE_CELLS = [
  { key: "present", label: "Present", tone: "is-present" },
  { key: "late", label: "Late", tone: "is-late" },
  { key: "halfDay", label: "Half Day", tone: "is-half" },
  { key: "absent", label: "Absent", tone: "is-absent" },
  { key: "totalRecords", label: "Records", tone: "" },
];

function PayrollDetails({ basePath = "/admin/payroll" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toasts, pushToast, dismissToast } = useToasts();

  const [record, setRecord] = useState(null);
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [statusBusy, setStatusBusy] = useState("");
  const [confirmStatus, setConfirmStatus] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canManage = canCreatePayroll();
  const canDelete = canDeletePayroll();

  const loadRecord = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get(`/payroll/${id}`);
      setRecord(response.data?.data || null);
    } catch (loadError) {
      setRecord(null);
      setError(
        loadError.response?.data?.message ||
          "Could not load this payroll record"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  // Reference data is only needed when the form is opened
  useEffect(() => {
    if (!formOpen || Object.keys(options).length) return;

    let active = true;

    API.get("/payroll/options")
      .then((response) => {
        if (active) setOptions(response.data?.data || {});
      })
      .catch((optionsError) => {
        console.error(
          "Failed to fetch payroll options:",
          optionsError
        );
      });

    return () => {
      active = false;
    };
  }, [formOpen, options]);

  // Moving a run into Paid or cancelling it both need a
  // confirmation before they are sent to the API.
  const requestStatusChange = (nextStatus) => {
    const action = STATUS_ACTIONS[nextStatus];

    if (action?.confirm) {
      setConfirmStatus(nextStatus);
      return;
    }

    applyStatusChange(nextStatus);
  };

  const applyStatusChange = async (nextStatus) => {
    try {
      setStatusBusy(nextStatus);

      const response = await API.put(
        `/payroll/${id}/status`,
        { paymentStatus: nextStatus }
      );

      setRecord(response.data?.data || null);
      setConfirmStatus("");
      pushToast(
        response.data?.message ||
          `Payment status updated to ${nextStatus}`,
        "success"
      );
    } catch (statusError) {
      pushToast(
        statusError.response?.data?.message ||
          "Failed to update payment status",
        "error"
      );
    } finally {
      setStatusBusy("");
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);

      const response = await API.delete(`/payroll/${id}`);

      pushToast(
        response.data?.message || "Payroll record deleted",
        "success"
      );

      navigate(basePath);
    } catch (deleteError) {
      pushToast(
        deleteError.response?.data?.message ||
          "Failed to delete payroll record",
        "error"
      );
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-card pay-detail-loading">
        <div className="pay-skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p>Loading payroll record…</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="dashboard-card">
        <div className="pay-state pay-state-error">
          <TriangleAlert size={22} aria-hidden="true" />
          <strong>{error || "Payroll record not found"}</strong>

          <div className="pay-state-actions">
            <button
              type="button"
              className="pay-btn pay-btn-ghost pay-btn-sm"
              onClick={() => navigate(basePath)}
            >
              Back to register
            </button>
            <button
              type="button"
              className="pay-btn pay-btn-primary pay-btn-sm"
              onClick={loadRecord}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // The current status is never offered as a transition back to
  // itself, so a run can only ever move to a different state.
  const availableStatuses = Object.keys(STATUS_ACTIONS).filter(
    (status) => status !== record.paymentStatus
  );

  const attendance = record.attendance;

  const facts = [
    {
      label: "Payroll ID",
      value: record.payrollId,
      hint: `Raised ${formatRelativeTime(record.createdAt)}`,
    },
    {
      label: "Worker",
      value: employeeLabel(record.employee),
      hint: record.employee
        ? `${roleLabel(record.employee.role)}${
            record.employee.department
              ? ` · ${record.employee.department}`
              : ""
          }`
        : "",
    },
    {
      label: "Project / Site",
      value: projectLabel(record.project),
      hint:
        record.project?.location || record.project?.code || "",
    },
    {
      label: "Pay Period",
      value: payPeriodLabel(record),
      hint:
        record.periodStart && record.periodEnd
          ? `${formatDate(record.periodStart)} - ${formatDate(
              record.periodEnd
            )}`
          : "No date range set",
    },
    {
      label: "Working Days",
      value: formatDays(record.workingDays),
    },
    {
      label: "Overtime Hours",
      value: formatHours(record.overtimeHours),
    },
    {
      label: "Payment Date",
      value: record.paymentDate
        ? formatDate(record.paymentDate)
        : "Not paid yet",
      hint: record.paymentReference
        ? `Ref ${record.paymentReference}`
        : "",
    },
    {
      label: "Last Updated",
      value: formatDateTime(record.updatedAt),
      hint: record.createdBy?.name
        ? `By ${record.createdBy.name}`
        : "",
    },
  ];

  const earnings = [
    { label: "Basic salary", value: record.basicSalary },
    {
      label: "Overtime amount",
      value: record.overtimeAmount,
    },
    { label: "Allowances", value: record.allowances },
    {
      label: "Deductions",
      value: record.deductions,
      debit: true,
    },
  ];

  return (
    <>
      <div className="pay-detail-head">
        <button
          type="button"
          className="pay-back"
          onClick={() => navigate(basePath)}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to payroll
        </button>

        <div className="pay-detail-title">
          <div>
            <h1>{employeeLabel(record.employee)}</h1>
            <p>
              {record.payrollId} · {payPeriodLabel(record)}
            </p>
          </div>

          <div className="pay-detail-chips">
            <PaymentStatusBadge status={record.paymentStatus} />
            <MethodChip method={record.paymentMethod} />
            {record.isOutstanding ? <OutstandingChip /> : null}
          </div>
        </div>

        <div className="pay-detail-actions">
          {canManage ? (
            <button
              type="button"
              className="pay-btn pay-btn-ghost"
              onClick={() => setFormOpen(true)}
            >
              <Pencil size={14} aria-hidden="true" />
              Edit
            </button>
          ) : null}

          {canManage
            ? availableStatuses.map((status) => {
                const action = STATUS_ACTIONS[status];

                if (!action) return null;

                const Icon = action.icon;

                return (
                  <button
                    key={status}
                    type="button"
                    className={`pay-btn ${
                      action.tone === "warning"
                        ? "pay-btn-danger"
                        : "pay-btn-primary"
                    }`}
                    onClick={() => requestStatusChange(status)}
                    disabled={Boolean(statusBusy)}
                  >
                    <Icon size={14} aria-hidden="true" />
                    {statusBusy === status
                      ? "Saving…"
                      : action.label}
                  </button>
                );
              })
            : null}

          {canDelete ? (
            <button
              type="button"
              className="pay-btn pay-btn-ghost pay-btn-danger-text"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </button>
          ) : null}
        </div>
      </div>

      {record.isOutstanding ? (
        <div className="pay-alert pay-alert-warning">
          <TriangleAlert size={15} aria-hidden="true" />
          <span>
            This run is still {record.paymentStatus.toLowerCase()} for{" "}
            {formatMoney(record.netSalary)} on {payPeriodLabel(record)}.
            A manager can mark it processing or paid from the
            buttons above.
          </span>
        </div>
      ) : null}

      <div className="pay-detail-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="pay-card-title">
              <Wallet
                size={18}
                color="#d97706"
                aria-hidden="true"
              />
              <h3>Pay Run Details</h3>
            </div>
          </div>

          <div className="pay-facts">
            {facts.map((fact) => (
              <div className="pay-fact" key={fact.label}>
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
                {fact.hint ? <small>{fact.hint}</small> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="pay-detail-side">
          <div className="dashboard-card">
            <div className="card-header">
              <div className="pay-card-title">
                <Wallet
                  size={18}
                  color="#d97706"
                  aria-hidden="true"
                />
                <h3>Earnings &amp; Deductions</h3>
              </div>
            </div>

            <div className="pay-block">
              <div className="pay-breakdown">
                {earnings.map((row) => (
                  <div
                    className={`pay-breakdown-row ${
                      row.debit ? "is-debit" : "is-credit"
                    } ${
                      isCaptured(row.value) ? "" : "is-muted"
                    }`}
                    key={row.label}
                  >
                    <span>
                      {row.label}
                      {row.debit ? " (deducted)" : ""}
                    </span>
                    <strong>{formatMoney(row.value)}</strong>
                  </div>
                ))}

                <div className="pay-breakdown-row">
                  <span>Gross pay</span>
                  <strong>
                    {formatMoney(record.grossSalary)}
                  </strong>
                </div>

                <div className="pay-breakdown-row is-total">
                  <span>Net pay</span>
                  <strong>
                    {formatMoney(record.netSalary)}
                  </strong>
                </div>
              </div>

              <small className="pay-field-hint">
                Net pay is recalculated by the API as basic +
                overtime + allowances − deductions, so it can never
                contradict its own components.
              </small>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="pay-card-title">
                <CalendarClock
                  size={18}
                  color="#d97706"
                  aria-hidden="true"
                />
                <h3>Attendance Rollup</h3>
              </div>
            </div>

            <div className="pay-block">
              <span className="pay-block-label">
                {attendance?.window
                  ? `${formatDate(
                      attendance.window.from
                    )} - ${formatDate(attendance.window.to)}`
                  : "Pay period window"}
              </span>

              {attendance?.available ? (
                <>
                  <div className="pay-attendance-grid">
                    {ATTENDANCE_CELLS.map((cell) => (
                      <div
                        className={`pay-attendance-cell ${cell.tone}`}
                        key={cell.key}
                      >
                        <strong>{attendance[cell.key] ?? 0}</strong>
                        <span>{cell.label}</span>
                      </div>
                    ))}
                  </div>

                  <small className="pay-field-hint">
                    Counted from the real attendance rows for this
                    worker in this pay period.
                  </small>
                </>
              ) : (
                <>
                  <div className="pay-restricted-note">
                    <Clock3 size={16} aria-hidden="true" />
                    <span>
                      {attendance?.reason ||
                        "Attendance could not be read for this run."}
                    </span>
                  </div>

                  <small className="pay-field-hint">
                    No estimate is shown in place of the real count.
                  </small>
                </>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="pay-card-title">
                <HandCoins
                  size={18}
                  color="#d97706"
                  aria-hidden="true"
                />
                <h3>Disbursement</h3>
              </div>
            </div>

            <div className="pay-block">
              <span className="pay-block-label">Payment method</span>
              <p>{record.paymentMethod || "Not recorded"}</p>
            </div>

            <div className="pay-block">
              <span className="pay-block-label">
                Payment reference
              </span>
              <p>
                {record.paymentReference || "No reference captured"}
              </p>
            </div>

            <div className="pay-block">
              <span className="pay-block-label">Notes</span>
              <p>{record.notes || "No notes recorded yet."}</p>
            </div>
          </div>
        </div>
      </div>

      <PayrollFormModal
        open={formOpen}
        record={record}
        options={options}
        notify={pushToast}
        onClose={() => setFormOpen(false)}
        onSaved={(updated) => {
          if (updated) setRecord(updated);
          else loadRecord();
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmStatus)}
        title={
          confirmStatus === "Paid"
            ? "Mark this payroll run as paid"
            : confirmStatus === "Cancelled"
              ? "Cancel this payroll run"
              : "Change payment status"
        }
        message={
          confirmStatus === "Paid"
            ? "The payment date will be recorded in MongoDB and a notification sent to the worker."
            : confirmStatus === "Cancelled"
              ? "The run stays in the register as cancelled and cannot be resumed from here."
              : "The new status will be written to MongoDB."
        }
        confirmLabel={
          confirmStatus === "Paid"
            ? "Mark as paid"
            : confirmStatus === "Cancelled"
              ? "Cancel run"
              : "Update status"
        }
        tone={confirmStatus === "Cancelled" ? "danger" : "primary"}
        busy={Boolean(statusBusy)}
        onCancel={() => setConfirmStatus("")}
        onConfirm={() => applyStatusChange(confirmStatus)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete payroll record"
        message={`${record.payrollId} for ${employeeLabel(
          record.employee
        )} will be permanently removed.`}
        confirmLabel="Delete record"
        busy={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export default PayrollDetails;
