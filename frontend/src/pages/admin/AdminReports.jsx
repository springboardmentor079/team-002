import { useState, useEffect } from "react";
import { FileBarChart, Plus, Download, FileText, CheckCircle2, AlertCircle, FilePlus, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../../services/api";
import { canEdit } from "../../utils/auth";
import StatCard from "../../components/dashboard/StatCard";

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [generatingType, setGeneratingType] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "Daily Progress",
    location: "Main Campus",
    summary: "",
    snagsFound: 0,
    status: "Approved",
  });

  const isAuthorized = canEdit("reports");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await API.get("/reports");
      if (res.data && res.data.data) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/reports", formData);
      setShowModal(false);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to log report");
    }
  };

  const handleExport = () => {
    if (isExportingCsv) return;
    try {
      setIsExportingCsv(true);
      const dataToExport = filterType === "All" ? reports : reports.filter((r) => r.type === filterType);
      const csvRows = [
        ["Title", "Type", "Author", "Date", "Location", "Summary", "Status"].join(","),
        ...dataToExport.map((r) =>
          [
            `"${(r.title || "").replace(/"/g, '""')}"`,
            `"${(r.type || "").replace(/"/g, '""')}"`,
            `"${(r.author || "").replace(/"/g, '""')}"`,
            `"${(r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "")).replace(/"/g, '""')}"`,
            `"${(r.location || "").replace(/"/g, '""')}"`,
            `"${(r.summary || "").replace(/"/g, '""')}"`,
            `"${(r.status || "").replace(/"/g, '""')}"`,
          ].join(",")
        ),
      ];
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const cleanFilter = filterType.replace(/[^a-zA-Z0-9]/g, "_");
      link.setAttribute("download", `BuildTrack_${cleanFilter}_Reports_Summary.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV Export error:", err);
      alert("Failed to export CSV: " + err.message);
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportPDF = () => {
    if (isExportingPdf) return;
    try {
      setIsExportingPdf(true);
      const dataToExport = filterType === "All" ? reports : reports.filter((r) => r.type === filterType);

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Header Banner
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 297, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("BuildTrack - Construction Project Management", 14, 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(203, 213, 225);
      doc.text(`Official Executive & Site Reports | Category: ${filterType}`, 14, 18);

      // Metadata section
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      const exportDate = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      doc.text(`Generated on: ${exportDate}  |  Total Records: ${dataToExport.length}`, 14, 31);

      if (dataToExport.length === 0) {
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text(`No report entries available for category: "${filterType}".`, 14, 45);
        autoTable(doc, {
          startY: 50,
          head: [["Status", "Notice"]],
          body: [["Empty", `No report records found matching filter "${filterType}".`]],
          theme: "grid",
          headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255] },
        });
      } else {
        const tableData = dataToExport.map((r, idx) => [
          String(idx + 1),
          r.title || "Untitled Report",
          r.type || "Daily Progress",
          r.author || "Site Engineer",
          r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"),
          r.location || "System-wide",
          r.summary || "No additional notes provided.",
          r.status || "Approved",
        ]);

        autoTable(doc, {
          startY: 36,
          head: [["#", "Title", "Type", "Author", "Date", "Location", "Summary / Metrics", "Status"]],
          body: tableData,
          theme: "striped",
          headStyles: {
            fillColor: [30, 41, 59],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
          },
          bodyStyles: {
            fontSize: 8,
            cellPadding: 3,
            textColor: [30, 41, 59],
          },
          columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            1: { cellWidth: 45, fontStyle: "bold" },
            2: { cellWidth: 26 },
            3: { cellWidth: 26 },
            4: { cellWidth: 24 },
            5: { cellWidth: 32 },
            6: { cellWidth: 84 },
            7: { cellWidth: 22, halign: "center" },
          },
          didDrawPage: (data) => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(
              `Page ${data.pageNumber} of ${pageCount} - Confidential BuildTrack Internal Audit Document`,
              14,
              205
            );
          },
        });
      }

      const cleanFilter = filterType.replace(/[^a-zA-Z0-9]/g, "_");
      doc.save(`BuildTrack_${cleanFilter}_Reports_Summary.pdf`);
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("Failed to export PDF: " + (err.message || "Unknown error"));
    } finally {
      setIsExportingPdf(false);
    }
  };

  const generateReport = async (endpoint, type) => {
    if (generatingType) return;
    try {
      setGeneratingType(type);
      await API.post(`/reports/generate/${endpoint}`);
      fetchReports();
    } catch (err) {
      alert(`Failed to generate ${type} report: ` + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingType(null);
    }
  };

  const filtered = reports.filter((r) => filterType === "All" || r.type === filterType);

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Site & Executive Reports 📊</h1>
          <p>Quality inspections, structural compliance sign-offs, daily workforce counts, and audit logs.</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            className="date-button"
            style={{ display: "flex", alignItems: "center", gap: "6px", cursor: isExportingPdf ? "not-allowed" : "pointer" }}
            onClick={handleExportPDF}
            disabled={isExportingPdf}
          >
            <FileText size={15} /> {isExportingPdf ? "Exporting PDF..." : "Export PDF"}
          </button>
          <button
            className="date-button"
            style={{ display: "flex", alignItems: "center", gap: "6px", cursor: isExportingCsv ? "not-allowed" : "pointer" }}
            onClick={handleExport}
            disabled={isExportingCsv}
          >
            <Download size={15} /> {isExportingCsv ? "Exporting CSV..." : "Export CSV"}
          </button>
          {isAuthorized && (
            <>
              <button
                className="date-button"
                style={{ background: "#475569", color: "#ffffff", border: "none" }}
                onClick={() => generateReport("workforce", "Workforce")}
                disabled={generatingType !== null}
              >
                {generatingType === "Workforce" ? "Generating..." : "Auto: Workforce"}
              </button>
              <button
                className="date-button"
                style={{ background: "#2563eb", color: "#ffffff", border: "none" }}
                onClick={() => generateReport("procurement", "Procurement")}
                disabled={generatingType !== null}
              >
                {generatingType === "Procurement" ? "Generating..." : "Auto: Procurement"}
              </button>
              <button
                className="date-button"
                style={{ background: "#0284c7", color: "#ffffff", border: "none" }}
                onClick={() => generateReport("resource", "Resource")}
                disabled={generatingType !== null}
              >
                {generatingType === "Resource" ? "Generating..." : "Auto: Resource"}
              </button>
              <button
                className="date-button"
                style={{ background: "#0f766e", color: "#ffffff", border: "none" }}
                onClick={() => generateReport("budget", "Budget")}
                disabled={generatingType !== null}
              >
                {generatingType === "Budget" ? "Generating..." : "Auto: Budget"}
              </button>
            </>
          )}
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
              <Plus size={16} /> Log Report
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="TOTAL REPORTS" value={String(reports.length)} change="Logged" type="projects" />
        <StatCard title="INSPECTIONS PASSED" value="0%" change="No data" type="active" />
        <StatCard title="AUDIT SNAGS OPEN" value="0" change="No data" type="alerts" />
        <StatCard
          title="APPROVED SIGN-OFFS"
          value={String(reports.filter((r) => r.status === "Approved").length)}
          change="Quality lead"
          type="users"
        />
        <StatCard title="REPORT COMPLIANCE" value="0%" change="No data" type="pending" />
      </div>

      {/* FILTER TABS */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["All", "Daily Progress", "Inspection", "Workforce", "Procurement", "Resource", "Budget"].map((type) => (
          <button
            key={type}
            className={`menu-item ${filterType === type ? "active" : ""}`}
            style={{ width: "auto", height: "32px", padding: "0 12px", borderRadius: "6px" }}
            onClick={() => setFilterType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="dashboard-grid role-grid">
        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Loading reports...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No reports available.</div>
        ) : (
          filtered.map((rep) => (
            <div className="dashboard-card" key={rep._id} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="status-pill good">{rep.type}</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>{rep.date}</span>
              </div>
              <h3 style={{ margin: "2px 0", fontSize: "14px", color: "#1e293b" }}>{rep.title}</h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{rep.summary}</p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                <span>Location: {rep.location}</span>
                <span>By: {rep.author}</span>
              </div>
            </div>
          ))
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
          <div className="dashboard-card" style={{ width: "400px" }}>
            <h3 style={{ margin: "0 0 16px" }}>Log Site Report</h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Report Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Slab Rebar Verification"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Report Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                >
                  <option value="Daily Progress">Daily Progress</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Workforce">Workforce</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Resource">Resource</option>
                  <option value="Budget">Budget</option>
                  <option value="Safety & Audit">Safety & Audit</option>
                  <option value="Quality">Quality</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Location / Zone</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b" }}>Summary / Notes</label>
                <textarea
                  rows="3"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button type="button" className="date-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#d97706", color: "#ffffff", border: "none" }}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminReports;
