import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Loader2, X } from "lucide-react";

import API from "../../services/api";

import {
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_TYPES,
  STORED_STATUSES,
  canCreateMaintenance,
  roleLabel,
  toDateInputValue,
} from "../../utils/maintenance";

const EMPTY_FORM = {
  title: "",
  description: "",
  maintenanceType: "Preventive Maintenance",
  project: "",
  equipment: "",
  assignedTo: "",
  scheduledDate: "",
  scheduledTime: "",
  priority: "Medium",
  status: "Scheduled",
  notes: "",
};

const REQUIRED_FIELDS = [
  ["title", "Maintenance title is required"],
  ["maintenanceType", "Maintenance type is required"],
  ["project", "Project / site is required"],
  ["scheduledDate", "Scheduled date is required"],
  ["priority", "Priority is required"],
];

// Create / edit form. Managers get the full schedule; anyone
// else only gets the workflow fields of their own job, which is
// exactly what the API accepts for them.
function MaintenanceFormModal({
  open = false,
  record = null,
  options = {},
  notify = () => {},
  onClose = () => {},
  onSaved = () => {},
}) {
  const isManager = canCreateMaintenance();
  const isEditing = Boolean(record);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const maintenanceTypes = options.maintenanceTypes?.length
    ? options.maintenanceTypes
    : MAINTENANCE_TYPES;

  const priorities = options.priorities?.length
    ? options.priorities
    : MAINTENANCE_PRIORITIES;

  const projects = options.projects || [];
  const equipment = options.equipment || [];
  const assignees = options.assignees || [];

  // Prefill from the record that is being edited
  useEffect(() => {
    if (!open) return;

    if (!record) {
      setFormData(EMPTY_FORM);
    } else {
      setFormData({
        title: record.title || "",
        description: record.description || "",
        maintenanceType:
          record.maintenanceType || EMPTY_FORM.maintenanceType,
        project: record.project?._id || "",
        equipment: record.equipment?._id || "",
        assignedTo: record.assignedTo?._id || "",
        scheduledDate: toDateInputValue(record.scheduledDate),
        scheduledTime: record.scheduledTime || "",
        priority: record.priority || "Medium",
        // "Overdue" is derived, so the stored status is edited
        status: record.storedStatus || record.status || "Scheduled",
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

  const title = useMemo(() => {
    if (!isEditing) return "Schedule Maintenance";
    return isManager
      ? "Edit Maintenance"
      : "Update Maintenance Progress";
  }, [isEditing, isManager]);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const errors = {};

    if (isManager) {
      REQUIRED_FIELDS.forEach(([field, message]) => {
        if (!String(formData[field] || "").trim()) {
          errors[field] = message;
        }
      });

      if (
        formData.scheduledDate &&
        Number.isNaN(new Date(formData.scheduledDate).getTime())
      ) {
        errors.scheduledDate = "Enter a valid date";
      }
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

    const payload = isManager
      ? {
          title: formData.title.trim(),
          description: formData.description.trim(),
          maintenanceType: formData.maintenanceType,
          project: formData.project,
          equipment: formData.equipment || null,
          assignedTo: formData.assignedTo || null,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime.trim(),
          priority: formData.priority,
          status: formData.status,
          notes: formData.notes.trim(),
        }
      : {
          status: formData.status,
          notes: formData.notes.trim(),
        };

    try {
      setSubmitting(true);

      const response = isEditing
        ? await API.put(
            `/maintenance/${record._id}`,
            payload
          )
        : await API.post("/maintenance", payload);

      notify(
        response.data?.message ||
          (isEditing
            ? "Maintenance updated"
            : "Maintenance scheduled"),
        "success"
      );

      onSaved(response.data?.data || null);
      onClose();
    } catch (error) {
      const errors = error.response?.data?.errors;

      if (errors) setFieldErrors(errors);

      const message =
        error.response?.data?.message ||
        "Failed to save maintenance";

      setFormError(message);
      notify(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="mnt-modal-backdrop"
      role="presentation"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="mnt-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mnt-modal-header">
          <div>
            <h3>{title}</h3>
            <p>
              {isEditing && record?.maintenanceId
                ? `${record.maintenanceId} · ${record.project?.name || ""}`
                : "Plan, assign and track equipment and site maintenance."}
            </p>
          </div>

          <button
            type="button"
            className="mnt-icon-btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close maintenance form"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mnt-modal-body">
            {formError ? (
              <div className="mnt-alert mnt-alert-error">
                {formError}
              </div>
            ) : null}

            {isManager ? (
              <>
                <div className="mnt-field">
                  <label htmlFor="mnt-title">
                    Maintenance task <span>*</span>
                  </label>
                  <input
                    id="mnt-title"
                    type="text"
                    value={formData.title}
                    onChange={(event) =>
                      updateField("title", event.target.value)
                    }
                    placeholder="e.g. Tower Crane #1 gearbox oil change"
                    aria-invalid={Boolean(fieldErrors.title)}
                  />
                  {fieldErrors.title ? (
                    <small className="mnt-field-error">
                      {fieldErrors.title}
                    </small>
                  ) : null}
                </div>

                <div className="mnt-field-grid">
                  <div className="mnt-field">
                    <label htmlFor="mnt-type">
                      Maintenance type <span>*</span>
                    </label>
                    <select
                      id="mnt-type"
                      value={formData.maintenanceType}
                      onChange={(event) =>
                        updateField(
                          "maintenanceType",
                          event.target.value
                        )
                      }
                      aria-invalid={Boolean(
                        fieldErrors.maintenanceType
                      )}
                    >
                      {maintenanceTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.maintenanceType ? (
                      <small className="mnt-field-error">
                        {fieldErrors.maintenanceType}
                      </small>
                    ) : null}
                  </div>

                  <div className="mnt-field">
                    <label htmlFor="mnt-priority">
                      Priority <span>*</span>
                    </label>
                    <select
                      id="mnt-priority"
                      value={formData.priority}
                      onChange={(event) =>
                        updateField("priority", event.target.value)
                      }
                    >
                      {priorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mnt-field">
                  <label htmlFor="mnt-project">
                    Project / site <span>*</span>
                  </label>
                  <select
                    id="mnt-project"
                    value={formData.project}
                    onChange={(event) =>
                      updateField("project", event.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.project)}
                  >
                    <option value="">Select a project</option>
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
                    <small className="mnt-field-error">
                      {fieldErrors.project}
                    </small>
                  ) : null}
                </div>

                <div className="mnt-field-grid">
                  <div className="mnt-field">
                    <label htmlFor="mnt-equipment">
                      Equipment / asset
                    </label>
                    <select
                      id="mnt-equipment"
                      value={formData.equipment}
                      onChange={(event) =>
                        updateField("equipment", event.target.value)
                      }
                    >
                      <option value="">No equipment</option>
                      {equipment.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name} ({item.type})
                        </option>
                      ))}
                    </select>
                    {fieldErrors.equipment ? (
                      <small className="mnt-field-error">
                        {fieldErrors.equipment}
                      </small>
                    ) : null}
                  </div>

                  <div className="mnt-field">
                    <label htmlFor="mnt-assignee">
                      Assigned worker / technician
                    </label>
                    <select
                      id="mnt-assignee"
                      value={formData.assignedTo}
                      onChange={(event) =>
                        updateField("assignedTo", event.target.value)
                      }
                    >
                      <option value="">Unassigned</option>
                      {assignees.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} — {roleLabel(user.role)}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.assignedTo ? (
                      <small className="mnt-field-error">
                        {fieldErrors.assignedTo}
                      </small>
                    ) : null}
                  </div>
                </div>

                <div className="mnt-field-grid">
                  <div className="mnt-field">
                    <label htmlFor="mnt-date">
                      Scheduled date <span>*</span>
                    </label>
                    <input
                      id="mnt-date"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(event) =>
                        updateField("scheduledDate", event.target.value)
                      }
                      aria-invalid={Boolean(
                        fieldErrors.scheduledDate
                      )}
                    />
                    {fieldErrors.scheduledDate ? (
                      <small className="mnt-field-error">
                        {fieldErrors.scheduledDate}
                      </small>
                    ) : null}
                  </div>

                  <div className="mnt-field">
                    <label htmlFor="mnt-time">
                      Scheduled time
                    </label>
                    <input
                      id="mnt-time"
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(event) =>
                        updateField("scheduledTime", event.target.value)
                      }
                      aria-invalid={Boolean(
                        fieldErrors.scheduledTime
                      )}
                    />
                    {fieldErrors.scheduledTime ? (
                      <small className="mnt-field-error">
                        {fieldErrors.scheduledTime}
                      </small>
                    ) : null}
                  </div>
                </div>

                {isEditing ? (
                  <div className="mnt-field">
                    <label htmlFor="mnt-status">Status</label>
                    <select
                      id="mnt-status"
                      value={formData.status}
                      onChange={(event) =>
                        updateField("status", event.target.value)
                      }
                    >
                      {STORED_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <small className="mnt-field-hint">
                      Overdue is applied automatically once a
                      scheduled date/time passes.
                    </small>
                  </div>
                ) : null}

                <div className="mnt-field">
                  <label htmlFor="mnt-description">
                    Description
                  </label>
                  <textarea
                    id="mnt-description"
                    rows={3}
                    value={formData.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Scope of work, tooling and safety requirements"
                  />
                </div>
              </>
            ) : (
              <div className="mnt-restricted-note">
                <CalendarClock size={16} aria-hidden="true" />
                <span>
                  You can update the status and add site notes for
                  this job. Scheduling changes are made by the
                  project manager or site engineer.
                </span>
              </div>
            )}

            <div className="mnt-field">
              <label htmlFor="mnt-notes">
                {isManager ? "Notes" : "Site notes"}
              </label>
              <textarea
                id="mnt-notes"
                rows={2}
                value={formData.notes}
                onChange={(event) =>
                  updateField("notes", event.target.value)
                }
                placeholder="Parts used, follow-up actions, hand-over notes"
              />
            </div>
          </div>

          <div className="mnt-modal-footer">
            <button
              type="button"
              className="mnt-btn mnt-btn-ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="mnt-btn mnt-btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2
                    size={14}
                    className="mnt-spin"
                    aria-hidden="true"
                  />
                  Saving...
                </>
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Schedule maintenance"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MaintenanceFormModal;
