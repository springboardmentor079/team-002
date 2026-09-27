import { useState, useEffect, useMemo } from "react";
import { Download, FileCheck } from "lucide-react";
import ClientSiteUpdates from "../../components/client/ClientSiteUpdates";
import StatCard from "../../components/dashboard/StatCard";
import API from "../../services/api";

function ClientReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports");
      setReports(res.data?.data || []);
    } catch (err) {
      console.error("Client reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const labTests = useMemo(
    () => reports.filter((r) => r.type === "Quality").length,
    [reports]
  );

  const thirdParty = useMemo(
    () =>
      reports.filter((r) =>
        /third|audit/i.test(`${r.type} ${r.title}`)
      ).length,
    [reports]
  );

  const criticalSnags = reports.reduce(
    (sum, r) => sum + (Number(r.snagsFound) || 0),
    0
  );

  const handover = reports.find((r) =>
    /handover/i.test(`${r.title} ${r.summary}`)
  );

  // Only Inspection reports should appear in
  // "Certified Inspection Certificates"
  const inspectionReports = reports.filter(
    (r) => r.type === "Inspection"
  );

  const updates = reports.slice(0, 6).map((r) => ({
    _id: r._id,
    title: r.title,
    desc:
      r.summary ||
      `Report logged at ${r.location || "site"}.`,
    date: r.date,
    type: r.type?.toLowerCase().includes("inspection")
      ? "verified"
      : r.type?.toLowerCase().includes("safety")
      ? "info"
      : "media",
    badge: r.status || "Submitted",
  }));

  return (
    <>
      <div
        className="welcome-section"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1>Quality Sign-offs & Handover Reports 📑</h1>
          <p>
            Verified structural tests, architectural sign-offs,
            and progress reports stored in MongoDB.
          </p>
        </div>

        <button
          className="date-button"
          style={{
            background: "#d97706",
            color: "#fff",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onClick={() => window.print()}
          
        >
          <Download size={15} />
          Download PDF Report
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="VERIFIED AUDITS"
          value={String(
            reports.filter((r) => r.status === "Approved").length
          )}
          change={`${reports.length} total reports`}
          type="projects"
        />

        <StatCard
          title="LAB TEST RESULTS"
          value={String(labTests)}
          change="Quality reports"
          type="active"
        />

        <StatCard
          title="THIRD-PARTY AUDIT"
          value={String(thirdParty)}
          change="Matched from records"
          type="users"
        />

        <StatCard
          title="HANDOVER ESTIMATE"
          value={handover?.date || "--"}
          change={handover?.title || "No handover report"}
          type="pending"
        />

        <StatCard
          title="CRITICAL SNAGS"
          value={String(criticalSnags)}
          change="From report records"
          type="alerts"
        />
      </div>

      <div className="dashboard-grid role-grid">
        <ClientSiteUpdates updates={updates} />

        <div className="dashboard-card">
          <div className="card-header">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FileCheck size={18} color="#059669" />
              <h3>Certified Inspection Certificates</h3>
            </div>

            <span
              style={{
                fontSize: "11px",
                color: "#64748b",
              }}
            >
              Live Records
            </span>
          </div>

          {loading ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
              }}
            >
              Loading reports...
            </div>
          ) : inspectionReports.length === 0 ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              No inspection reports available.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {inspectionReports.map((rep) => (
                <div
                  key={rep._id}
                  style={{
                    padding: "10px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #f1f5f9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        fontSize: "12px",
                        color: "#1e293b",
                        display: "block",
                      }}
                    >
                      {rep.title}
                    </strong>

                    <span
                      style={{
                        fontSize: "10px",
                        color: "#64748b",
                      }}
                    >
                      {rep.location} • {rep.date}
                    </span>
                  </div>

                  <span
                    className={`status-pill ${
                      rep.status === "Approved"
                        ? "good"
                        : "warning"
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ClientReports;