import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CalendarRange,
  Eye,
  Filter,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  TriangleAlert,
  Wallet,
} from "lucide-react";

import API from "../../services/api";
import Toast from "../../components/common/Toast";
import StatCard from "../../components/dashboard/StatCard";
import ConfirmDialog from "../../components/payroll/ConfirmDialog";
import PayrollFormModal from "../../components/payroll/PayrollFormModal";
import {
  MethodChip,
  OutstandingChip,
  PaymentStatusBadge,
} from "../../components/payroll/PayrollBadges";

import {
  PAYMENT_STATUSES,
  canCreatePayroll,
  canDeletePayroll,
  canViewPayroll,
  employeeLabel,
  formatCount,
  formatDate,
  formatMoney,
  isCaptured,
  payPeriodLabel,
  projectLabel,
  roleLabel,
} from "../../utils/payroll";
import { useToasts } from "../../utils/toast";

import "../../styles/payroll.css";

const EMPTY_FILTERS = {
  search: "",
  status: "",
  payPeriod: "",
  employee: "",
  project: "",
  from: "",
  to: "",
};

const PAGE_SIZE = 10;

// The payroll register. Every figure on this screen is read from
// the payroll collection in MongoDB through /api/payroll - there is
// no client-side rate, no derived wage and no sample register.
function PayrollList({ basePath = "/admin/payroll" }) {
  const navigate = useNavigate();
  const { toasts, pushToast, dismissToast } = useToasts();

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const canCreate = canCreatePayroll();
  const canDelete = canDeletePayroll();

  const statusOptions = options.paymentStatuses?.length
    ? options.paymentStatuses
    : PAYMENT_STATUSES;

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
      const response = await API.get("/payroll/summary");
      setSummary(response.data?.data || null);
    } catch (summaryError) {
      console.error(
        "Failed to fetch payroll summary:",
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
      if (filters.payPeriod) params.payPeriod = filters.payPeriod;
      if (filters.employee) params.employee = filters.employee;
      if (filters.project) params.project = filters.project;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const response = await API.get("/payroll", { params });

      setRecords(response.data?.data || []);
      setTotal(response.data?.total || 0);
      setPages(response.data?.pages || 1);
    } catch (loadError) {
      setRecords([]);
      setError(
        loadError.response?.data?.message ||
          "Could not load payroll records. Please try again."
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
        const response = await API.get("/payroll/options");

        if (active) setOptions(response.data?.data || {});
      } catch (optionsError) {
        console.error(
          "Failed to fetch payroll options:",
          optionsError
        );

        if (active) {
          pushToast(
            optionsError.response?.data?.message ||
              "Could not load workers and projects",
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
        `/payroll/${pendingDelete._id}`
      );

      pushToast(
        response.data?.message || "Payroll record deleted",
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
          "Failed to delete payroll record",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  // The API is the authority on who may see payroll. If the stored
  // role is not on the read list, the routes would answer 403, so
  // the page says so plainly instead of firing requests that cannot
  // succeed.
  if (!canViewPayroll()) {
    return (
      <div className="dashboard-card">
        <div className="pay-state pay-state-error">
          <TriangleAlert size={22} aria-hidden="true" />
          <strong>You do not have access to payroll</strong>
          <span>
            Payroll monitoring is limited to admins, project managers
            and the worker the payslip belongs to.
          </span>

          <div className="pay-state-actions">
            <button
              type="button"
              className="pay-btn pay-btn-ghost pay-btn-sm"
              onClick={() => navigate(-1)}
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="welcome-section pay-header">
        <div>
          <h1>Payroll Monitoring</h1>
          <p>
            Track pay runs, disbursement status and outstanding
            amounts against the payroll register.
          </p>
        </div>

        {canCreate ? (
          <button
            type="button"
            className="pay-btn pay-btn-primary"
            onClick={openCreateForm}
          >
            <Plus size={16} aria-hidden="true" />
            Raise Payroll
          </button>
        ) : null}
      </div>

      <div className="stats-grid">
        <StatCard
          title="PAY RUNS"
          value={formatCount(summary?.total)}
          change={`${formatCount(
            summary?.onRegister
          )} worker${summary?.onRegister === 1 ? "" : "s"} on register`}
          type="active"
        />
        <StatCard
          title="NET PAYABLE"
          value={formatMoney(summary?.totalNet)}
          change={`Gross ${formatMoney(summary?.totalGross)}`}
          type="projects"
        />
        <StatCard
          title="OUTSTANDING"
          value={formatCount(summary?.pending)}
          change={formatMoney(summary?.pendingAmount)}
          type="alerts"
        />
        <StatCard
          title="PROCESSING"
          value={formatCount(summary?.processing)}
          change="Runs in transit"
          type="pending"
        />
        <StatCard
          title="PAID"
          value={formatCount(summary?.paid)}
          change={formatMoney(summary?.paidAmount)}
          type="users"
        />
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div className="pay-card-title">
            <Wallet size={18} color="#d97706" aria-hidden="true" />
            <h3>Payroll Register</h3>
          </div>

          <span className="pay-card-caption">
            {loading
              ? "Loading…"
              : `${total} run${total === 1 ? "" : "s"}`}
          </span>
        </div>

        <div className="pay-toolbar">
          <div className="search-box pay-search">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search payroll ID, worker, project, period or reference"
              aria-label="Search payroll"
            />
          </div>

          <select
            className="pay-select"
            value={filters.status}
            onChange={(event) =>
              handleFilterChange("status", event.target.value)
            }
            aria-label="Filter by payment status"
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className="pay-select"
            value={filters.payPeriod}
            onChange={(event) =>
              handleFilterChange("payPeriod", event.target.value)
            }
            aria-label="Filter by pay period"
          >
            <option value="">All pay periods</option>
            {(options.payPeriods || []).map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>

          <select
            className="pay-select"
            value={filters.employee}
            onChange={(event) =>
              handleFilterChange("employee", event.target.value)
            }
            aria-label="Filter by worker"
          >
            <option value="">All workers</option>
            {(options.employees || []).map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>

          <select
            className="pay-select"
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

          <div className="pay-date-filter">
            <CalendarRange size={14} aria-hidden="true" />
            <input
              type="date"
              value={filters.from}
              onChange={(event) =>
                handleFilterChange("from", event.target.value)
              }
              aria-label="Filter from period end date"
            />
          </div>

          <div className="pay-date-filter">
            <CalendarRange size={14} aria-hidden="true" />
            <input
              type="date"
              value={filters.to}
              onChange={(event) =>
                handleFilterChange("to", event.target.value)
              }
              aria-label="Filter to period start date"
            />
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              className="pay-btn pay-btn-ghost pay-btn-sm"
              onClick={clearFilters}
            >
              <RotateCcw size={13} aria-hidden="true" />
              Clear
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="pay-skeleton-list" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="pay-skeleton" key={index}>
                <span />
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="pay-state pay-state-error">
            <TriangleAlert size={22} aria-hidden="true" />
            <strong>{error}</strong>
            <button
              type="button"
              className="pay-btn pay-btn-ghost pay-btn-sm"
              onClick={loadRecords}
            >
              Retry
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="pay-state">
            <Filter size={22} aria-hidden="true" />
            <strong>
              {hasActiveFilters
                ? "No payroll runs match these filters"
                : "No payroll runs recorded yet"}
            </strong>
            <span>
              {hasActiveFilters
                ? "Try a different search term or clear the filters."
                : canCreate
                  ? "Raise the first pay run to start building the register."
                  : "Your payslips will appear here once a manager records them."}
            </span>

            {hasActiveFilters ? (
              <button
                type="button"
                className="pay-btn pay-btn-ghost pay-btn-sm"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            ) : canCreate ? (
              <button
                type="button"
                className="pay-btn pay-btn-primary pay-btn-sm"
                onClick={openCreateForm}
              >
                <Plus size={14} aria-hidden="true" />
                Raise Payroll
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="pay-table" role="table">
              <div className="pay-table-head" role="row">
                <span role="columnheader">ID</span>
                <span role="columnheader">Worker</span>
                <span role="columnheader">Project / Site</span>
                <span role="columnheader">Pay Period</span>
                <span role="columnheader">Net Pay</span>
                <span role="columnheader">Status</span>
                <span role="columnheader">Paid On</span>
                <span role="columnheader">Actions</span>
              </div>

              {records.map((record) => (
                <div
                  className="pay-row"
                  key={record._id}
                  role="row"
                >
                  <span
                    className="pay-id"
                    data-label="ID"
                    role="cell"
                  >
                    {record.payrollId}
                  </span>

                  <div data-label="Worker" role="cell">
                    <strong className="pay-cell-strong">
                      {employeeLabel(record.employee)}
                    </strong>
                    <span className="pay-cell-sub">
                      {roleLabel(record.employee?.role) ||
                        record.employee?.department ||
                        "--"}
                    </span>
                  </div>

                  <div data-label="Project / Site" role="cell">
                    <strong className="pay-cell-strong">
                      {projectLabel(record.project)}
                    </strong>
                    <span className="pay-cell-sub">
                      {record.project?.location ||
                        record.project?.code ||
                        "--"}
                    </span>
                  </div>

                  <div data-label="Pay Period" role="cell">
                    <strong className="pay-cell-strong">
                      {payPeriodLabel(record)}
                    </strong>
                    <span className="pay-cell-sub">
                      {record.periodStart && record.periodEnd
                        ? `${formatDate(
                            record.periodStart
                          )} - ${formatDate(record.periodEnd)}`
                        : "No date range set"}
                    </span>
                  </div>

                  <div data-label="Net Pay" role="cell">
                    <span
                      className={`pay-amount ${
                        isCaptured(record.netSalary)
                          ? "pay-amount-net"
                          : "pay-amount-muted"
                      }`}
                    >
                      {formatMoney(record.netSalary)}
                    </span>
                    <span className="pay-cell-sub">
                      {isCaptured(record.overtimeAmount)
                        ? `Incl. ${formatMoney(
                            record.overtimeAmount
                          )} overtime`
                        : "No overtime recorded"}
                    </span>
                  </div>

                  <div data-label="Status" role="cell">
                    <PaymentStatusBadge
                      status={record.paymentStatus}
                    />
                    {record.isOutstanding ? (
                      <span className="pay-cell-sub">
                        <OutstandingChip />
                      </span>
                    ) : null}
                  </div>

                  <div data-label="Paid On" role="cell">
                    <span className="pay-cell-sub">
                      {record.paymentDate
                        ? formatDate(record.paymentDate)
                        : "Not paid yet"}
                    </span>
                    <MethodChip method={record.paymentMethod} />
                  </div>

                  <div
                    className="pay-cell-actions"
                    data-label="Actions"
                    role="cell"
                  >
                    <button
                      type="button"
                      className="pay-icon-btn"
                      onClick={() =>
                        navigate(`${basePath}/${record._id}`)
                      }
                      aria-label={`View ${record.payrollId}`}
                      title="View"
                    >
                      <Eye size={15} />
                    </button>

                    {canCreate ? (
                      <button
                        type="button"
                        className="pay-icon-btn"
                        onClick={() => openEditForm(record)}
                        aria-label={`Edit ${record.payrollId}`}
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                    ) : null}

                    {canDelete ? (
                      <button
                        type="button"
                        className="pay-icon-btn danger"
                        onClick={() => setPendingDelete(record)}
                        aria-label={`Delete ${record.payrollId}`}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="pay-pagination">
              <span>
                Showing {rangeStart}-{rangeEnd} of {total}
              </span>

              <div className="pay-pagination-actions">
                <button
                  type="button"
                  className="pay-btn pay-btn-ghost pay-btn-sm"
                  onClick={() =>
                    setPage((current) => Math.max(current - 1, 1))
                  }
                  disabled={page <= 1}
                >
                  Previous
                </button>

                <span className="pay-pagination-page">
                  Page {page} of {pages}
                </span>

                <button
                  type="button"
                  className="pay-btn pay-btn-ghost pay-btn-sm"
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

      <PayrollFormModal
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
        title="Delete payroll record"
        message={
          pendingDelete
            ? `${pendingDelete.payrollId} for ${employeeLabel(
                pendingDelete.employee
              )} will be permanently removed.`
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

export default PayrollList;
