import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Ban,
  CalendarClock,
  CheckCircle2,
  CirclePlay,
  Pencil,
  Trash2,
  TriangleAlert,
  User,
  Wrench,
} from "lucide-react";

import API from "../../services/api";
import Toast from "../../components/common/Toast";
import ConfirmDialog from "../../components/maintenance/ConfirmDialog";
import MaintenanceFormModal from "../../components/maintenance/MaintenanceFormModal";
import {
  PriorityBadge,
  StatusBadge,
  TypeChip,
} from "../../components/maintenance/MaintenanceBadges";

import {
  canCreateMaintenance,
  canDeleteMaintenance,
  canEditMaintenanceRecord,
  equipmentLabel,
  formatDate,
  formatDateTime,
  formatTime,
  nextStatuses,
  projectLabel,
  roleLabel,
} from "../../utils/maintenance";
import { useToasts } from "../../utils/toast";

import "../../styles/maintenance.css";

const STATUS_ACTIONS = {
  "In Progress": {
    label: "Start work",
    icon: CirclePlay,
    tone: "primary",
  },
  Completed: {
    label: "Mark completed",
    icon: CheckCircle2,
    tone: "primary",
  },
  Cancelled: {
    label: "Cancel job",
    icon: Ban,
    tone: "warning",
  },
};

function MaintenanceDetails({ basePath = "/admin/maintenance" }) {
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

  const canManage = canCreateMaintenance();
  const canDelete = canDeleteMaintenance();
  const canEdit = canEditMaintenanceRecord(record);
  const availableStatuses = record ? nextStatuses(record) : [];

  const loadRecord = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get(`/maintenance/${id}`);
      setRecord(response.data?.data || null);
    } catch (loadError) {
      setRecord(null);
      setError(
        loadError.response?.data?.message ||
          "Could not load this maintenance record"
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

    API.get("/maintenance/options")
      .then((response) => {
        if (active) setOptions(response.data?.data || {});
      })
      .catch((optionsError) => {
        console.error(
          "Failed to fetch maintenance options:",
          optionsError
        );
      });

    return () => {
      active = false;
    };
  }, [formOpen, options]);

  // A cancelled or completed job is terminal, those need a
  // confirmation before they are sent to the API.
  const requestStatusChange = (nextStatus) => {
    if (nextStatus === "Cancelled" || nextStatus === "Completed") {
      setConfirmStatus(nextStatus);
      return;
    }

    applyStatusChange(nextStatus);
  };

  const applyStatusChange = async (nextStatus) => {
    try {
      setStatusBusy(nextStatus);

      // Managers may change any status; an assignee can only
      // move their own job forward, which is what the API
      // accepts from a worker / contractor.
      const response = await API.put(
        `/maintenance/${id}`,
        { status: nextStatus }
      );

      setRecord(response.data?.data || null);
      setConfirmStatus("");
      pushToast(
        response.data?.message ||
          `Maintenance marked as ${nextStatus}`,
        "success"
      );
    } catch (statusError) {
      pushToast(
        statusError.response?.data?.message ||
          "Failed to update maintenance status",
        "error"
      );
    } finally {
      setStatusBusy("");
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);

      const response = await API.delete(`/maintenance/${id}`);

      pushToast(
        response.data?.message ||
          "Maintenance record deleted",
        "success"
      );

      navigate(basePath);
    } catch (deleteError) {
      pushToast(
        deleteError.response?.data?.message ||
          "Failed to delete maintenance record",
        "error"
      );
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-card mnt-card mnt-detail-loading">
        <div className="mnt-skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p>Loading maintenance record…</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="dashboard-card mnt-card">
        <div className="mnt-state mnt-state-error">
          <TriangleAlert size={22} aria-hidden="true" />
          <strong>{error || "Maintenance record not found"}</strong>

          <div className="mnt-state-actions">
            <button
              type="button"
              className="mnt-btn mnt-btn-ghost mnt-btn-sm"
              onClick={() => navigate(basePath)}
            >
              Back to list
            </button>
            <button
              type="button"
              className="mnt-btn mnt-btn-primary mnt-btn-sm"
              onClick={loadRecord}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const facts = [
    {
      label: "Maintenance ID",
      value: record.maintenanceId,
    },
    {
      label: "Project / Site",
      value: projectLabel(record.project),
      hint: record.project?.location || record.project?.code || "",
    },
    {
      label: "Equipment / Asset",
      value: equipmentLabel(record.equipment),
      hint: record.equipment?.type || "",
    },
    {
      label: "Assigned Worker",
      value: record.assignedTo?.name || "Unassigned",
      hint: record.assignedTo
        ? `${roleLabel(record.assignedTo.role)}${
            record.assignedTo.department
              ? ` · ${record.assignedTo.department}`
              : ""
          }`
        : "No technician assigned",
    },
    {
      label: "Scheduled Date",
      value: formatDate(record.scheduledDate),
      hint: record.scheduledTime
        ? formatTime(record.scheduledTime)
        : "All day",
    },
    {
      label: "Created By",
      value: record.createdBy?.name || "System",
      hint: formatDateTime(record.createdAt),
    },
    {
      label: "Last Updated",
      value: formatDateTime(record.updatedAt),
    },
    {
      label: "Completed On",
      value: record.completedAt
        ? formatDateTime(record.completedAt)
        : "Not completed",
    },
  ];

  return (
    <>
      <div className="mnt-detail-head">
        <button
          type="button"
          className="mnt-back"
          onClick={() => navigate(basePath)}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to maintenance
        </button>

        <div className="mnt-detail-title">
          <div>
            <h1>{record.title}</h1>
            <p>
              {record.maintenanceId} · {projectLabel(record.project)}
            </p>
          </div>

          <div className="mnt-detail-chips">
            <StatusBadge status={record.status} />
            <PriorityBadge priority={record.priority} />
            <TypeChip type={record.maintenanceType} />
          </div>
        </div>

        <div className="mnt-detail-actions">
          {canEdit ? (
            <button
              type="button"
              className="mnt-btn mnt-btn-ghost"
              onClick={() => setFormOpen(true)}
            >
              <Pencil size={14} aria-hidden="true" />
              {canManage ? "Edit" : "Update progress"}
            </button>
          ) : null}

          {canEdit
            ? availableStatuses.map((status) => {
                const action = STATUS_ACTIONS[status];

                if (!action) return null;

                const Icon = action.icon;

                return (
                  <button
                    key={status}
                    type="button"
                    className={`mnt-btn ${
                      action.tone === "warning"
                        ? "mnt-btn-danger"
                        : "mnt-btn-primary"
                    }`}
                    onClick={() =>
                      requestStatusChange(status)
                    }
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
              className="mnt-btn mnt-btn-ghost mnt-btn-danger-text"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </button>
          ) : null}
        </div>
      </div>

      {record.isOverdue ? (
        <div className="mnt-alert mnt-alert-warning">
          <TriangleAlert size={15} aria-hidden="true" />
          <span>
            This job is overdue - it was scheduled for{" "}
            {formatDateTime(record.scheduledFor)} and is still
            marked as {record.storedStatus.toLowerCase()}.
          </span>
        </div>
      ) : null}

      <div className="mnt-detail-grid">
        <div className="dashboard-card mnt-card">
          <div className="card-header">
            <div className="mnt-card-title">
              <Wrench size={18} color="#d97706" aria-hidden="true" />
              <h3>Maintenance Details</h3>
            </div>
          </div>

          <div className="mnt-facts">
            {facts.map((fact) => (
              <div className="mnt-fact" key={fact.label}>
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
                {fact.hint ? <small>{fact.hint}</small> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="mnt-detail-side">
          <div className="dashboard-card mnt-card">
            <div className="card-header">
              <div className="mnt-card-title">
                <CalendarClock
                  size={18}
                  color="#d97706"
                  aria-hidden="true"
                />
                <h3>Scope &amp; Notes</h3>
              </div>
            </div>

            <div className="mnt-block">
              <span className="mnt-block-label">Description</span>
              <p>
                {record.description ||
                  "No description provided."}
              </p>
            </div>

            <div className="mnt-block">
              <span className="mnt-block-label">Notes</span>
              <p>{record.notes || "No notes recorded yet."}</p>
            </div>
          </div>

          <div className="dashboard-card mnt-card">
            <div className="card-header">
              <div className="mnt-card-title">
                <User size={18} color="#d97706" aria-hidden="true" />
                <h3>Assignment</h3>
              </div>
            </div>

            <div className="mnt-block">
              <span className="mnt-block-label">
                Assigned worker / technician
              </span>
              <p>
                {record.assignedTo
                  ? `${record.assignedTo.name}${
                      record.assignedTo.role
                        ? ` (${roleLabel(record.assignedTo.role)})`
                        : ""
                    }`
                  : "Unassigned"}
              </p>
            </div>

            <div className="mnt-block">
              <span className="mnt-block-label">Created by</span>
              <p>
                {record.createdBy?.name || "System"}
                {record.createdBy?.role
                  ? ` (${roleLabel(record.createdBy.role)})`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <MaintenanceFormModal
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
          confirmStatus === "Completed"
            ? "Mark maintenance as completed"
            : "Cancel this maintenance job"
        }
        message={
          confirmStatus === "Completed"
            ? "The completion date will be recorded in MongoDB."
            : "The job stays in the register as cancelled and cannot be resumed."
        }
        confirmLabel={
          confirmStatus === "Completed" ? "Mark completed" : "Cancel job"
        }
        tone={confirmStatus === "Completed" ? "primary" : "danger"}
        busy={Boolean(statusBusy)}
        onCancel={() => setConfirmStatus("")}
        onConfirm={() => applyStatusChange(confirmStatus)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete maintenance record"
        message={`${record.maintenanceId} - ${record.title} will be permanently removed.`}
        confirmLabel="Delete record"
        busy={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export default MaintenanceDetails;
