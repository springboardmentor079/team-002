import { useCallback, useEffect, useRef, useState } from "react";

// Small toast queue used by the maintenance module. Auto
// dismisses after TOAST_DURATION and cleans up its timers on
// unmount so a closed page never fires a state update.
export const TOAST_DURATION = 4000;

export const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Set());

  const dismissToast = useCallback((id) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  }, []);

  const pushToast = useCallback(
    (message, tone = "success") => {
      if (!message) return null;

      const id = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      setToasts((current) => [
        ...current,
        { id, message: String(message), tone },
      ]);

      const timer = setTimeout(() => {
        dismissToast(id);
        timers.current.delete(timer);
      }, TOAST_DURATION);

      timers.current.add(timer);

      return id;
    },
    [dismissToast]
  );

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    },
    []
  );

  return { toasts, pushToast, dismissToast };
};
