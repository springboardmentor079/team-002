import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Keeps the global user state (and therefore every avatar) in sync with the
// backend on app start
import UserProfileSync from "./components/common/UserProfileSync";

// Authentication
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import LandingPage from "./pages/LandingPage";

// Hides a portal page from a role that may not have it, so the sidebar
// hiding it is backed by a route check as well.
import RoleRoute from "./components/auth/RoleRoute";
import { ROLES } from "./config/roleMenu";

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
import AdminDocuments from "./pages/admin/AdminDocuments";

// Maintenance Scheduling (shared by every role that maintains assets)
import MaintenanceList from "./pages/maintenance/MaintenanceList";
import MaintenanceDetails from "./pages/maintenance/MaintenanceDetails";

// Payroll Monitoring (admin, project manager, and the worker whose
// payslip it is - the same set the payroll API accepts)
import PayrollList from "./pages/payroll/PayrollList";
import PayrollDetails from "./pages/payroll/PayrollDetails";

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
import WorkerNotifications from "./pages/worker/WorkerNotifications";
import WorkerSettings from "./pages/worker/WorkerSettings";

function App() {
  return (
    <BrowserRouter>
      <UserProfileSync />
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin Portal */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminLayout />
            </RoleRoute>
          }
        >
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
          <Route path="documents" element={<AdminDocuments />} />
          <Route
            path="maintenance"
            element={<MaintenanceList basePath="/admin/maintenance" />}
          />
          <Route
            path="maintenance/:id"
            element={
              <MaintenanceDetails basePath="/admin/maintenance" />
            }
          />
          <Route
            path="payroll"
            element={<PayrollList basePath="/admin/payroll" />}
          />
          <Route
            path="payroll/:id"
            element={<PayrollDetails basePath="/admin/payroll" />}
          />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Project Manager Portal */}
        <Route
          path="/project-manager"
          element={
            <RoleRoute allowedRoles={[ROLES.PROJECT_MANAGER]}>
              <ProjectManagerLayout />
            </RoleRoute>
          }
        >
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
          <Route
            path="maintenance"
            element={
              <MaintenanceList basePath="/project-manager/maintenance" />
            }
          />
          <Route
            path="maintenance/:id"
            element={
              <MaintenanceDetails basePath="/project-manager/maintenance" />
            }
          />
          <Route
            path="payroll"
            element={
              <PayrollList basePath="/project-manager/payroll" />
            }
          />
          <Route
            path="payroll/:id"
            element={
              <PayrollDetails basePath="/project-manager/payroll" />
            }
          />
          <Route path="settings" element={<PMSettings />} />
        </Route>

        {/* Site Engineer Portal */}
        <Route
          path="/site-engineer"
          element={
            <RoleRoute allowedRoles={[ROLES.SITE_ENGINEER]}>
              <SiteEngineerLayout />
            </RoleRoute>
          }
        >
          <Route index element={<SiteEngineerDashboard />} />
          <Route path="dashboard" element={<SiteEngineerDashboard />} />
          <Route path="site-progress" element={<SiteEngineerProgress />} />
          <Route path="daily-reports" element={<SiteEngineerDailyReports />} />
          <Route path="milestones" element={<SiteEngineerMilestones />} />
          <Route path="inspections" element={<SiteEngineerInspections />} />
          <Route path="delays" element={<SiteEngineerDelays />} />
          <Route path="equipment" element={<SiteEngineerEquipment />} />
          <Route
            path="maintenance"
            element={
              <MaintenanceList basePath="/site-engineer/maintenance" />
            }
          />
          <Route
            path="maintenance/:id"
            element={
              <MaintenanceDetails basePath="/site-engineer/maintenance" />
            }
          />
          <Route path="notifications" element={<SiteEngineerNotifications />} />
          <Route path="settings" element={<SiteEngineerSettings />} />
        </Route>

        {/* Contractor Portal */}
        <Route
          path="/contractor"
          element={
            <RoleRoute allowedRoles={[ROLES.CONTRACTOR]}>
              <ContractorLayout />
            </RoleRoute>
          }
        >
          <Route index element={<ContractorDashboard />} />
          <Route path="dashboard" element={<ContractorDashboard />} />
          <Route path="work-orders" element={<ContractorWorkOrdersPage />} />
          <Route path="attendance" element={<ContractorAttendance />} />
          <Route path="shifts" element={<ContractorShifts />} />
          <Route path="material-requests" element={<ContractorMaterialRequests />} />
          <Route path="equipment" element={<ContractorEquipment />} />
          <Route
            path="maintenance"
            element={
              <MaintenanceList basePath="/contractor/maintenance" />
            }
          />
          <Route
            path="maintenance/:id"
            element={
              <MaintenanceDetails basePath="/contractor/maintenance" />
            }
          />
          <Route path="notifications" element={<ContractorNotifications />} />
          <Route path="settings" element={<ContractorSettings />} />
        </Route>

        {/* Client Portal */}
        <Route
          path="/client"
          element={
            <RoleRoute allowedRoles={[ROLES.CLIENT]}>
              <ClientLayout />
            </RoleRoute>
          }
        >
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
        <Route
          path="/worker"
          element={
            <RoleRoute allowedRoles={[ROLES.WORKER]}>
              <WorkerLayout />
            </RoleRoute>
          }
        >
          <Route index element={<WorkerDashboard />} />
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="tasks" element={<WorkerTasks />} />
          <Route path="attendance" element={<WorkerAttendance />} />
          <Route path="shifts" element={<WorkerShifts />} />
          <Route path="safety" element={<WorkerSafety />} />
          <Route
            path="wages"
            element={<PayrollList basePath="/worker/payroll" />}
          />
          <Route
            path="maintenance"
            element={<MaintenanceList basePath="/worker/maintenance" />}
          />
          <Route
            path="maintenance/:id"
            element={<MaintenanceDetails basePath="/worker/maintenance" />}
          />
          <Route
            path="payroll"
            element={<PayrollList basePath="/worker/payroll" />}
          />
          <Route
            path="payroll/:id"
            element={<PayrollDetails basePath="/worker/payroll" />}
          />
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