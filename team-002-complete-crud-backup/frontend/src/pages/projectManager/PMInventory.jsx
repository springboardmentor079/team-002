import { useState, useEffect } from "react";
import { Package, AlertCircle, Plus } from "lucide-react";
import API from "../../services/api";

function PMInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    category: "General Materials",
    location: "Warehouse 1 - North Yard",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchInventory = async () => {
    try {
      const res = await API.get("/inventory");
      if (res.data?.data) setItems(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.quantity) {
      setError("Name and quantity are required.");
      return;
    }

    const qty = Number(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      setError("Quantity must be a valid number greater than 0.");
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/inventory", {
        name: formData.name,
        quantity: qty,
        category: formData.category,
        location: formData.location,
      });
      setShowAddModal(false);
      setFormData({
        name: "",
        quantity: "",
        category: "General Materials",
        location: "Warehouse 1 - North Yard",
      });
      fetchInventory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add inventory item.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="pm-welcome-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1>Material Inventory Levels 📦</h1>
          <p>Monitor warehouse supply and requisition alerts across project sites.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Package size={18} color="#d97706" />
            <h3>Site Stock Levels</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Live Supply</span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading inventory...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                  <th style={{ padding: "10px" }}>Material Name</th>
                  <th style={{ padding: "10px" }}>Category</th>
                  <th style={{ padding: "10px" }}>Quantity</th>
                  <th style={{ padding: "10px" }}>Warehouse Location</th>
                  <th style={{ padding: "10px" }}>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
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
                    <td style={{ padding: "12px 10px" }}>
                      <span
                        className={`status-pill ${
                          item.status === "In Stock" ? "good" : item.status === "Low Stock" ? "warning" : "danger"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Inventory Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "18px", color: "#1e293b" }}>Add Inventory Item</h2>
            {error && (
              <div style={{ padding: "8px", background: "#fee2e2", color: "#ef4444", borderRadius: "4px", marginBottom: "16px", fontSize: "13px" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 600, color: "#475569" }}>Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px", boxSizing: "border-box" }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 600, color: "#475569" }}>Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px", boxSizing: "border-box" }}
                  required
                  min="1"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 600, color: "#475569" }}>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: 600, color: "#475569" }}>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "4px", boxSizing: "border-box" }}
                />
              </div>
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "white", borderRadius: "4px", cursor: "pointer", color: "#475569", fontWeight: 600 }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 16px", border: "none", background: "#2563eb", color: "white", borderRadius: "4px", cursor: "pointer", fontWeight: 600 }}
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default PMInventory;
