import SiteProgressCategories from "../../components/siteEngineer/SiteProgressCategories";
import SiteDelayTracker from "../../components/siteEngineer/SiteDelayTracker";

function PMSiteProgress() {
  return (
    <>
      <div className="pm-welcome-section">
        <h1>Site Progress Overview 🗺️</h1>
        <p>Monitor real-time progress across all worksites and manage milestone bottlenecks.</p>
      </div>

      <div className="dashboard-grid role-grid">
        <SiteProgressCategories />
        <SiteDelayTracker />
      </div>
    </>
  );
}

export default PMSiteProgress;
