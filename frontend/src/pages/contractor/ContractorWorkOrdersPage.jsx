import { useState, useEffect } from "react";
import { ClipboardList, Plus, Edit2, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import StatCard from "../../components/dashboard/StatCard";

const DEFAULT_WORK_ORDERS = [
  {
    _id: "wo-1",
    orderId: "WO-2026-081",
    title: "RCC Frame Casting - Block C",
    lead: "Amit Sharma",
    trade: "Structural & Masons",
    progress: 82,
    deadline: "12 Mar 2026",
    status: "On Schedule",
    statusClass: "good",
    zone: "Block C Core",
  },
  {
    _id: "wo-2",
    orderId: "WO-2026-089",
    title: "Brick Masonry & Plastering",
    lead: "Sunil Rawat",
    trade: "Finishing & Masonry",
    progress: 45,
    deadline: "25 Mar 2026",
    status: "In Progress",
    statusClass: "warning",
    zone: "Tower A - Floor 4",
  },
  {
    _id: "wo-3",
    orderId: "WO-2026-092",
    title: "External Drainage Pipeline",
    lead: "Karan Patel",
    trade: "Plumbing & Earthwork",
    progress: 25,
    deadline: "05 Apr 2026",
    status: "Delayed",
    statusClass: "danger",
    zone: "Perimeter Trench",
  },
  {
    _id: "wo-4",
    orderId: "WO-2026-095",
    title: "Internal Electrical Conduit Laying",
    lead: "Manish Kumar",
    trade: "Electrical MEP",
    progress: 60,
    deadline: "18 Apr 2026",
    status: "On Schedule",
    statusClass: "good",
    zone: "Floors 5 to 8",
  },
];

function ContractorWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState(DEFAULT_WORK_ORDERS);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    trade: "RCC Frame Casting",
    lead: "",
    deadline: "",
    progress: 50,
    status: "In Progress",
    zone: "",
  });

  const isAuthorized = true; // Full contractor access

  const uniqueLeads = new Set(workOrders.map((w) => w.lead).filter(Boolean)).size;
  const avgCompletion =
    workOrders.length > 0
      ? Math.round(workOrders.reduce((t, w) => t + (Number(w.progress) || 0), 0) / workOrders.length)
      : 0;

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/work-orders");
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setWorkOrders(res.data.data);
      }
    } catch (err) {
      console.warn("Could not fetch remote work orders, using fallback records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handleOpenAdd = () => {
    setEditingOrder(null);
    setFormData({
      title: "",
      trade: "RCC Frame Casting",
      lead: "Amit Sharma",
      deadline: "20 Oct 2026",
      progress: 20,
      status: "In Progress",
      zone: "Block B - Floor 2",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (wo) => {
    setEditingOrder(wo);
    setFormData({
      title: wo.title,
      trade: wo.trade,
      lead: wo.lead,
      deadline: wo.deadline,
      progress: wo.progress,
      status: wo.status,
      zone: wo.zone,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const statusClass =
      formData.status === "On Schedule" || formData.status === "Completed"
        ? "good"
        : formData.status === "Delayed"
        ? "danger"
        : "warning";

    if (editingOrder) {
      const updated = { ...editingOrder, ...formData, statusClass };
      setWorkOrders((prev) => prev.map((w) => (w._id === editingOrder._id ? updated : w)));
      setShowModal(false);
      try {
        await API.put(`/work-orders/${editingOrder._id}`, formData);
      } catch (err) {
        console.warn("Work order updated locally:", err.message);
      }
    } else {
      const newWO = {
        _id: "wo-" + Date.now(),
        orderId: "WO-2026-" + Math.floor(100 + Math.random() * 900),
        ...formData,
        statusClass,
      };
      setWorkOrders((prev) => [newWO, ...prev]);
      setShowModal(false);
      try {
        const res = await API.post("/work-orders", formData);
        if (res.data?.data) {
          setWorkOrders((prev) => [res.data.data, ...prev.filter((w) => w._id !== newWO._id)]);
        }
      } catch (err) {
        console.warn("Work order created locally:", err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete work order?")) return;
    setWorkOrders((prev) => prev.filter((w) => w._id !== id));
    try {
      await API.delete(`/work-orders/${id}`);
    } catch (err) {
      console.warn("Work order removed locally:", err.message);
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Contractor Work Orders 📋</h1>
          <p>Package execution status, milestone progress, subcontractor leads, and daily task completion.</p>
        </div>
        {isAuthorized && (
          <button
            className="date-button"
            style={{
              background: "#d97706",
              color: "#ffffff",
              border: "none",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onClick={handleOpenAdd}
          >
            <Plus size={16} /> New Work Order
          </button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard title="TOTAL WORK PACKAGES" value={String(workOrders.length)} change="Active" type="projects" />
        <StatCard
          title="ON SCHEDULE"
          value={String(workOrders.filter((w) => w.status === "On Schedule").length)}
          change="Live"
          type="active"
        />
        <StatCard
          title="DELAYED PACKAGES"
          value={String(workOrders.filter((w) => w.status === "Delayed").length)}
          change="Action needed"
          type="alerts"
        />
        <StatCard title="ASSIGNED LEADS" value={String(uniqueLeads)} change="Assigned" type="users" />
        <StatCard title="AVG COMPLETION" value={`${avgCompletion}%`} change="Across packages" type="pending" />
      </div>

      <div className="dashboard-card contractor-orders-card" style={{ maxWidth: "800px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ClipboardList size={18} color="#3b82f6" />
            <h3>Active Work Orders</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Live Progress Track</span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading work orders...</div>
        ) : (
          <div className="work-orders-list">
            {workOrders.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No work orders available.</div>
            ) : (
              workOrders.map((wo) => (
                <div className="work-order-row" key={wo._id}>
                  <div className="order-main">
                    <div className="order-title-wrap">
                      <span className="order-id">{wo.orderId}</span>
                      <strong>{wo.title}</strong>
                    </div>
                    <span className="order-meta">
                      Lead: {wo.lead} • Trade: {wo.trade} • Due: {wo.deadline}
                    </span>
                  </div>

                  <div className="order-progress-wrap" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div className="order-progress-bar">
                      <div className="order-progress-fill" style={{ width: `${wo.progress}%` }} />
                    </div>
                    <div className="order-status-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className={`order-status-badge ${wo.statusClass || "good"}`}>{wo.status}</span>
                      <span className="order-pct">{wo.progress}%</span>
                    </div>

                    {isAuthorized && (
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "4px" }}>
                        <button
                          className="menu-item"
                          style={{ width: "auto", height: "24px", padding: "0 6px", fontSize: "11px" }}
                          onClick={() => handleOpenEdit(wo)}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="menu-item"
                          style={{ width: "auto", height: "24px", padding: "0 6px", fontSize: "11px", color: "#ef4444" }}
                          onClick={() => handleDelete(wo._id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="dashboard-card" style={{ width: "380px" }}>
            <h3 style={{ margin: "0 0 16px" }}>{editingOrder ? "Edit Work Order" : "New Work Order"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Order Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Supervisor Lead</label>
                <input
                  type="text"
                  value={formData.lead}
                  onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b" }}>Progress %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#64748b" }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                  >
                    <option value="On Schedule">On Schedule</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button type="button" className="date-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#d97706", color: "#ffffff", border: "none" }}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ContractorWorkOrdersPage;
