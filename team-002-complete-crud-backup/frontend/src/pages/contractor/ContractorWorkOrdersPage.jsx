import { useState, useEffect } from "react";
import { ClipboardList, Plus, Edit2, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import StatCard from "../../components/dashboard/StatCard";

function ContractorWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const isAuthorized = canEdit("work_orders");

  const uniqueLeads = new Set(workOrders.map((w) => w.lead).filter(Boolean)).size;
  const avgCompletion =
    workOrders.length > 0
      ? Math.round(workOrders.reduce((t, w) => t + (Number(w.progress) || 0), 0) / workOrders.length)
      : 0;

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/work-orders");
      if (res.data?.data) {
        setWorkOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
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
      lead: "",
      deadline: "",
      progress: 10,
      status: "In Progress",
      zone: "",
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
    try {
      if (editingOrder) {
        await API.put(`/work-orders/${editingOrder._id}`, formData);
      } else {
        await API.post("/work-orders", formData);
      }
      setShowModal(false);
      fetchWorkOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete work order?")) return;
    try {
      await API.delete(`/work-orders/${id}`);
      fetchWorkOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
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
