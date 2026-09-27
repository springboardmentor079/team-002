import { useState, useEffect } from "react";
import { Package, Plus, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import StatCard from "../../components/dashboard/StatCard";

function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Cement & Aggregates",
    quantity: 0,
    unit: "Bags",
    minQuantity: 0,
    location: "Warehouse 1",
    unitPrice: "",
  });

  const isAuthorized = canEdit("inventory");

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await API.get("/inventory");
      if (res.data && res.data.data) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post("/inventory", formData);
      setShowModal(false);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add item");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inventory item?")) return;
    try {
      await API.delete(`/inventory/${id}`);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Materials & Stock Inventory 📦</h1>
          <p>Real-time warehouse inventory, unit consumption, reorder thresholds, and stock valuation.</p>
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
            <Plus size={16} /> Add Material
          </button>
        )}
      </div>

      <div className="stats-grid">
        <StatCard title="TOTAL STOCK ITEMS" value={String(items.length)} change="Tracked" type="projects" />
        <StatCard
          title="LOW STOCK ALERTS"
          value={String(items.filter((i) => i.status === "Low Stock" || i.status === "Out of Stock").length)}
          change="Action required"
          type="alerts"
        />
        <StatCard title="STOCK VALUATION" value="₹ 0" change="Not tracked" type="users" />
        <StatCard title="STOCK HEALTH" value="0%" change="No data" type="active" />
        <StatCard title="ACTIVE WAREHOUSES" value="0" change="No data" type="pending" />
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Package size={18} color="#10b981" />
            <h3>Warehouse Inventory Table</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Updated Live</span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Loading inventory...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                  <th style={{ padding: "10px" }}>Item Name</th>
                  <th style={{ padding: "10px" }}>Category</th>
                  <th style={{ padding: "10px" }}>Quantity</th>
                  <th style={{ padding: "10px" }}>Location</th>
                  <th style={{ padding: "10px" }}>Unit Price</th>
                  <th style={{ padding: "10px" }}>Status</th>
                  {isAuthorized && <th style={{ padding: "10px" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                      No inventory items available.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                  <tr key={item._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 10px", fontWeight: 600, color: "#1e293b" }}>{item.name}</td>
                    <td style={{ padding: "12px 10px", color: "#64748b" }}>{item.category}</td>
                    <td style={{ padding: "12px 10px", color: "#1e293b" }}>
                      {item.quantity} {item.unit}
                    </td>
                    <td style={{ padding: "12px 10px", color: "#64748b" }}>{item.location}</td>
                    <td style={{ padding: "12px 10px", color: "#64748b" }}>{item.unitPrice}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span
                        className={`status-pill ${
                          item.status === "In Stock" ? "good" : item.status === "Low Stock" ? "warning" : "danger"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    {isAuthorized && (
                      <td style={{ padding: "12px 10px" }}>
                        <button
                          className="menu-item"
                          style={{ width: "auto", height: "26px", padding: "0 6px", color: "#ef4444" }}
                          onClick={() => handleDelete(item._id)}
                        >
                          <Trash2 size={13} />
                        </button>
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
            <h3 style={{ margin: "0 0 16px" }}>Add Material to Inventory</h3>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OPC 53 Cement"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b" }}>Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b" }}>Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="Bags, Tons, m³"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                  />
                </div>
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

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Storage Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button type="button" className="date-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#d97706", color: "#ffffff", border: "none" }}>
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminInventory;
