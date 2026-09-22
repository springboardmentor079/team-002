import { useState, useEffect } from "react";
import API from "../../services/api";
import "../../styles/procurement.css";

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    invoiceNumber: "",
    purchaseOrder: "",
    amount: 0,
    dueDate: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      const [i, o] = await Promise.allSettled([
        API.get("/invoices"),
        API.get("/purchase-orders"),
      ]);
      if (i.status === "fulfilled" && i.value?.data?.data) {
        setInvoices(i.value.data.data);
      }
      if (o.status === "fulfilled" && o.value?.data?.data) {
        setOrders(o.value.data.data);
      }
    } catch (err) {
      console.error("Failed to load invoices or POs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // When a PO is chosen, directly calculate / fill the exact PO total amount
  const pickOrder = (id) => {
    const po = orders.find((o) => o._id === id);
    setForm((prev) => ({
      ...prev,
      purchaseOrder: id,
      amount: po ? Number(po.totalAmount || 0) : 0,
    }));
  };

  const selectedPO = orders.find((o) => o._id === form.purchaseOrder);

  const createInvoice = async (e) => {
    e.preventDefault();
    if (!form.purchaseOrder) {
      alert("Please select a valid Purchase Order to link this invoice.");
      return;
    }

    const calculatedAmount = selectedPO
      ? Number(selectedPO.totalAmount || 0)
      : Number(form.amount || 0);

    try {
      await API.post("/invoices", {
        invoiceNumber: form.invoiceNumber,
        purchaseOrder: form.purchaseOrder,
        amount: calculatedAmount,
        dueDate: form.dueDate || undefined,
      });
      setForm({ invoiceNumber: "", purchaseOrder: "", amount: 0, dueDate: "" });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not create invoice");
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await API.put(`/invoices/${id}/status`, { status });
      load();
    } catch (err) {
      alert("Failed to update invoice status");
    }
  };

  const totalUnpaid = invoices
    .filter((i) => i.status !== "Paid")
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  return (
    <div className="proc-section">
      <div className="proc-header">
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
            Invoices & Accounts Payable
          </h3>
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            Vendor billing calculated directly from linked Purchase Orders
          </span>
        </div>
        <span
          className="proc-badge"
          style={{ background: "#fef3c7", color: "#b45309", borderColor: "#fde68a" }}
        >
          Total Unpaid: <strong>₹{totalUnpaid.toLocaleString("en-IN")}</strong>
        </span>
      </div>

      <form onSubmit={createInvoice} className="proc-form">
        <input
          placeholder="Invoice No. (e.g. INV-9042)"
          value={form.invoiceNumber}
          onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
          required
          style={{ flex: "1 1 160px" }}
        />

        <select
          value={form.purchaseOrder}
          onChange={(e) => pickOrder(e.target.value)}
          onFocus={load}
          required
          style={{ flex: "1 1 240px" }}
        >
          <option value="">
            {orders.length > 0
              ? `-- Select PO (${orders.length} available) --`
              : "-- No POs Found --"}
          </option>
          {orders.map((o) => (
            <option key={o._id} value={o._id}>
              {o.poNumber} — {o.vendor?.name || "Vendor"} (₹
              {Number(o.totalAmount || 0).toLocaleString("en-IN")})
            </option>
          ))}
        </select>

        <div style={{ position: "relative", flex: "0 1 160px" }}>
          <input
            type="text"
            readOnly
            placeholder="Amount from PO"
            value={
              selectedPO
                ? `₹ ${Number(selectedPO.totalAmount || 0).toLocaleString("en-IN")}`
                : "Select PO First"
            }
            title="Invoice amount is directly calculated from the selected Purchase Order"
            style={{
              width: "100%",
              background: "#f8fafc",
              cursor: "not-allowed",
              fontWeight: 700,
              color: selectedPO ? "#0f766e" : "#94a3b8",
              borderColor: selectedPO ? "#99f6e4" : "#cbd5e1",
            }}
          />
        </div>

        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          style={{ flex: "0 1 130px" }}
        />

        <button type="submit" className="proc-btn-primary">
          + Add Invoice
        </button>

        {selectedPO && (
          <div
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#1e40af",
              display: "flex",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span>
              <strong>Selected Vendor:</strong> {selectedPO.vendor?.name || "Direct Supplier"}
            </span>
            <span>
              <strong>PO Total (Direct Calculation):</strong> ₹
              {Number(selectedPO.totalAmount || 0).toLocaleString("en-IN")}
            </span>
            <span>
              <strong>PO Status:</strong> {selectedPO.status}
            </span>
          </div>
        )}
      </form>

      <div className="proc-table-wrap">
        <table className="proc-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>PO Reference</th>
              <th>Vendor Name</th>
              <th>Calculated Amount (₹)</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => {
              const vendorName =
                i.purchaseOrder?.vendor?.name ||
                (typeof i.purchaseOrder?.vendor === "string"
                  ? i.purchaseOrder.vendor
                  : "-");

              const amount = Number(
                i.amount !== undefined && i.amount !== null
                  ? i.amount
                  : i.purchaseOrder?.totalAmount || 0
              );

              return (
                <tr key={i._id}>
                  <td>
                    <strong style={{ color: "#1e293b" }}>{i.invoiceNumber}</strong>
                  </td>
                  <td>
                    <span style={{ color: "#2563eb", fontWeight: 600 }}>
                      {i.purchaseOrder?.poNumber || "Direct PO"}
                    </span>
                  </td>
                  <td>
                    <strong>{vendorName}</strong>
                    {i.purchaseOrder?.vendor?.category && (
                      <span style={{ display: "block", fontSize: "10px", color: "#64748b" }}>
                        {i.purchaseOrder.vendor.category}
                      </span>
                    )}
                  </td>
                  <td>
                    <strong>₹{amount.toLocaleString("en-IN")}</strong>
                  </td>
                  <td>
                    {i.dueDate ? new Date(i.dueDate).toLocaleDateString("en-IN") : "-"}
                  </td>
                  <td>
                    <select
                      className="proc-status-select"
                      value={i.status}
                      onChange={(e) => changeStatus(i._id, e.target.value)}
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {invoices.length === 0 && !loading && (
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "12px", padding: "16px 0" }}>
          No invoices recorded yet. Select a Purchase Order above to generate an invoice.
        </p>
      )}
    </div>
  );
}

export default InvoiceList;