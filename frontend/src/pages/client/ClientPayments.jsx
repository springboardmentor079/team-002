import { Receipt, Download, CheckCircle2, Clock } from "lucide-react";
import { jsPDF } from "jspdf";
import ClientFinancialOverview from "../../components/client/ClientFinancialOverview";
import StatCard from "../../components/dashboard/StatCard";

function ClientPayments() {
  const invoices = [];

  const handleDownloadInvoice = (inv) => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 24, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("BuildTrack - Milestone Invoice Receipt", 14, 15);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.text(`Invoice ID: ${inv.id}`, 14, 38);
      doc.text(`Milestone: ${inv.milestone}`, 14, 46);
      doc.text(`Amount: ${inv.amount}`, 14, 54);
      doc.text(`Status: ${inv.status}`, 14, 62);
      doc.text(`Issued Date: ${new Date().toLocaleDateString()}`, 14, 70);

      doc.save(`Invoice_${inv.id}.pdf`);
    } catch (err) {
      alert("Failed to generate invoice PDF: " + err.message);
    }
  };

  return (
    <>
      <div className="welcome-section">
        <div>
          <h1>Invoices & Milestone Disbursements 💳</h1>
          <p>Track payments against verified engineering progress, download GST invoices, and view cashflow.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="TOTAL CONTRACT" value="₹ 0" change="No data" type="projects" />
        <StatCard title="DISBURSED TO DATE" value="₹ 0" change="No data" type="active" />
        <StatCard title="INVOICED / DUE" value="₹ 0" change="No data" type="alerts" />
        <StatCard title="REMAINING BUDGET" value="₹ 0" change="No data" type="pending" />
        <StatCard title="INVOICE COMPLIANCE" value="0%" change="No data" type="users" />
      </div>

      <div className="dashboard-grid role-grid" style={{ marginBottom: "20px" }}>
        <ClientFinancialOverview />

        <div className="dashboard-card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Receipt size={18} color="#10b981" />
              <h3>Milestone Invoice Ledger</h3>
            </div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Audited Invoices</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                  <th style={{ padding: "8px" }}>Invoice #</th>
                  <th style={{ padding: "8px" }}>Milestone Phase</th>
                  <th style={{ padding: "8px" }}>Amount</th>
                  <th style={{ padding: "8px" }}>Status</th>
                  <th style={{ padding: "8px" }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No payment records available.</td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 8px", fontWeight: 700, color: "#3b82f6" }}>{inv.id}</td>
                      <td style={{ padding: "10px 8px", color: "#1e293b" }}>{inv.milestone}</td>
                      <td style={{ padding: "10px 8px", fontWeight: 600, color: "#1e293b" }}>{inv.amount}</td>
                      <td style={{ padding: "10px 8px" }}>
                        <span className={`status-pill ${inv.statusClass}`}>{inv.status}</span>
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <button
                          className="menu-item"
                          style={{ width: "auto", height: "26px", padding: "0 8px", fontSize: "11px" }}
                          onClick={() => handleDownloadInvoice(inv)}
                        >
                          <Download size={12} style={{ marginRight: "4px" }} /> PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default ClientPayments;
