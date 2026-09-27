import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Receipt } from "lucide-react";

function ClientFinancialOverview({ data }) {
  const budgetData = data || {};

  const totalBudget = Number(budgetData.totalBudget) || 0;
  const totalSpent = Number(budgetData.totalSpent) || 0;
  const remainingBudget = Number(budgetData.remainingBudget) || Math.max(totalBudget - totalSpent, 0);
  const utilization =
    Number(budgetData.budgetUtilization) ||
    (totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0);

  const totalBudgetLabel = budgetData.totalBudgetLabel || `₹ ${totalBudget.toFixed(1)} Cr`;
  const totalSpentLabel = budgetData.totalSpentLabel || `₹ ${totalSpent.toFixed(1)} Cr`;
  const remainingBudgetLabel = budgetData.remainingBudgetLabel || `₹ ${remainingBudget.toFixed(1)} Cr`;

  const financialData = [
    { name: "Paid to Date", value: totalSpent, amount: totalSpentLabel, color: "#10b981" },
    { name: "Remaining Budget", value: remainingBudget, amount: remainingBudgetLabel, color: "#7c3aed" },
  ];

  return (
    <div className="dashboard-card client-financial-card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Receipt size={18} color="#10b981" />
          <h3>Investment & Expenditure</h3>
        </div>
        <span style={{ fontSize: "11px", color: "#64748b" }}>Contract Value</span>
      </div>

      <div className="project-overview-content">
        <div className="project-chart">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={financialData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={70}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {financialData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="chart-center-text">
            <strong>{totalBudgetLabel}</strong>
            <span>Total Value</span>
          </div>
        </div>

        <div className="project-legend">
          {financialData.map((item) => (
            <div className="legend-item" key={item.name}>
              <span
                className="legend-dot"
                style={{ backgroundColor: item.color }}
              />
              <span style={{ maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.name}
              </span>
              <strong>{item.amount}</strong>
              <span className="percentage">
                ({totalBudget > 0 ? Math.round(((item.value || 0) / totalBudget) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="client-payment-callout">
        <span className="callout-label">Budget Utilized:</span>
        <strong className="callout-value">{utilization}% of contract value deployed</strong>
      </div>
    </div>
  );
}

export default ClientFinancialOverview;