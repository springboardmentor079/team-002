import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

// Lightweight toast stack. The project had no notification
// system for in-page feedback, so this renders the queue
// returned by the useToasts() hook (utils/toast.js).
const TONE_ICONS = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
};

const TONE_CLASS = {
  success: "mnt-toast-success",
  error: "mnt-toast-error",
  info: "mnt-toast-info",
};

function Toast({ toasts = [], onDismiss = () => {} }) {
  if (!toasts.length) return null;

  return (
    <div className="mnt-toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon =
          TONE_ICONS[toast.tone] || TONE_ICONS.info;

        return (
          <div
            key={toast.id}
            className={`mnt-toast ${TONE_CLASS[toast.tone] || TONE_CLASS.info}`}
          >
            <Icon size={16} aria-hidden="true" />

            <span>{toast.message}</span>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Toast;
