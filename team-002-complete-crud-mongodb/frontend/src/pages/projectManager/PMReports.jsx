import { useState, useEffect } from "react";
import { Download, FileText } from "lucide-react";
import API from "../../services/api";

function PMReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("/reports");
        if (res.data?.data) setReports(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Title,Type,Author,Date,Location,Status", ...reports.map((r) => `"${r.title}","${r.type}","${r.author}","${r.date}","${r.location}","${r.status}"`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "PM_Project_Reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="pm-welcome-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Project Performance Reports 📊</h1>
          <p>Monthly executive progress reports, budget utilization, and quality sign-offs.</p>
        </div>
        <button
          className="pm-menu-item active"
          style={{ width: "auto", padding: "8px 16px", borderRadius: "8px" }}
          onClick={handleExport}
        >
          <Download size={15} style={{ marginRight: "6px" }} /> Export CSV
        </button>
      </div>

      <div className="dashboard-grid role-grid">
        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>Loading reports...</div>
        ) : reports.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
            No reports available.
          </div>
        ) : (
          reports.map((rep) => (
            <div className="dashboard-card" key={rep._id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="status-pill good">{rep.type}</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>{rep.date}</span>
              </div>
              <h3 style={{ margin: 0, fontSize: "14px", color: "#1e293b" }}>{rep.title}</h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{rep.summary}</p>
              <span style={{ fontSize: "11px", color: "#94a3b8", borderTop: "1px solid #f1f5f9", paddingTop: "6px" }}>
                Location: {rep.location} • By: {rep.author}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default PMReports;
