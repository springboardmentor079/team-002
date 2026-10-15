import { useState, useEffect } from "react";
import { Download, FileCheck, CheckCircle2 } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ClientSiteUpdates from "../../components/client/ClientSiteUpdates";
import StatCard from "../../components/dashboard/StatCard";
import API from "../../services/api";

function ClientReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("/reports");
        if (res.data?.data) {
          setReports(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = () => {
    if (downloading) return;
    try {
      setDownloading(true);
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("BuildTrack - Client Progress & Handover Report", 14, 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text("Official Verified Quality Sign-offs and Structural Certifications", 14, 18);

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      const exportDate = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      doc.text(`Report Date: ${exportDate}  |  Total Certified Reports: ${reports.length}`, 14, 31);

      if (reports.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("No verified handover reports or certificates currently on file.", 14, 42);
      } else {
        const tableData = reports.map((r, idx) => [
          String(idx + 1),
          r.title || "Report",
          r.type || "Quality Sign-off",
          r.location || "Site-wide",
          r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"),
          r.summary || "Certified compliant with engineering specifications.",
          "Certified",
        ]);

        autoTable(doc, {
          startY: 36,
          head: [["#", "Certificate / Title", "Type", "Location", "Date", "Summary / Notes", "Status"]],
          body: tableData,
          theme: "striped",
          headStyles: {
            fillColor: [15, 23, 42],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8,
          },
          bodyStyles: {
            fontSize: 8,
            cellPadding: 3,
          },
          columnStyles: {
            0: { cellWidth: 8, halign: "center" },
            1: { cellWidth: 38, fontStyle: "bold" },
            2: { cellWidth: 24 },
            3: { cellWidth: 24 },
            4: { cellWidth: 20 },
            5: { cellWidth: 52 },
            6: { cellWidth: 16, halign: "center" },
          },
          didDrawPage: (data) => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(
              `Page ${data.pageNumber} of ${pageCount} - Certified Client Inspection Bulletin`,
              14,
              287
            );
          },
        });
      }

      doc.save("BuildTrack_Client_Handover_Report.pdf");
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to generate PDF: " + (err.message || "Unknown error"));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="welcome-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Quality Sign-offs & Handover Reports 📑</h1>
          <p>Verified structural test certificates, architectural sign-offs, and monthly progress bulletins.</p>
        </div>
        <button
          className="date-button"
          style={{ background: "#d97706", color: "#ffffff", border: "none", display: "flex", alignItems: "center", gap: "6px", cursor: downloading ? "not-allowed" : "pointer" }}
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download size={15} /> {downloading ? "Generating PDF..." : "Download PDF Report"}
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="VERIFIED AUDITS" value={String(reports.length)} change="No data" type="projects" />
        <StatCard title="LAB TEST RESULTS" value="0" change="No data" type="active" />
        <StatCard title="THIRD-PARTY AUDIT" value="No data" change="No data" type="users" />
        <StatCard title="HANDOVER ESTIMATE" value="No data" change="No data" type="pending" />
        <StatCard title="CRITICAL SNAGS" value="0" change="No data" type="alerts" />
      </div>

      <div className="dashboard-grid role-grid">
        <ClientSiteUpdates />

        <div className="dashboard-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FileCheck size={18} color="#059669" />
              <h3>Certified Inspection Certificates</h3>
            </div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Live Records</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {reports.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No reports available.</div>
            ) : (
              reports.map((rep) => (
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
                    <strong style={{ fontSize: "12px", color: "#1e293b", display: "block" }}>{rep.title}</strong>
                    <span style={{ fontSize: "10px", color: "#64748b" }}>{rep.location} • {rep.date}</span>
                  </div>
                  <span className="status-pill good">Certified</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ClientReports;
