import { useState, useEffect } from "react";
import { Truck, Plus, CheckCircle2, Wrench, Clock, Trash2 } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";

function PMResources() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    status: "Operational",
    operator: "",
    location: "",
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
      console.error(err);
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
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  return (
    <>
      <div className="pm-welcome-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Site Machinery & Equipment 🚜</h1>
          <p>Deploy cranes, earthmovers, and transit mixers across active sites.</p>
        </div>
        {isAuthorized && (
          <button
            className="pm-menu-item active"
            style={{ width: "auto", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} style={{ marginRight: "4px" }} /> Requisition Equipment
          </button>
        )}
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Truck size={18} color="#d97706" />
            <h3>Deployed Site Assets</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>{equipment.length} Units Active</span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading resources...</div>
        ) : (
          <div className="machinery-list">
            {equipment.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                No equipment available.
              </div>
            ) : (
            equipment.map((item) => (
              <div className="machinery-item" key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="machinery-info">
                  <strong>{item.name}</strong>
                  <span className="machinery-type">
                    {item.type} • Op: {item.operator} • Loc: {item.location}
                  </span>
                </div>
                <span className={`equipment-badge ${item.badge || "status-operational"}`}>{item.status}</span>
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
            <h3 style={{ margin: "0 0 16px" }}>Requisition Machinery</h3>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Equipment Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Category</label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
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

export default PMResources;
