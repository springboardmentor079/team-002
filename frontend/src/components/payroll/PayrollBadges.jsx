import {
  Banknote,
  CircleCheck,
  CircleSlash,
  Clock3,
  HandCoins,
  Loader2,
} from "lucide-react";

import { STATUS_TONE } from "../../utils/payroll";

const STATUS_ICONS = {
  Pending: Clock3,
  Processing: HandCoins,
  Paid: CircleCheck,
  Cancelled: CircleSlash,
};

// Chips follow the existing status-pill language (soft background,
// strong text, 6px radius) so a payment status reads the same way
// everywhere it appears.
function PaymentStatusBadge({ status = "Pending" }) {
  const Icon = STATUS_ICONS[status] || Clock3;
  const tone = STATUS_TONE[status] || "pending";

  return (
    <span className={`pay-chip pay-chip-${tone}`}>
      <Icon size={12} aria-hidden="true" />
      {status}
    </span>
  );
}

function MethodChip({ method }) {
  if (!method) return null;

  return (
    <span className="pay-chip pay-chip-type">
      <Banknote size={12} aria-hidden="true" />
      {method}
    </span>
  );
}

function OutstandingChip() {
  return (
    <span className="pay-chip pay-chip-pending">
      <Clock3 size={12} aria-hidden="true" />
      Outstanding
    </span>
  );
}

function BusyIcon({ spinning }) {
  if (!spinning) return null;

  return (
    <Loader2
      size={14}
      className="pay-spin"
      aria-hidden="true"
    />
  );
}

export {
  PaymentStatusBadge,
  MethodChip,
  OutstandingChip,
  BusyIcon,
};
