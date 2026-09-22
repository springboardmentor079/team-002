import { useState, useEffect } from "react";
import API from "../../services/api";
import "../../styles/procurement.css";

function PurchaseOrderList() {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    vendor: "",
    name: "",
    quantity: 1,
    unit: "bags",
    unitPrice: 0,
  });

  const load = async () => {
    try {
      setLoading(true);
      const [o, v] = await Promise.allSettled([
        API.get("/purchase-orders"),
        API.get("/vendors"),
      ]);
      if (o.status === "fulfilled" && o.value?.data?.data) {
        setOrders(o.value.data.data);
      }
      if (v.status === "fulfilled" && v.value?.data?.data) {
        setVendors(v.value.data.data);
      }
    } catch (err) {
      console.error("Failed to load PO data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const calculatedTotal = Number(form.quantity || 1) * Number(form.unitPrice || 0);

  const createPO = async (e) => {
    e.preventDefault();
    if (!form.vendor) {
      alert("Please select a vendor before creating the purchase order.");
      return;
    }
    try {
      await API.post("/purchase-orders", {
        vendor: form.vendor,
        totalAmount: calculatedTotal,
        items: [
          {
            name: form.name,
            quantity: Number(form.quantity),
            unit: form.unit,
            unitPrice: Number(form.unitPrice),
          },
        ],
      });
      setForm({ vendor: "", name: "", quantity: 1, unit: "bags", unitPrice: 0 });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not create PO");
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await API.put(`/purchase-orders/${id}/status`, { status });
      load();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="proc-section">
      <div className="proc-header">
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
          Purchase Orders (PO)
        </h3>
        <span className="proc-badge">{orders.length} Total Orders</span>
      </div>

      <form onSubmit={createPO} className="proc-form">
        <select
          value={form.vendor}
          onChange={(e) => setForm({ ...form, vendor: e.target.value })}
          onFocus={load}
          required
          style={{ flex: "1 1 200px" }}
        >
          <option value="">
            {vendors.length > 0
              ? `-- Select Vendor (${vendors.length} available) --`
              : "-- Loading Vendors... --"}
          </option>
          {vendors.map((v) => (
            <option key={v._id} value={v._id}>
              {v.name} ({v.category || "Supplier"})
            </option>
          ))}
        </select>

        <input
          placeholder="Material (e.g. OPC 53 Cement)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ flex: "1 1 180px" }}
        />

        <input
          type="number"
          min="1"
          placeholder="Qty"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          required
          style={{ flex: "0 1 80px" }}
        />

        <input
          placeholder="Unit (e.g. bags/tons)"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          style={{ flex: "0 1 100px" }}
        />

        <input
          type="number"
          min="0"
          placeholder="Unit Price ₹"
          value={form.unitPrice}
          onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
          required
          style={{ flex: "0 1 110px" }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            background: "#f1f5f9",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#334155",
            fontWeight: 600,
          }}
        >
          Total: <span style={{ color: "#d97706", fontWeight: 700 }}>₹{calculatedTotal.toLocaleString("en-IN")}</span>
        </div>

        <button type="submit" className="proc-btn-primary">
          + Create PO
        </button>

        {vendors.length === 0 && (
          <button
            type="button"
            onClick={load}
            style={{
              background: "#f1f5f9",
              color: "#475569",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            ↻ Reload Vendors
          </button>
        )}
      </form>

      <div className="proc-table-wrap">
        <table className="proc-table">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Vendor Name</th>
              <th>Items & Qty</th>
              <th>Total Amount (₹)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>
                  <strong style={{ color: "#1e293b" }}>{o.poNumber}</strong>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: "#2563eb" }}>
                    {o.vendor?.name || "Direct Supplier"}
                  </div>
                  {o.vendor?.category && (
                    <span style={{ fontSize: "10px", color: "#64748b" }}>
                      {o.vendor.category}
                    </span>
                  )}
                </td>
                <td>
                  {Array.isArray(o.items) &&
                    o.items
                      .map((i) => `${i.name} (${i.quantity} ${i.unit || "units"})`)
                      .join(", ")}
                </td>
                <td>
                  <strong>₹{Number(o.totalAmount || 0).toLocaleString("en-IN")}</strong>
                </td>
                <td>
                  <select
                    className="proc-status-select"
                    value={o.status}
                    onChange={(e) => changeStatus(o._id, e.target.value)}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && !loading && (
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "12px", padding: "16px 0" }}>
          No purchase orders generated yet. Use the form above to create your first PO.
        </p>
      )}
    </div>
  );
}

export default PurchaseOrderList;