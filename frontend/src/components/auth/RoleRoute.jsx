import { Navigate, useLocation } from "react-router-dom";

import { getHomePathForRole, isPathAllowedForRole } from "../../config/roleMenu";
import { hasStoredSession, useCurrentUser } from "../../utils/auth";

// Hiding a sidebar button is not authorization, so every portal route is
// also wrapped in this guard. It asks the same centralised role
// configuration the sidebar asks, which means:
//
//   - no session at all  -> /login
//   - signed in as the wrong role for this portal -> that role's own
//     dashboard (a worker typing /admin/payroll lands on /worker/dashboard)
//   - signed in as the right role, but a page that role does not have ->
//     that role's own dashboard
//
// This is the frontend half only. The authoritative check stays the
// backend's existing `protect` + `authorize` middleware, which rejects an
// unauthorized API call with 403 regardless of what is rendered here.
function RoleRoute({ allowedRoles, children }) {
  const location = useLocation();
  const currentUser = useCurrentUser();

  // No token means no session (logged out, or a fresh visitor).
  if (!hasStoredSession()) {
    return <Navigate to="/login" replace />;
  }

  // A token without a user record cannot be mapped to a role, so treat it
  // as no session rather than guessing.
  if (!currentUser?.role) {
    return <Navigate to="/login" replace />;
  }

  const ownsThisPortal = allowedRoles.includes(currentUser.role);
  const mayOpenThisPage = isPathAllowedForRole(
    currentUser.role,
    location.pathname
  );

  if (!ownsThisPortal || !mayOpenThisPage) {
    return <Navigate to={getHomePathForRole(currentUser.role)} replace />;
  }

  return children;
}

export default RoleRoute;
