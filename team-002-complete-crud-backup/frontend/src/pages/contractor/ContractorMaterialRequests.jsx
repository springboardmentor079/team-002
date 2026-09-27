import { useState, useEffect } from "react";
import { Package, Plus, CheckCircle2, Clock, Truck } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import StatCard from "../../components/dashboard/StatCard";

function ContractorMaterialRequests() {
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

  const isAuthorized = canEdit("material_requests");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/materials");
      if (res.data?.data) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error(err);
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

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Material Requisitions & Orders 📦</h1>
          <p>Order raw materials, track dispatch transit statuses, and confirm site batch arrivals.</p>
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
            <Plus size={16} /> Request Materials
          </button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard title="TOTAL REQUISITIONS" value={String(requests.length)} change="Live" type="projects" />
        <StatCard
          title="PENDING APPROVAL"
          value={String(requests.filter((r) => r.status === "Pending Approval").length)}
          change="Awaiting review"
          type="pending"
        />
        <StatCard
          title="IN TRANSIT"
          value={String(requests.filter((r) => r.status === "In Transit").length)}
          change="Live"
          type="alerts"
        />
        <StatCard
          title="DELIVERED TODAY"
          value={String(requests.filter((r) => r.status === "Delivered" || r.status === "Approved").length)}
          change="Verified"
          type="active"
        />
        <StatCard title="SUPPLY ACCURACY" value="0%" change="No data" type="users" />
      </div>

      <div className="dashboard-card material-requests-card" style={{ maxWidth: "800px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Package size={18} color="#10b981" />
            <h3>Live Material Requisitions</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Live Requisitions</span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading requisitions...</div>
        ) : (
          <div className="material-req-list">
            {requests.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No material requests available.</div>
            ) : (
              requests.map((item) => {
                const Icon =
                  item.status === "In Transit"
                    ? Truck
                    : item.status === "Pending Approval"
                    ? Clock
                    : CheckCircle2;

                return (
                  <div className="material-req-item" key={item._id}>
                    <div className="req-col-main">
                      <div className="req-title-row">
                        <span className="req-id">{item.reqId}</span>
                        <strong>{item.material}</strong>
                      </div>
                      <span className="req-meta">
                        Qty: {item.quantity} • Category: {item.category} • {item.date}
                      </span>
                    </div>

                    <span className={`req-badge ${item.badge || "warning"}`}>
                      <Icon size={12} />
                      {item.status}
                    </span>
                  </div>
                );
              })
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
            <h3 style={{ margin: "0 0 16px" }}>New Material Request</h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Material Required</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OPC 53 Grade Cement"
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
                    placeholder="e.g. 500 Bags"
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

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className="date-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#d97706", color: "#ffffff", border: "none" }}>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ContractorMaterialRequests;
