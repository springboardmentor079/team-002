import { useState, useEffect } from "react";
import { ShoppingCart, Plus, CheckCircle2, Clock, Truck, XCircle, Trash2 } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import StatCard from "../../components/dashboard/StatCard";

function AdminProcurement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    material: "",
    category: "Cement",
    quantity: "",
    site: "",
    notes: "",
  });

  const isAuthorized = canEdit("procurement");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/materials");
      if (res.data && res.data.data) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch procurement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/materials", formData);
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/materials/${id}/status`, { status });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this requisition?")) return;
    try {
      await API.delete(`/materials/${id}`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Procurement & Material Requisitions 🛒</h1>
          <p>Purchase orders, contractor material requisitions, supplier dispatches, and delivery sign-offs.</p>
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
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> New Requisition
          </button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard title="TOTAL REQUISITIONS" value={String(requests.length)} change="Tracked" type="projects" />
        <StatCard
          title="PENDING APPROVAL"
          value={String(requests.filter((r) => r.status === "Pending Approval").length)}
          change="Urgent"
          type="pending"
        />
        <StatCard
          title="APPROVED & IN TRANSIT"
          value={String(requests.filter((r) => r.status === "Approved" || r.status === "In Transit").length)}
          change="Dispatching"
          type="active"
        />
        <StatCard
          title="DELIVERED THIS WEEK"
          value={String(requests.filter((r) => r.status === "Delivered").length)}
          change="Verified"
          type="users"
        />
        <StatCard title="PO BUDGET UTILIZED" value="₹ 0" change="Not tracked" type="alerts" />
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingCart size={18} color="#d97706" />
            <h3>Purchase Requisitions & Orders</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Live PO Tracker</span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Loading requisitions...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                  <th style={{ padding: "10px" }}>REQ ID</th>
                  <th style={{ padding: "10px" }}>Material Name</th>
                  <th style={{ padding: "10px" }}>Category</th>
                  <th style={{ padding: "10px" }}>Quantity</th>
                  <th style={{ padding: "10px" }}>Requested By</th>
                  <th style={{ padding: "10px" }}>Status</th>
                  {isAuthorized && <th style={{ padding: "10px" }}>Approval Actions</th>}
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                      No material requisitions available.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                  <tr key={req._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 10px", fontWeight: 700, color: "#3b82f6" }}>{req.reqId}</td>
                    <td style={{ padding: "12px 10px", fontWeight: 600, color: "#1e293b" }}>{req.material}</td>
                    <td style={{ padding: "12px 10px", color: "#64748b" }}>{req.category}</td>
                    <td style={{ padding: "12px 10px", color: "#1e293b" }}>{req.quantity}</td>
                    <td style={{ padding: "12px 10px", color: "#64748b" }}>{req.requestedBy}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span className={`status-pill ${req.badge || "warning"}`}>{req.status}</span>
                    </td>
                    {isAuthorized && (
                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          {req.status === "Pending Approval" && (
                            <button
                              className="menu-item"
                              style={{ width: "auto", height: "26px", padding: "0 8px", background: "#ecfdf5", color: "#059669" }}
                              onClick={() => handleStatusUpdate(req._id, "Approved")}
                            >
                              Approve
                            </button>
                          )}
                          {req.status === "Approved" && (
                            <button
                              className="menu-item"
                              style={{ width: "auto", height: "26px", padding: "0 8px", background: "#eff6ff", color: "#2563eb" }}
                              onClick={() => handleStatusUpdate(req._id, "In Transit")}
                            >
                              Dispatch
                            </button>
                          )}
                          {req.status === "In Transit" && (
                            <button
                              className="menu-item"
                              style={{ width: "auto", height: "26px", padding: "0 8px", background: "#ecfdf5", color: "#059669" }}
                              onClick={() => handleStatusUpdate(req._id, "Delivered")}
                            >
                              Delivered
                            </button>
                          )}
                          <button
                            className="menu-item"
                            style={{ width: "auto", height: "26px", padding: "0 6px", color: "#ef4444" }}
                            onClick={() => handleDelete(req._id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                  ))
                )}
              </tbody>
            </table>
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
            <h3 style={{ margin: "0 0 16px" }}>New Material Requisition</h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Material Required</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ready-Mix Concrete M25"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b" }}>Quantity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50 m³"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b" }}>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Worksite Zone</label>
                <input
                  type="text"
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button type="button" className="date-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#d97706", color: "#ffffff", border: "none" }}>
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminProcurement;
