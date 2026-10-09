import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  CalendarClock,
  Eye,
  Filter,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  TriangleAlert,
  Wrench,
} from "lucide-react";

import API from "../../services/api";
import Toast from "../../components/common/Toast";
import StatCard from "../../components/dashboard/StatCard";
import ConfirmDialog from "../../components/maintenance/ConfirmDialog";
import MaintenanceFormModal from "../../components/maintenance/MaintenanceFormModal";
import {
  PriorityBadge,
  StatusBadge,
  TypeChip,
} from "../../components/maintenance/MaintenanceBadges";

import {
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_TYPES,
  canCreateMaintenance,
  canDeleteMaintenance,
  canEditMaintenanceRecord,
  equipmentLabel,
  formatDate,
  formatRelativeTime,
  formatTime,
  projectLabel,
  roleLabel,
} from "../../utils/maintenance";
import { useToasts } from "../../utils/toast";

import "../../styles/maintenance.css";

const EMPTY_FILTERS = {
  search: "",
  status: "",
  priority: "",
  maintenanceType: "",
  project: "",
  date: "",
};

const PAGE_SIZE = 10;

function MaintenanceList({ basePath = "/admin/maintenance" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, pushToast, dismissToast } = useToasts();

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [options, setOptions] = useState({});
  // Filters are seeded from the URL so the dashboard snapshot
  // can deep link straight into a pre-filtered register.
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
    maintenanceType: searchParams.get("type") || "",
    project: searchParams.get("project") || "",
  }));
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") || ""
  );
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const canCreate = canCreateMaintenance();
  const canDelete = canDeleteMaintenance();

  // Filter / option metadata for the selects (projects, assets
  // and workers are read from MongoDB)
  const statusOptions = options.statuses?.length
    ? [...options.statuses, "Overdue"]
    : MAINTENANCE_STATUSES;

  const typeOptions = options.maintenanceTypes?.length
    ? options.maintenanceTypes
    : MAINTENANCE_TYPES;

  const priorityOptions = options.priorities?.length
    ? options.priorities
    : MAINTENANCE_PRIORITIES;

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some(Boolean),
    [filters]
  );

  // Search is debounced so typing does not fire a request per key
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) =>
        current.search === searchInput
          ? current
          : { ...current, search: searchInput }
      );
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadSummary = useCallback(async () => {
    try {
      const response = await API.get("/maintenance/summary");
      setSummary(response.data?.data || null);
    } catch (summaryError) {
      console.error(
        "Failed to fetch maintenance summary:",
        summaryError
      );
    }
  }, []);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = { page, limit: PAGE_SIZE };

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.maintenanceType) {
        params.maintenanceType = filters.maintenanceType;
      }
      if (filters.project) params.project = filters.project;
      if (filters.date) {
        params.from = filters.date;
        params.to = filters.date;
      }

      const response = await API.get("/maintenance", { params });

      setRecords(response.data?.data || []);
      setTotal(response.data?.total || 0);
      setPages(response.data?.pages || 1);
    } catch (loadError) {
      setRecords([]);
      setError(
        loadError.response?.data?.message ||
          "Could not load maintenance records. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      try {
        const response = await API.get("/maintenance/options");

        if (active) setOptions(response.data?.data || {});
      } catch (optionsError) {
        console.error(
          "Failed to fetch maintenance options:",
          optionsError
        );

        if (active) {
          pushToast(
            optionsError.response?.data?.message ||
              "Could not load projects, equipment and workers",
            "error"
          );
        }
      }
    };

    loadOptions();
    loadSummary();

    return () => {
      active = false;
    };
    // Runs once on mount - filters do not affect reference data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const openCreateForm = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEditForm = (record) => {
    setEditing(record);
    setFormOpen(true);
  };

  // Refresh the grid and the summary cards after a write
  const handleSaved = () => {
    loadRecords();
    loadSummary();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    try {
      setDeleting(true);

      const response = await API.delete(
        `/maintenance/${pendingDelete._id}`
      );

      pushToast(
        response.data?.message ||
          "Maintenance record deleted",
        "success"
      );

      setPendingDelete(null);

      // Deleting the last row of a page would leave a blank
      // screen, so step back a page first.
      if (records.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        loadRecords();
      }

      loadSummary();
    } catch (deleteError) {
      pushToast(
        deleteError.response?.data?.message ||
          "Failed to delete maintenance record",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <div className="welcome-section mnt-header">
        <div>
          <h1>Maintenance Scheduling</h1>
          <p>
            Plan, assign and track equipment and site maintenance.
          </p>
        </div>

        {canCreate ? (
          <button
            type="button"
            className="mnt-btn mnt-btn-primary"
            onClick={openCreateForm}
          >
            <Plus size={16} aria-hidden="true" />
            Schedule Maintenance
          </button>
        ) : null}
      </div>

      <div className="stats-grid">
        <StatCard
          title="SCHEDULED"
          value={String(summary?.scheduled ?? 0)}
          change="Upcoming jobs"
          type="pending"
        />
        <StatCard
          title="IN PROGRESS"
          value={String(summary?.inProgress ?? 0)}
          change="Being serviced"
          type="active"
        />
        <StatCard
          title="COMPLETED"
          value={String(summary?.completed ?? 0)}
          change="Closed out"
          type="projects"
        />
        <StatCard
          title="OVERDUE"
          value={String(summary?.overdue ?? 0)}
          change="Past schedule"
          type="alerts"
        />
        <StatCard
          title="CRITICAL"
          value={String(summary?.critical ?? 0)}
          change="Open critical"
          type="users"
        />
      </div>

      <div className="dashboard-card mnt-card">
        <div className="card-header">
          <div className="mnt-card-title">
            <Wrench size={18} color="#d97706" aria-hidden="true" />
            <h3>Maintenance Register</h3>
          </div>

          <span className="mnt-card-caption">
            {loading
              ? "Loading…"
              : `${total} record${total === 1 ? "" : "s"}`}
          </span>
        </div>

        <div className="mnt-toolbar">
          <div className="search-box mnt-search">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search task, ID, project, equipment or worker"
              aria-label="Search maintenance"
            />
          </div>

          <select
            className="mnt-select"
            value={filters.status}
            onChange={(event) =>
              handleFilterChange("status", event.target.value)
            }
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className="mnt-select"
            value={filters.priority}
            onChange={(event) =>
              handleFilterChange("priority", event.target.value)
            }
            aria-label="Filter by priority"
          >
            <option value="">All priorities</option>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          <select
            className="mnt-select"
            value={filters.maintenanceType}
            onChange={(event) =>
              handleFilterChange(
                "maintenanceType",
                event.target.value
              )
            }
            aria-label="Filter by maintenance type"
          >
            <option value="">All types</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            className="mnt-select"
            value={filters.project}
            onChange={(event) =>
              handleFilterChange("project", event.target.value)
            }
            aria-label="Filter by project"
          >
            <option value="">All projects</option>
            {(options.projects || []).map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>

          <div className="mnt-date-filter">
            <CalendarClock
              size={14}
              aria-hidden="true"
            />
            <input
              type="date"
              value={filters.date}
              onChange={(event) =>
                handleFilterChange("date", event.target.value)
              }
              aria-label="Filter by scheduled date"
            />
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              className="mnt-btn mnt-btn-ghost mnt-btn-sm"
              onClick={clearFilters}
            >
              <RotateCcw size={13} aria-hidden="true" />
              Clear
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="mnt-skeleton-list" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="mnt-skeleton" key={index}>
                <span />
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mnt-state mnt-state-error">
            <TriangleAlert size={22} aria-hidden="true" />
            <strong>{error}</strong>
            <button
              type="button"
              className="mnt-btn mnt-btn-ghost mnt-btn-sm"
              onClick={loadRecords}
            >
              Retry
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="mnt-state">
            <Filter size={22} aria-hidden="true" />
            <strong>
              {hasActiveFilters
                ? "No maintenance matches these filters"
                : "No maintenance scheduled yet"}
            </strong>
            <span>
              {hasActiveFilters
                ? "Try a different search term or clear the filters."
                : "Schedule the first equipment or site maintenance job to get started."}
            </span>

            {hasActiveFilters ? (
              <button
                type="button"
                className="mnt-btn mnt-btn-ghost mnt-btn-sm"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            ) : canCreate ? (
              <button
                type="button"
                className="mnt-btn mnt-btn-primary mnt-btn-sm"
                onClick={openCreateForm}
              >
                <Plus size={14} aria-hidden="true" />
                Schedule Maintenance
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mnt-table" role="table">
              <div className="mnt-table-head" role="row">
                <span role="columnheader">ID</span>
                <span role="columnheader">Maintenance Task</span>
                <span role="columnheader">Project / Site</span>
                <span role="columnheader">Assigned To</span>
                <span role="columnheader">Scheduled</span>
                <span role="columnheader">Priority</span>
                <span role="columnheader">Status</span>
                <span role="columnheader">Last Updated</span>
                <span role="columnheader">Actions</span>
              </div>

              {records.map((record) => (
                <div
                  className="mnt-row"
                  key={record._id}
                  role="row"
                >
                  <span
                    className="mnt-id"
                    data-label="ID"
                    role="cell"
                  >
                    {record.maintenanceId}
                  </span>

                  <div
                    className="mnt-cell-task"
                    data-label="Maintenance Task"
                    role="cell"
                  >
                    <strong>{record.title}</strong>
                    <span className="mnt-cell-meta">
                      <TypeChip
                        type={record.maintenanceType}
                      />
                      <span className="mnt-cell-sub">
                        {equipmentLabel(record.equipment)}
                      </span>
                    </span>
                  </div>

                  <div data-label="Project / Site" role="cell">
                    <strong className="mnt-cell-strong">
                      {projectLabel(record.project)}
                    </strong>
                    <span className="mnt-cell-sub">
                      {record.project?.location ||
                        record.project?.code ||
                        "--"}
                    </span>
                  </div>

                  <div data-label="Assigned To" role="cell">
                    <strong className="mnt-cell-strong">
                      {record.assignedTo?.name || "Unassigned"}
                    </strong>
                    <span className="mnt-cell-sub">
                      {roleLabel(record.assignedTo?.role) || "--"}
                    </span>
                  </div>

                  <div data-label="Scheduled" role="cell">
                    <strong className="mnt-cell-strong">
                      {formatDate(record.scheduledDate)}
                    </strong>
                    <span className="mnt-cell-sub">
                      {record.scheduledTime
                        ? formatTime(record.scheduledTime)
                        : "All day"}
                    </span>
                  </div>

                  <div data-label="Priority" role="cell">
                    <PriorityBadge priority={record.priority} />
                  </div>

                  <div data-label="Status" role="cell">
                    <StatusBadge status={record.status} />
                  </div>

                  <div data-label="Last Updated" role="cell">
                    <span className="mnt-cell-sub">
                      {formatRelativeTime(record.updatedAt)}
                    </span>
                  </div>

                  <div
                    className="mnt-cell-actions"
                    data-label="Actions"
                    role="cell"
                  >
                    <button
                      type="button"
                      className="mnt-icon-btn"
                      onClick={() =>
                        navigate(`${basePath}/${record._id}`)
                      }
                      aria-label={`View ${record.maintenanceId}`}
                      title="View"
                    >
                      <Eye size={15} />
                    </button>

                    {canEditMaintenanceRecord(record) ? (
                      <button
                        type="button"
                        className="mnt-icon-btn"
                        onClick={() => openEditForm(record)}
                        aria-label={`Edit ${record.maintenanceId}`}
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                    ) : null}

                    {canDelete ? (
                      <button
                        type="button"
                        className="mnt-icon-btn danger"
                        onClick={() => setPendingDelete(record)}
                        aria-label={`Delete ${record.maintenanceId}`}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="mnt-pagination">
              <span>
                Showing {rangeStart}-{rangeEnd} of {total}
              </span>

              <div className="mnt-pagination-actions">
                <button
                  type="button"
                  className="mnt-btn mnt-btn-ghost mnt-btn-sm"
                  onClick={() =>
                    setPage((current) => Math.max(current - 1, 1))
                  }
                  disabled={page <= 1}
                >
                  Previous
                </button>

                <span className="mnt-pagination-page">
                  Page {page} of {pages}
                </span>

                <button
                  type="button"
                  className="mnt-btn mnt-btn-ghost mnt-btn-sm"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(current + 1, pages)
                    )
                  }
                  disabled={page >= pages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <MaintenanceFormModal
        open={formOpen}
        record={editing}
        options={options}
        notify={pushToast}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete maintenance record"
        message={
          pendingDelete
            ? `${pendingDelete.maintenanceId} - ${pendingDelete.title} will be permanently removed.`
            : ""
        }
        confirmLabel="Delete record"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export default MaintenanceList;
