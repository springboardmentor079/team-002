import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";

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
            <h3>Requisitions Queue</h3>
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Live Requisitions</span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading requisitions...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                  <th style={{ padding: "10px" }}>REQ ID</th>
                  <th style={{ padding: "10px" }}>Material Name</th>
                  <th style={{ padding: "10px" }}>Quantity</th>
                  <th style={{ padding: "10px" }}>Site Location</th>
                  <th style={{ padding: "10px" }}>Status</th>
                  {isAuthorized && <th style={{ padding: "10px" }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={isAuthorized ? 6 : 5} style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                      No requisitions available.
                    </td>
                  </tr>
                ) : (
                requests.map((req) => (
                  <tr key={req._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 10px", fontWeight: 700, color: "#d97706" }}>{req.reqId}</td>
                    <td style={{ padding: "12px 10px", fontWeight: 600, color: "#1e293b" }}>{req.material}</td>
                    <td style={{ padding: "12px 10px", color: "#1e293b" }}>{req.quantity}</td>
                    <td style={{ padding: "12px 10px", color: "#64748b" }}>{req.site}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span className={`status-pill ${req.badge || "warning"}`}>{req.status}</span>
                    </td>
                    {isAuthorized && (
                      <td style={{ padding: "12px 10px" }}>
                        {req.status === "Pending Approval" ? (
                          <button
                            className="pm-menu-item active"
                            style={{ width: "auto", height: "26px", padding: "0 10px", fontSize: "11px" }}
                            onClick={() => handleStatusUpdate(req._id, "Approved")}
                          >
                            Approve
                          </button>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#64748b" }}>Processed</span>
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
    </>
  );
}

export default PMProcurement;
