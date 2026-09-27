import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import api from "../../services/api";

// ==========================================
// CONVERT DIFFERENT BUDGET FORMATS TO CRORES
// Mirrors backend/utils/currency.js
// ==========================================

const RUPEE_TO_CRORE_DIVISOR = 10000000;
const LARGE_UNITLESS_THRESHOLD = 100000;

const parseAmountToCrores = (amount) => {
  if (amount === null || amount === undefined) return 0;

  // Agar database mein number stored hai
  if (typeof amount === "number") {
    if (isNaN(amount)) return 0;
    // Large raw number assumed to be Indian Rupees -> convert to crores
    if (amount >= LARGE_UNITLESS_THRESHOLD) {
      return amount / RUPEE_TO_CRORE_DIVISOR;
    }
    return amount;
  }

  const str = String(amount).trim();
  if (!str) return 0;

  const hasCrUnit = /cr|crore/i.test(str);

  // Example: "₹ 15.0 Cr"
  const value = String(amount)
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .replace(/crore/gi, "")
    .replace(/cr/gi, "")
    .trim();

  const numericValue = parseFloat(value);

  if (isNaN(numericValue)) {
    return 0;
  }

  // Explicit "Cr"/"crore" unit -> already in crores
  if (hasCrUnit) {
    return numericValue;
  }

  // Large unitless value assumed to be Indian Rupees -> convert to crores
  if (numericValue >= LARGE_UNITLESS_THRESHOLD) {
    return numericValue / RUPEE_TO_CRORE_DIVISOR;
  }

  return numericValue;
};


// ==========================================
// FORMAT CRORES
// ==========================================

const formatCrores = (amount) => {
  return `₹ ${amount.toFixed(1)} Cr`;
};


function BudgetUtilization({ data }) {
  const [budgetData, setBudgetData] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0,
    utilization: 0,
  });

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // If dashboard data was passed via props, use it directly
    if (data && typeof data === "object" && Object.keys(data).length > 0) {
      const totalBudget = Number(data.totalBudget) || 0;
      const totalSpent = Number(data.totalSpent ?? data.usedBudget) || 0;
      const remaining =
        typeof data.remainingBudget === "number"
          ? data.remainingBudget
          : Math.max(totalBudget - totalSpent, 0);

      let utilization = 0;
      if (totalBudget > 0) {
        // Calculate utilization as: (usedBudget / totalBudget) * 100
        const calculated = Math.round((totalSpent / totalBudget) * 100);
        // Ensure displayed percentage cannot become nonsensical because of unit conversion (cap between 0% and 100%)
        utilization = Math.min(Math.max(calculated, 0), 100);
      }

      setBudgetData({
        totalBudget,
        totalSpent,
        remaining,
        utilization,
      });
      setLoading(false);
      return;
    }

    const fetchBudgetData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/projects");

        if (response.data.success) {
          const projects =
            response.data.data || [];

          let totalBudget = 0;
          let totalSpent = 0;


          // ==========================================
          // CALCULATE TOTAL BUDGET AND SPENT
          // ==========================================

          projects.forEach((project) => {
            const projectBudget =
              parseAmountToCrores(
                project.budget
              );

            const projectSpent =
              parseAmountToCrores(
                project.spent
              );

            totalBudget += projectBudget;

            totalSpent += projectSpent;
          });


          // Prevent spent from exceeding budget
          if (totalSpent > totalBudget) {
            totalSpent = totalBudget;
          }


          const remaining =
            Math.max(
              totalBudget - totalSpent,
              0
            );


          const utilization =
            totalBudget > 0
              ? Math.round(
                  (totalSpent / totalBudget) * 100
                )
              : 0;


          setBudgetData({
            totalBudget,
            totalSpent,
            remaining,
            utilization,
          });
        }

      } catch (error) {
        console.error(
          "Failed to fetch budget data:",
          error.response?.data ||
          error.message
        );

      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, [data]);


  // ==========================================
  // CHART DATA
  // ==========================================

  const chartData = [
    {
      name: "Used",
      value:
        budgetData.totalSpent > 0
          ? budgetData.totalSpent
          : 0,
      color: "#f59e0b",
    },

    {
      name: "Remaining",
      value:
        budgetData.remaining > 0
          ? budgetData.remaining
          : 0,
      color: "#e2e8f0",
    },
  ];


  return (
    <div className="budget-utilization-card">

      {/* HEADER */}

      <div className="chart-header">
        <div>
          <h3>Budget Utilization</h3>

          <p>
            Overall project budget overview
          </p>
        </div>

        <span className="live-data-badge">
          Live Data
        </span>
      </div>


      {loading ? (

        <div className="budget-loading">
          Loading budget data...
        </div>

      ) : (

        <div className="budget-content">


          {/* PIE CHART */}

          <div className="budget-chart-wrapper">

            <ResponsiveContainer
              width={230}
              height={230}
            >
              <PieChart>

                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={92}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={1}
                >

                  {chartData.map((entry) => (

                    <Cell
                      key={entry.name}
                      fill={entry.color}
                    />

                  ))}

                </Pie>

              </PieChart>

            </ResponsiveContainer>


            {/* CENTER TEXT */}

            <div className="budget-center-text">

              <strong>
                {budgetData.utilization}%
              </strong>

              <span>
                Budget
              </span>

              <small>
                Utilized
              </small>

            </div>

          </div>


          {/* BUDGET DETAILS */}

          <div className="budget-details">


            <div className="budget-detail-item">

              <span className="budget-dot total-dot" />

              <div>

                <p>Total Budget</p>

                <strong>
                  {formatCrores(
                    budgetData.totalBudget
                  )}
                </strong>

              </div>

            </div>


            <div className="budget-detail-item">

              <span className="budget-dot used-dot" />

              <div>

                <p>Used Budget</p>

                <strong>
                  {formatCrores(
                    budgetData.totalSpent
                  )}
                </strong>

              </div>

            </div>


            <div className="budget-detail-item">

              <span className="budget-dot remaining-dot" />

              <div>

                <p>Remaining</p>

                <strong>
                  {formatCrores(
                    budgetData.remaining
                  )}
                </strong>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default BudgetUtilization;