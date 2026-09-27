import { useState } from "react";
import { Wallet, DollarSign, Clock, Calendar, CheckCircle2, Download, ArrowUpRight, FileText } from "lucide-react";

function WorkerWages() {
  const [selectedCycle, setSelectedCycle] = useState(null);

  const wageSummary = {
    hourlyRate: 0,
    hoursThisMonth: 0,
    overtimeHours: 0,
    grossEarnings: 0,
    taxesDeductions: 0,
    netPay: 0,
    nextPayday: "--",
  };

  const payCycles = [];

  const handleDownload = (cycle) => {
    alert(`Downloading PDF wage slip for pay cycle: ${cycle.id} (${cycle.period})`);
  };

  return (
    <>
      <div className="welcome-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Worker Wages & Earnings 💰</h1>
          <p>Review logged work hours, overtime differentials, tax deductions, and wage slips.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className="status-pill good" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12px" }}>
            <CheckCircle2 size={16} /> No wage records
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Base Rate</span>
            <DollarSign size={18} color="#059669" />
          </div>
          <div className="stat-value">${wageSummary.hourlyRate.toFixed(2)}/hr</div>
          <span className="stat-subtitle">Standard shift wage</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Logged Hours (Month)</span>
            <Clock size={18} color="#2563eb" />
          </div>
          <div className="stat-value">{wageSummary.hoursThisMonth} hrs</div>
          <span className="stat-subtitle">+ {wageSummary.overtimeHours} OT hours (1.5x)</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Est. Gross Earnings</span>
            <Wallet size={18} color="#d97706" />
          </div>
          <div className="stat-value">${wageSummary.grossEarnings.toLocaleString()}</div>
          <span className="stat-subtitle">Net: ${wageSummary.netPay.toLocaleString()}</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Upcoming Pay Date</span>
            <Calendar size={18} color="#7c3aed" />
          </div>
          <div className="stat-value" style={{ fontSize: "18px" }}>{wageSummary.nextPayday}</div>
          <span className="stat-subtitle">Current cycle in progress</span>
        </div>
      </div>

      {/* Wage Slip Records Table */}
      <div className="dashboard-card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={18} color="#2563eb" />
            <h3>Past Pay Slips & Settlements</h3>
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Bi-Weekly Disbursement Cycle</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                <th style={{ padding: "10px" }}>Slip ID</th>
                <th style={{ padding: "10px" }}>Pay Period</th>
                <th style={{ padding: "10px" }}>Hours (Reg / OT)</th>
                <th style={{ padding: "10px" }}>Gross Pay</th>
                <th style={{ padding: "10px" }}>Net Pay</th>
                <th style={{ padding: "10px" }}>Pay Date</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payCycles.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                    No wage records available.
                  </td>
                </tr>
              ) : (
                payCycles.map((cycle) => (
                <tr key={cycle.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 10px", fontWeight: "600", color: "#1e293b" }}>{cycle.id}</td>
                  <td style={{ padding: "12px 10px", color: "#475569" }}>{cycle.period}</td>
                  <td style={{ padding: "12px 10px" }}>
                    <span style={{ color: "#1e293b", fontWeight: "500" }}>{cycle.regularHours}h reg</span>{" "}
                    <span style={{ color: "#d97706", fontSize: "11px" }}>(+{cycle.otHours}h OT)</span>
                  </td>
                  <td style={{ padding: "12px 10px", color: "#475569" }}>{cycle.gross}</td>
                  <td style={{ padding: "12px 10px", fontWeight: "700", color: "#059669" }}>{cycle.net}</td>
                  <td style={{ padding: "12px 10px", color: "#64748b", fontSize: "12px" }}>{cycle.payDate}</td>
                  <td style={{ padding: "12px 10px" }}>
                    <span className="status-pill good">{cycle.status}</span>
                  </td>
                  <td style={{ padding: "12px 10px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button
                        className="date-button"
                        style={{ padding: "4px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        onClick={() => setSelectedCycle(cycle)}
                      >
                        <ArrowUpRight size={13} /> View
                      </button>
                      <button
                        className="date-button"
                        style={{ padding: "4px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px", background: "#f8fafc" }}
                        onClick={() => handleDownload(cycle)}
                        title="Download PDF"
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Breakdown Modal */}
      {selectedCycle && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedCycle(null)}
        >
          <div
            className="dashboard-card"
            style={{ width: "90%", maxWidth: "520px", background: "#ffffff", padding: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Payslip {selectedCycle.id}</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>{selectedCycle.period}</span>
              </div>
              <button
                onClick={() => setSelectedCycle(null)}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "#334155" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e2e8f0" }}>
                <span>Disbursement Account</span>
                <strong>{selectedCycle.account}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e2e8f0" }}>
                <span>Regular Pay ({selectedCycle.regularHours}h @ {selectedCycle.rate})</span>
                <strong>${(selectedCycle.regularHours * 28.5).toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e2e8f0" }}>
                <span>Overtime ({selectedCycle.otHours}h @ 1.5x)</span>
                <strong>${(selectedCycle.otHours * 28.5 * 1.5).toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e2e8f0" }}>
                <span>Total Gross</span>
                <strong>{selectedCycle.gross}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e2e8f0", color: "#dc2626" }}>
                <span>Estimated Deductions & Withholdings</span>
                <span>- $264.34</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "15px", fontWeight: "700", color: "#059669" }}>
                <span>Net Pay Transferred</span>
                <span>{selectedCycle.net}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button className="date-button" onClick={() => setSelectedCycle(null)}>Close</button>
              <button
                className="date-button"
                style={{ background: "#2563eb", color: "#ffffff", border: "none", display: "flex", alignItems: "center", gap: "6px" }}
                onClick={() => {
                  handleDownload(selectedCycle);
                  setSelectedCycle(null);
                }}
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WorkerWages;
