import { useState, useEffect } from "react";
import { Download, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../../services/api";

function PMReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

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
    if (isExportingCsv) return;
    try {
      setIsExportingCsv(true);
      const csvRows = [
        ["Title", "Type", "Author", "Date", "Location", "Summary", "Status"].join(","),
        ...reports.map((r) =>
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
      link.setAttribute("download", "PM_Project_Reports.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export CSV: " + err.message);
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportPDF = () => {
    if (isExportingPdf) return;
    try {
      setIsExportingPdf(true);
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 297, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("BuildTrack - Project Performance Reports", 14, 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(203, 213, 225);
      doc.text("Project Manager Executive Progress & Site Operations Summary", 14, 18);

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      const exportDate = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      doc.text(`Generated: ${exportDate}  |  Total Reports: ${reports.length}`, 14, 31);

      if (reports.length === 0) {
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text("No project reports available for export.", 14, 45);
      } else {
        const tableData = reports.map((r, idx) => [
          String(idx + 1),
          r.title || "Report",
          r.type || "Daily Progress",
          r.author || "Site Engineer",
          r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"),
          r.location || "System-wide",
          r.summary || "No notes provided.",
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
              `Page ${data.pageNumber} of ${pageCount} - BuildTrack PM Executive Report`,
              14,
              205
            );
          },
        });
      }

      doc.save("BuildTrack_PM_Reports_Summary.pdf");
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to export PDF: " + (err.message || "Unknown error"));
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <>
      <div className="pm-welcome-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1>Project Performance Reports 📊</h1>
          <p>Monthly executive progress reports, budget utilization, and quality sign-offs.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="pm-menu-item active"
            style={{ width: "auto", padding: "8px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px", cursor: isExportingPdf ? "not-allowed" : "pointer" }}
            onClick={handleExportPDF}
            disabled={isExportingPdf}
          >
            <FileText size={15} /> {isExportingPdf ? "Exporting PDF..." : "Export PDF"}
          </button>
          <button
            className="pm-menu-item active"
            style={{ width: "auto", padding: "8px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px", cursor: isExportingCsv ? "not-allowed" : "pointer" }}
            onClick={handleExport}
            disabled={isExportingCsv}
          >
            <Download size={15} /> {isExportingCsv ? "Exporting CSV..." : "Export CSV"}
          </button>
        </div>
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
