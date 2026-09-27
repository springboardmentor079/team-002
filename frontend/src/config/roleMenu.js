// =====================================================
// CENTRALISED ROLE-BASED MENU CONFIGURATION
// =====================================================
// Single source of truth for "who can see which page".
//
// currentUser.role
//        ↓
// this file (buildMenuForRole)
//        ↓
// only the allowed menu items
//        ↓
// <Sidebar />  (one component, unchanged design)
//
// It is also read by the header search index and by the role route
// guard, so a page can never show up in the menu while its URL stays
// open to a role that should not have it.
//
// The role values are the exact ones from the User model enum
// (backend/models/User.js):
//   admin | project_manager | site_engineer | contractor | worker | client
// Every path below is a route that already exists in App.jsx -
// nothing here invents a page.
// =====================================================

// Icons whose lucide name collides with a JS/DOM global are imported
// under an `...Icon` alias. A module-level import shadows the global for
// the whole file, so importing the lucide `Map` here would have made the
// native `new Map()` in buildMenuForRole throw "Map is not a constructor".
import {
  LayoutDashboard,
  FolderKanban,
  Map as MapIcon,
  ClipboardCheck,
  ClipboardList,
  CheckSquare,
  HardHat,
  Package,
  Truck,
  Wrench,
  Users,
  ShoppingCart,
  Files,
  FileBarChart,
  ChartNoAxesCombined,
  Milestone,
  Image as ImageIcon,
  Receipt,
  FileCheck,
  Bell,
  Settings,
  Clock,
  CalendarDays,
  ShieldCheck,
  Wallet,
  Flag,
  TriangleAlert,
} from "lucide-react";

// The six roles, exactly as stored in the authenticated user record.
export const ROLES = {
  ADMIN: "admin",
  PROJECT_MANAGER: "project_manager",
  SITE_ENGINEER: "site_engineer",
  CONTRACTOR: "contractor",
  WORKER: "worker",
  CLIENT: "client",
};

export const ALL_ROLES = Object.values(ROLES);

// Role used when there is no session, or a role this build does not
// know about. Matches the fallback already used by utils/auth.js.
export const FALLBACK_ROLE = ROLES.CLIENT;

// The portal each role lives in. The paths in MODULES below are
// relative to this prefix, which is what lets one entry serve more
// than one role ("projects" -> /admin/projects, /client/projects).
const PORTAL_PREFIX = {
  [ROLES.ADMIN]: "/admin",
  [ROLES.PROJECT_MANAGER]: "/project-manager",
  [ROLES.SITE_ENGINEER]: "/site-engineer",
  [ROLES.CONTRACTOR]: "/contractor",
  [ROLES.WORKER]: "/worker",
  [ROLES.CLIENT]: "/client",
};

// The segment every role's own dashboard lives at (same targets as
// the redirect in pages/auth/Login.jsx).
const HOME_SEGMENT = "dashboard";

// =====================================================
// THE MODULE REGISTRY
// =====================================================
// One ordered list. Order here is the reading order: `buildMenuForRole`
// walks it top to bottom, drops anything the role may not see, and
// groups what is left under its section, so each role keeps exactly
// the order and the section titles it had before.
//
// Entry shape:
//   path      - route segment, relative to the role's portal prefix
//   icon      - lucide icon, unchanged from the current sidebars
//   roles     - who may see this entry
//   label     - the button text, shared by every role that sees it
//   labelFor  - { <role>: text } for the one role that words the same
//               page differently ("Overview" vs "Dashboard" on the
//               client portal)
//   section   - the sidebar section, shared by every role
//   sectionFor- { <role>: section } for the roles that place the page
//               in a different section
//
// A real route appears more than once below because roles place it in
// a different section at a different point in the list - maintenance
// is "My Maintenance" up in the worker's MAIN, "Maintenance Schedule"
// at the end of the contractor's equipment block, and "Maintenance"
// in the middle of the admin MANAGEMENT block. Every entry still
// resolves to the same existing page.
// =====================================================

const MODULES = [
  // ---------------- MAIN ----------------
  {
    path: "dashboard",
    icon: LayoutDashboard,
    roles: ALL_ROLES,
    section: "MAIN",
    label: "Dashboard",
    labelFor: { [ROLES.CLIENT]: "Overview" },
  },
  {
    path: "projects",
    icon: FolderKanban,
    roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CLIENT],
    section: "MAIN",
    label: "Projects",
    labelFor: { [ROLES.CLIENT]: "My Projects" },
  },
  {
    path: "work-orders",
    icon: ClipboardList,
    label: "Work Orders",
    roles: [ROLES.CONTRACTOR],
    section: "MAIN",
  },
  {
    path: "site-progress",
    icon: MapIcon,
    label: "Site Progress",
    roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER],
    section: "MAIN",
  },
  {
    path: "daily-reports",
    icon: ClipboardCheck,
    label: "Daily Reports",
    roles: [ROLES.SITE_ENGINEER],
    section: "MAIN",
  },
  {
    path: "tasks",
    icon: CheckSquare,
    label: "Assigned Tasks",
    roles: [ROLES.WORKER],
    section: "MAIN",
  },
  {
    path: "maintenance",
    icon: Wrench,
    label: "My Maintenance",
    roles: [ROLES.WORKER],
    section: "MAIN",
  },

  // ------- FIELD OPERATIONS (site engineer) -------
  {
    path: "milestones",
    icon: Flag,
    label: "Milestones",
    roles: [ROLES.SITE_ENGINEER],
    section: "FIELD OPERATIONS",
  },
  {
    path: "inspections",
    icon: HardHat,
    label: "Site Inspections",
    roles: [ROLES.SITE_ENGINEER],
    section: "FIELD OPERATIONS",
  },
  {
    path: "delays",
    icon: TriangleAlert,
    label: "Delay Tracking",
    roles: [ROLES.SITE_ENGINEER],
    section: "FIELD OPERATIONS",
  },

  // ------- WORKFORCE MANAGEMENT (contractor) -------
  {
    path: "attendance",
    icon: Users,
    label: "Crew Attendance",
    roles: [ROLES.CONTRACTOR],
    section: "WORKFORCE MANAGEMENT",
  },
  {
    path: "shifts",
    icon: CalendarDays,
    label: "Shift Scheduling",
    roles: [ROLES.CONTRACTOR],
    section: "WORKFORCE MANAGEMENT",
  },

  // ------- ATTENDANCE & SHIFTS (worker) -------
  {
    path: "attendance",
    icon: Clock,
    label: "Clock-in / Punch",
    roles: [ROLES.WORKER],
    section: "ATTENDANCE & SHIFTS",
  },
  {
    path: "shifts",
    icon: CalendarDays,
    label: "Weekly Schedule",
    roles: [ROLES.WORKER],
    section: "ATTENDANCE & SHIFTS",
  },

  // ------- SAFETY & PAYROLL (worker) -------
  {
    path: "safety",
    icon: ShieldCheck,
    label: "Safety & PPE Rules",
    roles: [ROLES.WORKER],
    section: "SAFETY & PAYROLL",
  },
  {
    // Own payslips only. The payroll API already narrows this response
    // to the signed-in worker, and no other role's payroll is listed
    // anywhere in the worker menu.
    path: "wages",
    icon: Wallet,
    label: "Wage Slips & Hours",
    roles: [ROLES.WORKER],
    section: "SAFETY & PAYROLL",
  },

  // ------- PROGRESS & SITE (client) -------
  {
    path: "milestones",
    icon: Milestone,
    label: "Milestone Roadmap",
    roles: [ROLES.CLIENT],
    section: "PROGRESS & SITE",
  },
  {
    path: "gallery",
    icon: ImageIcon,
    label: "Site Photo Gallery",
    roles: [ROLES.CLIENT],
    section: "PROGRESS & SITE",
  },

  // ------- FINANCIALS (client) -------
  {
    path: "payments",
    icon: Receipt,
    label: "Invoices & Payments",
    roles: [ROLES.CLIENT],
    section: "FINANCIALS",
  },
  {
    path: "reports",
    icon: FileCheck,
    label: "Quality & Handover",
    roles: [ROLES.CLIENT],
    section: "FINANCIALS",
  },

  // ------- MATERIALS & EQUIPMENT (contractor) -------
  {
    path: "material-requests",
    icon: Package,
    label: "Material Requests",
    roles: [ROLES.CONTRACTOR],
    section: "MATERIALS & EQUIPMENT",
  },
  {
    path: "equipment",
    icon: Truck,
    label: "Equipment Allocation",
    roles: [ROLES.CONTRACTOR],
    section: "MATERIALS & EQUIPMENT",
  },
  {
    path: "maintenance",
    icon: Wrench,
    label: "Maintenance Schedule",
    roles: [ROLES.CONTRACTOR],
    section: "MATERIALS & EQUIPMENT",
  },

  // ------- MACHINERY & RESOURCES (site engineer) -------
  {
    path: "equipment",
    icon: Truck,
    label: "Equipment Status",
    roles: [ROLES.SITE_ENGINEER],
    section: "MACHINERY & RESOURCES",
  },
  {
    path: "maintenance",
    icon: Wrench,
    label: "Maintenance Schedule",
    roles: [ROLES.SITE_ENGINEER],
    section: "MACHINERY & RESOURCES",
  },

  // ---------------- MANAGEMENT ----------------
  {
    path: "resources",
    icon: HardHat,
    label: "Resources",
    roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER],
    section: "MANAGEMENT",
  },
  {
    path: "inventory",
    icon: Package,
    label: "Inventory",
    roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER],
    section: "MANAGEMENT",
  },
  {
    path: "maintenance",
    icon: Wrench,
    label: "Maintenance",
    roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER],
    section: "MANAGEMENT",
  },
  {
    path: "payroll",
    icon: Wallet,
    label: "Payroll Monitoring",
    roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER],
    section: "MANAGEMENT",
  },
  {
    path: "workforce",
    icon: Users,
    label: "Workforce",
    roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER],
    section: "MANAGEMENT",
  },
  {
    path: "procurement",
    icon: ShoppingCart,
    label: "Procurement",
    roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER],
    section: "MANAGEMENT",
  },
  {
    // Admin only: there is no project-manager documents page.
    path: "documents",
    icon: Files,
    label: "Documents",
    roles: [ROLES.ADMIN],
    section: "MANAGEMENT",
  },

  // ---------------- INSIGHTS ----------------
  {
    path: "reports",
    icon: FileBarChart,
    label: "Reports",
    roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER],
    section: "INSIGHTS",
  },
  {
    path: "analytics",
    icon: ChartNoAxesCombined,
    label: "Analytics",
    roles: [ROLES.ADMIN, ROLES.PROJECT_MANAGER],
    section: "INSIGHTS",
  },
  {
    path: "notifications",
    icon: Bell,
    label: "Notifications",
    roles: ALL_ROLES,
    section: "SYSTEM",
    sectionFor: { [ROLES.ADMIN]: "INSIGHTS" },
  },
  {
    path: "settings",
    icon: Settings,
    label: "Settings",
    roles: ALL_ROLES,
    section: "SYSTEM",
  },
];

// =====================================================
// READERS
// =====================================================

// Normalises whatever is in the stored user record into one of the six
// known roles. Anything missing or unrecognised falls back to the least
// privileged role, never to admin.
export const resolveRole = (role) =>
  ALL_ROLES.includes(role) ? role : FALLBACK_ROLE;

export const getPortalPrefix = (role) => PORTAL_PREFIX[resolveRole(role)];

// The dashboard a role belongs to - used by the route guard to send a
// user to their own portal instead of the one they typed into.
export const getHomePathForRole = (role) =>
  `${PORTAL_PREFIX[resolveRole(role)]}/${HOME_SEGMENT}`;

// Resolves a shared string, letting a per-role override map win for the
// roles that name or file the page differently. Anything still undefined
// resolves to "" rather than to `undefined`.
const pick = (shared, overrides, role) => {
  if (overrides && role in overrides) return overrides[role] ?? "";
  return shared ?? "";
};

const buildItem = (module, role) => ({
  name: pick(module.label, module.labelFor, role),
  icon: module.icon,
  path: `${PORTAL_PREFIX[role]}/${module.path}`,
});

/**
 * The menu one role is allowed to see, already grouped into the
 * sections the sidebar renders:
 *   [{ section, items: [{ name, icon, path }] }]
 * The sidebar draws this with the exact markup and classes it uses
 * today - only the contents change.
 */
export const buildMenuForRole = (role) => {
  const resolved = resolveRole(role);
  const groups = [];
  const bySection = new Map();

  for (const module of MODULES) {
    if (!module.roles.includes(resolved)) continue;

    const section = pick(module.section, module.sectionFor, resolved);
    if (!section) continue;

    if (!bySection.has(section)) {
      const group = { section, items: [] };
      bySection.set(section, group);
      groups.push(group);
    }

    bySection.get(section).items.push(buildItem(module, resolved));
  }

  return groups;
};

// Flat list of the paths a role may open, used by the route guard.
const getAllowedPaths = (role) =>
  buildMenuForRole(role).flatMap((group) =>
    group.items.map((item) => item.path)
  );

/**
 * Whether `pathname` is a page this role is allowed to open.
 * A detail route such as /admin/payroll/:id counts as its list page,
 * so an allowed user can still deep-link into a record while a role
 * that has no such module never reaches the URL at all.
 */
export const isPathAllowedForRole = (role, pathname) => {
  const resolved = resolveRole(role);

  // The bare portal path is not a page; the guard sends it on to the
  // role's own dashboard.
  if (pathname === PORTAL_PREFIX[resolved]) return true;

  return getAllowedPaths(resolved).some(
    (allowed) => pathname === allowed || pathname.startsWith(`${allowed}/`)
  );
};
