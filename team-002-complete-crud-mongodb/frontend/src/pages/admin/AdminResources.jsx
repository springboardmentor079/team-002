import { useState, useEffect } from "react";
import { Truck, Plus, CheckCircle2, Wrench, Clock, Trash2 } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import StatCard from "../../components/dashboard/StatCard";

function AdminResources() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "Crane",
    status: "Operational",
    operator: "Site Crew",
    location: "Central Yard",
  });

  const isAuthorized = canEdit("resources");

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const res = await API.get("/equipment");
      if (res.data && res.data.data) {
        setEquipment(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch equipment:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post("/equipment", formData);
      setShowModal(false);
      fetchEquipment();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add equipment");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this machinery unit?")) return;
    try {
      await API.delete(`/equipment/${id}`);
      fetchEquipment();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Heavy Machinery & Resources 🚜</h1>
          <p>Fleet allocation, operational health, maintenance cycles, and crane telemetry.</p>
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
            <Plus size={16} /> Add Equipment
          </button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard title="TOTAL FLEET" value={String(equipment.length)} change="Tracked" type="projects" />
        <StatCard
          title="OPERATIONAL"
          value={String(equipment.filter((e) => e.status === "Operational" || e.status === "In Use").length)}
          change="Active"
          type="active"
        />
        <StatCard
          title="UNDER MAINTENANCE"
          value={String(equipment.filter((e) => e.status === "Maintenance").length)}
          change="Maintenance"
          type="alerts"
        />
        <StatCard title="CERTIFIED OPERATORS" value="0" change="No data" type="users" />
        <StatCard title="FUEL EFFICIENCY" value="0%" change="No data" type="pending" />
      </div>

      <div className="dashboard-card" style={{ padding: "20px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Truck size={18} color="#3b82f6" />
            <h3>Machinery Fleet Inventory</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Live Machinery Roster</span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Loading machinery...</div>
        ) : (
          <div className="machinery-list">
            {equipment.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No machinery available.</div>
            ) : (
              equipment.map((item) => {
              const Icon =
                item.status === "Maintenance"
                  ? Wrench
                  : item.status === "Scheduled Delivery"
                  ? Clock
                  : CheckCircle2;

              return (
                <div className="machinery-item" key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="machinery-info">
                    <strong>{item.name}</strong>
                    <span className="machinery-type">
                      {item.type} • Op: {item.operator} • Loc: {item.location}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className={`equipment-badge ${item.badge || "status-operational"}`}>
                      <Icon size={12} />
                      {item.status}
                    </span>

                    {isAuthorized && (
                      <button
                        className="menu-item"
                        style={{ width: "auto", height: "28px", padding: "0 6px", color: "#ef4444" }}
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
              }))
            }
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
            <h3 style={{ margin: "0 0 16px" }}>Add New Equipment</h3>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Equipment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAT Excavator 320"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Category / Type</label>
                <input
                  type="text"
                  required
                  placeholder="Crane, Excavator, Mixer..."
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Assigned Operator</label>
                <input
                  type="text"
                  value={formData.operator}
                  onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
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
                  <option value="Operational">Operational</option>
                  <option value="In Use">In Use</option>
                  <option value="Scheduled Delivery">Scheduled Delivery</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Standby">Standby</option>
                </select>
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

export default AdminResources;
