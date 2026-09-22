import { useState, useEffect } from "react";
import API from "../../services/api";

function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({ name: "", category: "Raw Materials", phone: "" });

  const loadVendors = async () => {
    try {
      const res = await API.get("/vendors");
      setVendors(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const addVendor = async (e) => {
    e.preventDefault();
    try {
      await API.post("/vendors", form);
      setForm({ name: "", category: "Raw Materials", phone: "" });
      loadVendors();
    } catch (err) {
      alert(err.response?.data?.message || "Could not add vendor");
    }
  };

  const removeVendor = async (id) => {
    await API.delete(`/vendors/${id}`);
    loadVendors();
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Vendors Directory</h3>
        <span style={{ fontSize: "11px", color: "#64748b", background: "#f8fafc", padding: "3px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>{vendors.length} Registered</span>
      </div>

      <form onSubmit={addVendor} style={{ display: "flex", gap: "10px", marginBottom: "18px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="Vendor name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ flex: "1 1 160px", padding: "8px 12px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "8px", outline: "none" }}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          style={{ flex: "1 1 140px", padding: "8px 12px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", outline: "none" }}
        >
          <option>Raw Materials</option>
          <option>Equipment</option>
          <option>Machinery</option>
          <option>Safety Equipment</option>
          <option>Office Supplies</option>
        </select>
        <input
          placeholder="Phone number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          style={{ flex: "1 1 130px", padding: "8px 12px", fontSize: "13px", border: "1px solid #cbd5e1", borderRadius: "8px", outline: "none" }}
        />
        <button
          type="submit"
          style={{
            background: "#d97706",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 18px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          + Add Vendor
        </button>
      </form>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
              <th style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>Name</th>
              <th style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>Category</th>
              <th style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>Phone</th>
              <th style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>Status</th>
              <th style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>{v.name}</td>
                <td style={{ padding: "10px 12px", color: "#64748b", whiteSpace: "nowrap" }}>{v.category}</td>
                <td style={{ padding: "10px 12px", color: "#64748b", whiteSpace: "nowrap" }}>{v.phone || "—"}</td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                  <span className="status-pill good" style={{ display: "inline-block" }}>{v.status || "Active"}</span>
                </td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                  <button
                    onClick={() => removeVendor(v._id)}
                    style={{
                      background: "#fef2f2",
                      color: "#ef4444",
                      border: "1px solid #fecaca",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vendors.length === 0 && (
          <p style={{ textAlign: "center", color: "#64748b", fontSize: "12px", padding: "24px" }}>No vendors registered yet.</p>
        )}
      </div>
    </div>
  );
}

export default VendorList;