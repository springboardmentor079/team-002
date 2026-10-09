import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

// Confirmation for destructive maintenance actions
// (delete / cancel). Enter confirms, Escape cancels.
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
      className="mnt-modal-backdrop"
      role="presentation"
      onClick={() => !busy && onCancel()}
    >
      <div
        className="mnt-confirm"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <span
          className={`mnt-confirm-icon ${
            tone === "danger" ? "danger" : "warning"
          }`}
        >
          <TriangleAlert size={20} aria-hidden="true" />
        </span>

        <h3>{title}</h3>

        {message ? <p>{message}</p> : null}

        <div className="mnt-confirm-actions">
          <button
            type="button"
            className="mnt-btn mnt-btn-ghost"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="button"
            className={`mnt-btn ${
              tone === "danger"
                ? "mnt-btn-danger"
                : "mnt-btn-primary"
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
