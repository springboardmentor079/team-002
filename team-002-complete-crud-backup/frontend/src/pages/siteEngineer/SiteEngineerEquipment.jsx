import { useState, useEffect } from "react";
import { Truck, Plus, CheckCircle2, Wrench, Clock } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import StatCard from "../../components/dashboard/StatCard";

function SiteEngineerEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "Transit Mixer",
    operator: "Assigned Driver",
    location: "Site Yard A",
  });

  const isAuthorized = canEdit("equipment");

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const res = await API.get("/equipment");
      if (res.data?.data) {
        setEquipment(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      await API.post("/equipment", { ...formData, status: "Scheduled Delivery" });
      setShowModal(false);
      fetchEquipment();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Machinery & Equipment Status 🚜</h1>
          <p>Monitor on-site heavy machinery, fuel efficiency, telemetry, and requisition new tools.</p>
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
            <Plus size={16} /> Request Equipment
          </button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard title="MACHINERY ON SITE" value={String(equipment.length)} change="Units" type="projects" />
        <StatCard title="FLEET UPTIME" value="0%" change="No data" type="active" />
        <StatCard title="UNDER SERVICE" value="0 Units" change="No data" type="alerts" />
        <StatCard title="CRANE HOURS" value="0 hrs" change="No data" type="users" />
        <StatCard title="SCHEDULED DISPATCH" value="0 Units" change="No data" type="pending" />
      </div>

      <div className="dashboard-card equipment-card" style={{ maxWidth: "800px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Truck size={18} color="#3b82f6" />
            <h3>Equipment & Machinery Status</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Live Field Assets</span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading machinery...</div>
        ) : (
          <div className="machinery-list">
            {equipment.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No equipment available.</div>
            ) : (
            equipment.map((item) => {
              const Icon = item.status === "Maintenance" ? Wrench : item.status === "Scheduled Delivery" ? Clock : CheckCircle2;
              return (
                <div className="machinery-item" key={item._id}>
                  <div className="machinery-info">
                    <strong>{item.name}</strong>
                    <span className="machinery-type">
                      {item.type} • Op: {item.operator} • Loc: {item.location}
                    </span>
                  </div>

                  <span className={`equipment-badge ${item.badge || "status-operational"}`}>
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
            <h3 style={{ margin: "0 0 16px" }}>Requisition Machinery</h3>
            <form onSubmit={handleRequest} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Equipment Type / Model</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Concrete Transit Mixer 8m³"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Category</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Assigned Worksite</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" className="date-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#d97706", color: "#ffffff", border: "none" }}>
                  Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SiteEngineerEquipment;
