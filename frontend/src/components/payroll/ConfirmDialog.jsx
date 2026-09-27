import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

// Confirmation for the destructive payroll actions
// (delete / cancel a run). Enter confirms, Escape cancels.
function ConfirmDialog({
  open = false,
  title = "Are you sure?",
  message = "",
  confirmLabel = "Confirm",
  tone = "danger",
  busy = false,
  onConfirm = () => {},
  onCancel = () => {},
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onCancel();
      if (event.key === "Enter" && !busy) onConfirm();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () =>
      document.removeEventListener("keydown", handleKeyDown);
  }, [open, busy, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      className="pay-modal-backdrop"
      role="presentation"
      onClick={() => !busy && onCancel()}
    >
      <div
        className="pay-confirm"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <span
          className={`pay-confirm-icon ${
            tone === "danger" ? "danger" : "warning"
          }`}
        >
          <TriangleAlert size={20} aria-hidden="true" />
        </span>

        <h3>{title}</h3>

        {message ? <p>{message}</p> : null}

        <div className="pay-confirm-actions">
          <button
            type="button"
            className="pay-btn pay-btn-ghost"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="button"
            className={`pay-btn ${
              tone === "danger"
                ? "pay-btn-danger"
                : "pay-btn-primary"
            }`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
