import ProjectProgress from "../../components/projectManager/ProjectProgress";
import BudgetUtilization from "../../components/projectManager/BudgetUtilization";
import ProjectStats from "../../components/projectManager/ProjectStats";

function PMAnalytics() {
  return (
    <>
      <div className="pm-welcome-section">
        <h1>Project Delivery & Budget Analytics 📈</h1>
        <p>Cost performance index, schedule variance, milestone burn-down, and resource curves.</p>
      </div>

      <ProjectStats />

      <div className="pm-charts-grid">
        <ProjectProgress />
        <BudgetUtilization />
      </div>
    </>
  );
}

export default PMAnalytics;
