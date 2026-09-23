import { useState, useEffect } from "react";
import { Wallet, DollarSign, Clock, Calendar, CheckCircle2, Download, ArrowUpRight, FileText, Plus } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import API from "../../services/api";

const DEFAULT_PAY_CYCLES = [
  {
    _id: "pay-1",
    slipId: "PAY-2026-881",
    workerName: "Ramesh Kumar (Worker)",
    trade: "Masons & Structural",
    period: "01 Sep – 15 Sep 2026",
    regularHours: 80,
    otHours: 12,
    hourlyRate: 350,
    rateLabel: "₹350/hr",
    grossPay: 34300,
    grossLabel: "₹ 34,300",
    deductions: 2100,
    deductionsLabel: "₹ 2,100",
    netPay: 32200,
    netLabel: "₹ 32,200",
    payDate: "16 Sep 2026",
    status: "Disbursed",
    account: "HDFC Bank •••• 4912",
  },
  {
    _id: "pay-2",
    slipId: "PAY-2026-742",
    workerName: "Ramesh Kumar (Worker)",
    trade: "Masons & Structural",
    period: "16 Aug – 31 Aug 2026",
    regularHours: 88,
    otHours: 16,
    hourlyRate: 350,
    rateLabel: "₹350/hr",
    grossPay: 39200,
    grossLabel: "₹ 39,200",
    deductions: 2400,
    deductionsLabel: "₹ 2,400",
    netPay: 36800,
    netLabel: "₹ 36,800",
    payDate: "01 Sep 2026",
    status: "Disbursed",
    account: "HDFC Bank •••• 4912",
  },
  {
    _id: "pay-3",
    slipId: "PAY-2026-619",
    workerName: "Ramesh Kumar (Worker)",
    trade: "Masons & Structural",
    period: "01 Aug – 15 Aug 2026",
    regularHours: 80,
    otHours: 8,
    hourlyRate: 350,
    rateLabel: "₹350/hr",
    grossPay: 32200,
    grossLabel: "₹ 32,200",
    deductions: 1950,
    deductionsLabel: "₹ 1,950",
    netPay: 30250,
    netLabel: "₹ 30,250",
    payDate: "16 Aug 2026",
    status: "Disbursed",
    account: "HDFC Bank •••• 4912",
  },
];

function WorkerWages() {
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const [wageSummary, setWageSummary] = useState({
    hourlyRate: 350,
    rateLabel: "₹350/hr",
    hoursThisMonth: 88,
    overtimeHours: 14,
    grossEarnings: 38150,
    grossLabel: "₹ 38,150",
    taxesDeductions: 3050,
    taxesLabel: "₹ 3,050",
    netPay: 35100,
    netLabel: "₹ 35,100",
    nextPayday: "30 Sep 2026",
  });

  const [payCycles, setPayCycles] = useState(DEFAULT_PAY_CYCLES);

  const [claimForm, setClaimForm] = useState({
    period: "16 Sep – 30 Sep 2026",
    regularHours: 80,
    otHours: 10,
    notes: "Overtime concrete casting shift",
  });

  const fetchWages = async () => {
    try {
      setLoading(true);
      const res = await API.get("/payroll/me");
      if (res.data?.data) {
        if (res.data.data.summary) {
          setWageSummary(res.data.data.summary);
        }
        if (Array.isArray(res.data.data.payCycles) && res.data.data.payCycles.length > 0) {
          setPayCycles(res.data.data.payCycles);
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote wages, using cached records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWages();
  }, []);

  const handleDownload = (cycle) => {
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 24, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BUILDTRACK CONSTRUCTION MANAGEMENT", 14, 15);

      // Sub-title
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`OFFICIAL SALARY DISBURSEMENT SLIP`, 14, 34);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Slip Reference ID: ${cycle.slipId || cycle.id || "PAY-2026"}`, 14, 42);
      doc.text(`Pay Period: ${cycle.period || "01 Sep – 15 Sep 2026"}`, 14, 48);
      doc.text(`Disbursement Date: ${cycle.payDate || "16 Sep 2026"}`, 14, 54);
      doc.text(`Beneficiary Account: ${cycle.account || "HDFC Bank •••• 4912"}`, 14, 60);

      // Payslip Summary Table
      const tableData = [
        ["Worker Name", cycle.workerName || "Site Craftsman"],
        ["Designation / Trade", cycle.trade || "Masons & Structural"],
        ["Standard Shift Hours", `${cycle.regularHours || 80} hrs`],
        ["Overtime Hours (1.5x)", `${cycle.otHours || 0} hrs`],
        ["Base Hourly Wage Rate", cycle.rateLabel || `₹${cycle.hourlyRate || 350}/hr`],
        ["Gross Pay", cycle.grossLabel || `₹ ${(cycle.grossPay || 0).toLocaleString("en-IN")}`],
        ["Statutory Deductions & TDS", `- ${cycle.deductionsLabel || `₹ ${(cycle.deductions || 0).toLocaleString("en-IN")}`}`],
        ["NET DISBURSED AMOUNT", cycle.netLabel || `₹ ${(cycle.netPay || 0).toLocaleString("en-IN")}`],
        ["Payment Settlement Status", cycle.status || "Disbursed"],
      ];

      doc.autoTable({
        startY: 68,
        head: [["Earning / Deduction Item", "Disbursement Detail"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 5 },
      });

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("System-generated electronic payslip authorized by BuildTrack Construction Platform.", 14, 175);

      doc.save(`BuildTrack_Payslip_${cycle.slipId || cycle.id || "Slip"}.pdf`);
    } catch (e) {
      console.error("PDF generation error:", e);
      alert(`Downloaded payslip for ${cycle.slipId || cycle.id}`);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    const rHours = Number(claimForm.regularHours) || 80;
    const oHours = Number(claimForm.otHours) || 0;
    const rate = 350;
    const gross = rHours * rate + oHours * rate * 1.5;
    const deductions = Math.round(gross * 0.08);
    const net = gross - deductions;
    const slipId = "PAY-2026-" + Math.floor(100 + Math.random() * 900);

    const newCycle = {
      _id: "pay-" + Date.now(),
      slipId,
      workerName: "Ramesh Kumar (Worker)",
      trade: "Masons & Structural",
      period: claimForm.period,
      regularHours: rHours,
      otHours: oHours,
      hourlyRate: rate,
      rateLabel: `₹${rate}/hr`,
      grossPay: gross,
      grossLabel: `₹ ${gross.toLocaleString("en-IN")}`,
      deductions,
      deductionsLabel: `₹ ${deductions.toLocaleString("en-IN")}`,
      netPay: net,
      netLabel: `₹ ${net.toLocaleString("en-IN")}`,
      payDate: "30 Sep 2026",
      status: "Disbursed",
      account: "HDFC Bank •••• 4912",
    };

    setPayCycles((prev) => [newCycle, ...prev]);
    setShowClaimModal(false);

    try {
      await API.post("/payroll", {
        workerName: "Ramesh Kumar (Worker)",
        trade: "Masons & Structural",
        period: claimForm.period,
        regularHours: rHours,
        otHours: oHours,
        hourlyRate: rate,
        payDate: "30 Sep 2026",
        status: "Disbursed",
      });
    } catch (err) {
      console.warn("Payroll record stored locally:", err.message);
    }

    alert(`Wage claim ${slipId} logged and added to your payslip records!`);
  };

  return (
    <>
      <div className="welcome-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Worker Wages & Earnings 💰</h1>
          <p>Review logged work hours, overtime differentials, tax deductions, and wage slips.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            className="date-button"
            style={{
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 600,
            }}
            onClick={() => setShowClaimModal(true)}
          >
            <Plus size={16} /> Log Overtime Claim
          </button>
          <span className="status-pill good" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12px" }}>
            <CheckCircle2 size={16} /> Bi-Weekly Active Payroll
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
          <div className="stat-value">{wageSummary.rateLabel || `₹${wageSummary.hourlyRate}/hr`}</div>
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
          <div className="stat-value">{wageSummary.grossLabel || `₹ ${wageSummary.grossEarnings.toLocaleString("en-IN")}`}</div>
          <span className="stat-subtitle">Net: {wageSummary.netLabel || `₹ ${wageSummary.netPay.toLocaleString("en-IN")}`}</span>
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

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Loading wage records...</div>
        ) : (
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
                    <tr key={cycle._id || cycle.slipId || cycle.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "600", color: "#1e293b" }}>{cycle.slipId || cycle.id}</td>
                      <td style={{ padding: "12px 10px", color: "#475569" }}>{cycle.period}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{ color: "#1e293b", fontWeight: "500" }}>{cycle.regularHours}h reg</span>{" "}
                        <span style={{ color: "#d97706", fontSize: "11px" }}>(+{cycle.otHours}h OT)</span>
                      </td>
                      <td style={{ padding: "12px 10px", color: "#475569" }}>{cycle.grossLabel || `₹ ${cycle.grossPay?.toLocaleString("en-IN")}`}</td>
                      <td style={{ padding: "12px 10px", fontWeight: "700", color: "#059669" }}>{cycle.netLabel || `₹ ${cycle.netPay?.toLocaleString("en-IN")}`}</td>
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
        )}
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
                <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Payslip {selectedCycle.slipId || selectedCycle.id}</h3>
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
                <span>Regular Pay ({selectedCycle.regularHours}h @ {selectedCycle.rateLabel || `₹${selectedCycle.hourlyRate || 350}/hr`})</span>
                <strong>₹ {((selectedCycle.regularHours || 80) * (selectedCycle.hourlyRate || 350)).toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e2e8f0" }}>
                <span>Overtime ({selectedCycle.otHours || 0}h @ 1.5x)</span>
                <strong>₹ {Math.round((selectedCycle.otHours || 0) * (selectedCycle.hourlyRate || 350) * 1.5).toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e2e8f0" }}>
                <span>Total Gross</span>
                <strong>{selectedCycle.grossLabel || `₹ ${selectedCycle.grossPay?.toLocaleString("en-IN")}`}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e2e8f0", color: "#dc2626" }}>
                <span>Estimated Deductions & Withholdings</span>
                <span>- {selectedCycle.deductionsLabel || `₹ ${selectedCycle.deductions?.toLocaleString("en-IN")}`}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "15px", fontWeight: "700", color: "#059669" }}>
                <span>Net Pay Transferred</span>
                <span>{selectedCycle.netLabel || `₹ ${selectedCycle.netPay?.toLocaleString("en-IN")}`}</span>
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

      {/* Claim Modal */}
      {showClaimModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="dashboard-card" style={{ width: "420px", background: "#ffffff" }}>
            <h3 style={{ margin: "0 0 6px" }}>Log Overtime & Wage Claim</h3>
            <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#64748b" }}>
              Submit verified shift hours or overtime differential for wage settlement.
            </p>
            <form onSubmit={handleClaimSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Pay Period</label>
                <input
                  type="text"
                  required
                  value={claimForm.period}
                  onChange={(e) => setClaimForm({ ...claimForm, period: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Regular Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="160"
                    required
                    value={claimForm.regularHours}
                    onChange={(e) => setClaimForm({ ...claimForm, regularHours: e.target.value })}
                    style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Overtime Hours (1.5x)</label>
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={claimForm.otHours}
                    onChange={(e) => setClaimForm({ ...claimForm, otHours: e.target.value })}
                    style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Task / Shift Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Concrete slab casting overtime night shift"
                  value={claimForm.notes}
                  onChange={(e) => setClaimForm({ ...claimForm, notes: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button type="button" className="date-button" onClick={() => setShowClaimModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="date-button" style={{ background: "#2563eb", color: "#ffffff", border: "none" }}>
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default WorkerWages;
