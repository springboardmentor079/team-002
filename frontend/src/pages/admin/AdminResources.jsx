import { useState, useEffect } from "react";
import { Truck, Plus, CheckCircle2, Wrench, Clock, Trash2 } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import StatCard from "../../components/dashboard/StatCard";

const DEFAULT_EQUIPMENT = [
  {
    _id: "eq-1",
    name: "Tower Crane #1 (Potain)",
    type: "Crane",
    status: "Operational",
    operator: "Rajesh S.",
    location: "Central Core Tower",
    badge: "status-operational",
    nextMaintenanceDate: "15 Oct 2026",
    maintenanceNotes: "Regular cable inspection and counterweight check",
  },
  {
    _id: "eq-2",
    name: "CAT Excavator 320",
    type: "Excavator",
    status: "In Use",
    operator: "Harpreet Singh",
    location: "East Foundation Trench",
    badge: "status-operational",
    nextMaintenanceDate: "20 Oct 2026",
    maintenanceNotes: "Hydraulic pressure testing scheduled",
  },
  {
    _id: "eq-3",
    name: "Transit Mixer 8m³",
    type: "Concrete Mixer",
    status: "Scheduled Delivery",
    operator: "Vikas Verma",
    location: "Batching Plant #2",
    badge: "status-scheduled",
    nextMaintenanceDate: "12 Nov 2026",
    maintenanceNotes: "Drum gear oil replacement",
  },
  {
    _id: "eq-4",
    name: "Tipper Truck #4 (Tata)",
    type: "Dump Truck",
    status: "Maintenance",
    operator: "Workshop",
    location: "Service Bay B",
    badge: "status-maintenance",
    nextMaintenanceDate: "05 Oct 2026",
    maintenanceNotes: "Brake lining and suspension service",
  },
  {
    _id: "eq-5",
    name: "Diesel Generator 125kVA",
    type: "Generator",
    status: "Standby",
    operator: "Site Crew",
    location: "Power Substation 1",
    badge: "status-scheduled",
    nextMaintenanceDate: "28 Oct 2026",
    maintenanceNotes: "Filter change and load test",
  },
];

function AdminResources() {
  const [equipment, setEquipment] = useState(DEFAULT_EQUIPMENT);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedEq, setSelectedEq] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState({
    nextMaintenanceDate: "15 Nov 2026",
    servicedBy: "Heavy Rig Services Ltd",
    maintenanceNotes: "Quarterly hydraulic fluid and pressure seal replacement",
    cost: "₹ 18,500",
  });
  const [formData, setFormData] = useState({
    name: "",
    type: "Crane",
    status: "Operational",
    operator: "Site Crew",
    location: "Central Yard",
  });

  const isAuthorized = true; // Admin always has full access

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const res = await API.get("/equipment");
      if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setEquipment(res.data.data);
      }
    } catch (err) {
      console.warn("Could not fetch remote equipment, using fallback data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const newEq = {
      _id: "eq-" + Date.now(),
      name: formData.name,
      type: formData.type,
      status: formData.status || "Operational",
      operator: formData.operator || "Site Crew",
      location: formData.location || "Central Yard",
      badge: formData.status === "Maintenance" ? "status-maintenance" : "status-operational",
      nextMaintenanceDate: "15 Dec 2026",
      maintenanceNotes: "Routine commissioning test",
    };

    // Update state immediately so UI updates with zero delay
    setEquipment((prev) => [newEq, ...prev]);
    setShowModal(false);

    try {
      const res = await API.post("/equipment", formData);
      if (res.data?.data) {
        setEquipment((prev) => [res.data.data, ...prev.filter((item) => item._id !== newEq._id)]);
      }
    } catch (err) {
      console.warn("Equipment saved locally:", err.message);
    }
  };

  const handleOpenMaintenance = (item) => {
    setSelectedEq(item);
    setMaintenanceData({
      nextMaintenanceDate: item.nextMaintenanceDate || "15 Nov 2026",
      servicedBy: "Heavy Rig Services Ltd",
      maintenanceNotes: item.maintenanceNotes || "Quarterly hydraulic fluid and pressure seal replacement",
      cost: "₹ 18,500",
    });
    setShowMaintenanceModal(true);
  };

  const handleScheduleMaintenance = async (e) => {
    e.preventDefault();
    if (!selectedEq) return;

    // Immediately update machinery in UI
    setEquipment((prev) =>
      prev.map((item) =>
        item._id === selectedEq._id
          ? {
              ...item,
              status: "Maintenance",
              badge: "status-maintenance",
              nextMaintenanceDate: maintenanceData.nextMaintenanceDate,
              maintenanceNotes: maintenanceData.maintenanceNotes,
            }
          : item
      )
    );
    setShowMaintenanceModal(false);

    try {
      await API.post(`/equipment/${selectedEq._id}/maintenance`, maintenanceData);
    } catch (err) {
      console.warn("Maintenance recorded locally:", err.message);
    }
    alert("Maintenance successfully scheduled!");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this machinery unit?")) return;
    setEquipment((prev) => prev.filter((item) => item._id !== id));
    try {
      await API.delete(`/equipment/${id}`);
    } catch (err) {
      console.warn("Machinery deleted locally:", err.message);
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
                    <span style={{ fontSize: "11px", color: "#d97706", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                      <Clock size={11} /> Next Service: {item.nextMaintenanceDate || "15 Nov 2026"}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className={`equipment-badge ${item.badge || "status-operational"}`}>
                      <Icon size={12} />
                      {item.status}
                    </span>

                    {isAuthorized && (
                      <button
                        className="date-button"
                        style={{ padding: "4px 8px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
                        onClick={() => handleOpenMaintenance(item)}
                        title="Schedule Maintenance"
                      >
                        <Wrench size={12} /> Service
                      </button>
                    )}

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

      {showMaintenanceModal && selectedEq && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="dashboard-card" style={{ width: "420px", background: "#ffffff" }}>
            <h3 style={{ margin: "0 0 4px" }}>Schedule Machinery Maintenance</h3>
            <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#64748b" }}>
              {selectedEq.name} ({selectedEq.type})
            </p>
            <form onSubmit={handleScheduleMaintenance} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Next Service / Inspection Date</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20 Nov 2026"
                  value={maintenanceData.nextMaintenanceDate}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, nextMaintenanceDate: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Certified Technician / Service Vendor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAT Certified Tech / Site Crew"
                  value={maintenanceData.servicedBy}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, servicedBy: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Estimated Service Cost</label>
                <input
                  type="text"
                  placeholder="e.g. ₹ 25,000"
                  value={maintenanceData.cost}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, cost: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Maintenance Scope / Notes</label>
                <textarea
                  rows="3"
                  placeholder="Oil change, boom inspection, brake pad replacement..."
                  value={maintenanceData.maintenanceNotes}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, maintenanceNotes: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button type="button" className="date-button" onClick={() => setShowMaintenanceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#2563eb", color: "#ffffff", border: "none" }}>
                  Schedule Service
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
