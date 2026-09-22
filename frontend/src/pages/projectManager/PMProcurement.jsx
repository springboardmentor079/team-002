import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import VendorList from "../../components/projectManager/VendorList";
import PurchaseOrderList from "../../components/projectManager/PurchaseOrderList";
   import InvoiceList from "../../components/projectManager/InvoiceList";
function PMProcurement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAuthorized = canEdit("procurement");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/materials");
      if (res.data?.data) setRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/materials/${id}/status`, { status });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <>
      <div className="pm-welcome-section">
        <h1>Material Procurement & Requisitions 🛒</h1>
        <p>Review and authorize contractor material orders, delivery consignments, and bulk purchases.</p>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingCart size={18} color="#d97706" />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Requisitions Queue</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b", background: "#f8fafc", padding: "3px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>Live Requisitions</span>
        </div>

        {loading ? (
          <div style={{ padding: "36px", textAlign: "center", color: "#64748b" }}>Loading requisitions...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                  <th style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>REQ ID</th>
                  <th style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>Material Name</th>
                  <th style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>Quantity</th>
                  <th style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>Site Location</th>
                  <th style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>Status</th>
                  {isAuthorized && <th style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={isAuthorized ? 6 : 5} style={{ padding: "36px", textAlign: "center", color: "#64748b" }}>
                      No requisitions available.
                    </td>
                  </tr>
                ) : (
                requests.map((req) => (
                  <tr key={req._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "#d97706", whiteSpace: "nowrap" }}>{req.reqId}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1e293b" }}>{req.material}</td>
                    <td style={{ padding: "10px 12px", color: "#1e293b", whiteSpace: "nowrap" }}>{req.quantity}</td>
                    <td style={{ padding: "10px 12px", color: "#64748b", whiteSpace: "nowrap" }}>{req.site}</td>
                    <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                      <span className={`status-pill ${req.badge || "warning"}`}>{req.status}</span>
                    </td>
                    {isAuthorized && (
                      <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                        {req.status === "Pending Approval" ? (
                          <button
                            style={{
                              background: "#d97706",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "5px 12px",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer",
                              whiteSpace: "nowrap"
                            }}
                            onClick={() => handleStatusUpdate(req._id, "Approved")}
                          >
                            Approve
                          </button>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Processed</span>
                        )}
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

      <div className="dashboard-card" style={{ marginTop: "20px" }}>
        <VendorList />
      </div>

      <div className="dashboard-card" style={{ marginTop: "20px" }}>
        <PurchaseOrderList />
      </div>

      <div className="dashboard-card" style={{ marginTop: "20px" }}>
        <InvoiceList />
      </div>
    </>
  );
}

export default PMProcurement;
