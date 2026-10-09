import { CircleAlert, CircleCheck, Clock3, Wrench, XCircle } from "lucide-react";

import {
  PRIORITY_TONE,
  STATUS_TONE,
} from "../../utils/maintenance";

const STATUS_ICONS = {
  Scheduled: Clock3,
  "In Progress": Wrench,
  Completed: CircleCheck,
  Overdue: CircleAlert,
  Cancelled: XCircle,
};

// Chips follow the existing status-pill / equipment-badge
// language (soft background, strong text, 6px radius).
function StatusBadge({ status = "Scheduled" }) {
  const Icon = STATUS_ICONS[status] || Clock3;
  const tone = STATUS_TONE[status] || "scheduled";

  return (
    <span className={`mnt-chip mnt-chip-${tone}`}>
      <Icon size={12} aria-hidden="true" />
      {status}
    </span>
  );
}

function PriorityBadge({ priority = "Medium" }) {
  const tone = PRIORITY_TONE[priority] || "medium";

  return (
    <span className={`mnt-chip mnt-chip-${tone}`}>
      {priority}
    </span>
  );
}

function TypeChip({ type }) {
  if (!type) return null;

  return (
    <span className="mnt-chip mnt-chip-type">
      {type}
    </span>
  );
}

export { StatusBadge, PriorityBadge, TypeChip };
