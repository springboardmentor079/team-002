import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Authentication
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Layouts
import AdminLayout from "./components/layout/AdminLayout";
import ProjectManagerLayout from "./components/layout/ProjectManagerLayout";
import SiteEngineerLayout from "./components/layout/SiteEngineerLayout";
import ContractorLayout from "./components/layout/ContractorLayout";
import ClientLayout from "./components/layout/ClientLayout";
import WorkerLayout from "./components/layout/WorkerLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminSiteProgress from "./pages/admin/AdminSiteProgress";
import AdminResources from "./pages/admin/AdminResources";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminWorkforce from "./pages/admin/AdminWorkforce";
import AdminProcurement from "./pages/admin/AdminProcurement";
import AdminReports from "./pages/admin/AdminReports";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";

// Project Manager Pages
import ProjectManagerDashboard from "./pages/projectManager/ProjectManagerDashboard";
import PMProjects from "./pages/projectManager/PMProjects";
import PMSiteProgress from "./pages/projectManager/PMSiteProgress";
import PMResources from "./pages/projectManager/PMResources";
import PMInventory from "./pages/projectManager/PMInventory";
import PMWorkforce from "./pages/projectManager/PMWorkforce";
import PMProcurement from "./pages/projectManager/PMProcurement";
import PMReports from "./pages/projectManager/PMReports";
import PMAnalytics from "./pages/projectManager/PMAnalytics";
import PMNotifications from "./pages/projectManager/PMNotifications";
import PMSettings from "./pages/projectManager/PMSettings";

// Site Engineer Pages
import SiteEngineerDashboard from "./pages/siteEngineer/SiteEngineerDashboard";
import SiteEngineerProgress from "./pages/siteEngineer/SiteEngineerProgress";
import SiteEngineerDailyReports from "./pages/siteEngineer/SiteEngineerDailyReports";
import SiteEngineerMilestones from "./pages/siteEngineer/SiteEngineerMilestones";
import SiteEngineerInspections from "./pages/siteEngineer/SiteEngineerInspections";
import SiteEngineerDelays from "./pages/siteEngineer/SiteEngineerDelays";
import SiteEngineerEquipment from "./pages/siteEngineer/SiteEngineerEquipment";
import SiteEngineerNotifications from "./pages/siteEngineer/SiteEngineerNotifications";
import SiteEngineerSettings from "./pages/siteEngineer/SiteEngineerSettings";

// Contractor Pages
import ContractorDashboard from "./pages/contractor/ContractorDashboard";
import ContractorWorkOrdersPage from "./pages/contractor/ContractorWorkOrdersPage";
import ContractorAttendance from "./pages/contractor/ContractorAttendance";
import ContractorShifts from "./pages/contractor/ContractorShifts";
import ContractorMaterialRequests from "./pages/contractor/ContractorMaterialRequests";
import ContractorEquipment from "./pages/contractor/ContractorEquipment";
import ContractorNotifications from "./pages/contractor/ContractorNotifications";
import ContractorSettings from "./pages/contractor/ContractorSettings";

// Client Pages
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientProjects from "./pages/client/ClientProjects";
import ClientMilestones from "./pages/client/ClientMilestones";
import ClientGallery from "./pages/client/ClientGallery";
import ClientPayments from "./pages/client/ClientPayments";
import ClientReports from "./pages/client/ClientReports";
import ClientNotifications from "./pages/client/ClientNotifications";
import ClientSettings from "./pages/client/ClientSettings";

// Worker Pages
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerTasks from "./pages/worker/WorkerTasks";
import WorkerAttendance from "./pages/worker/WorkerAttendance";
import WorkerShifts from "./pages/worker/WorkerShifts";
import WorkerSafety from "./pages/worker/WorkerSafety";
import WorkerWages from "./pages/worker/WorkerWages";
import WorkerNotifications from "./pages/worker/WorkerNotifications";
import WorkerSettings from "./pages/worker/WorkerSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin Portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="site-progress" element={<AdminSiteProgress />} />
          <Route path="resources" element={<AdminResources />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="workforce" element={<AdminWorkforce />} />
          <Route path="procurement" element={<AdminProcurement />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Project Manager Portal */}
        <Route path="/project-manager" element={<ProjectManagerLayout />}>
          <Route index element={<ProjectManagerDashboard />} />
          <Route path="dashboard" element={<ProjectManagerDashboard />} />
          <Route path="projects" element={<PMProjects />} />
          <Route path="site-progress" element={<PMSiteProgress />} />
          <Route path="resources" element={<PMResources />} />
          <Route path="inventory" element={<PMInventory />} />
          <Route path="workforce" element={<PMWorkforce />} />
          <Route path="procurement" element={<PMProcurement />} />
          <Route path="reports" element={<PMReports />} />
          <Route path="analytics" element={<PMAnalytics />} />
          <Route path="notifications" element={<PMNotifications />} />
          <Route path="settings" element={<PMSettings />} />
        </Route>

        {/* Site Engineer Portal */}
        <Route path="/site-engineer" element={<SiteEngineerLayout />}>
          <Route index element={<SiteEngineerDashboard />} />
          <Route path="dashboard" element={<SiteEngineerDashboard />} />
          <Route path="site-progress" element={<SiteEngineerProgress />} />
          <Route path="daily-reports" element={<SiteEngineerDailyReports />} />
          <Route path="milestones" element={<SiteEngineerMilestones />} />
          <Route path="inspections" element={<SiteEngineerInspections />} />
          <Route path="delays" element={<SiteEngineerDelays />} />
          <Route path="equipment" element={<SiteEngineerEquipment />} />
          <Route path="notifications" element={<SiteEngineerNotifications />} />
          <Route path="settings" element={<SiteEngineerSettings />} />
        </Route>

        {/* Contractor Portal */}
        <Route path="/contractor" element={<ContractorLayout />}>
          <Route index element={<ContractorDashboard />} />
          <Route path="dashboard" element={<ContractorDashboard />} />
          <Route path="work-orders" element={<ContractorWorkOrdersPage />} />
          <Route path="attendance" element={<ContractorAttendance />} />
          <Route path="shifts" element={<ContractorShifts />} />
          <Route path="material-requests" element={<ContractorMaterialRequests />} />
          <Route path="equipment" element={<ContractorEquipment />} />
          <Route path="notifications" element={<ContractorNotifications />} />
          <Route path="settings" element={<ContractorSettings />} />
        </Route>

        {/* Client Portal */}
        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<ClientDashboard />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="projects" element={<ClientProjects />} />
          <Route path="milestones" element={<ClientMilestones />} />
          <Route path="gallery" element={<ClientGallery />} />
          <Route path="payments" element={<ClientPayments />} />
          <Route path="reports" element={<ClientReports />} />
          <Route path="notifications" element={<ClientNotifications />} />
          <Route path="settings" element={<ClientSettings />} />
        </Route>

        {/* Worker Portal */}
        <Route path="/worker" element={<WorkerLayout />}>
          <Route index element={<WorkerDashboard />} />
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="tasks" element={<WorkerTasks />} />
          <Route path="attendance" element={<WorkerAttendance />} />
          <Route path="shifts" element={<WorkerShifts />} />
          <Route path="safety" element={<WorkerSafety />} />
          <Route path="wages" element={<WorkerWages />} />
          <Route path="notifications" element={<WorkerNotifications />} />
          <Route path="settings" element={<WorkerSettings />} />
        </Route>

        {/* Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;