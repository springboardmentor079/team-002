import { useEffect } from "react";
import {
  fetchCurrentUserProfile,
  hasStoredSession,
} from "../../utils/auth";

// Restores the authenticated user's profile from the backend on every app boot.
//
// Without this, a returning session (browser refresh, reopened tab, or a photo
// changed in another tab) keeps whatever partial record was written at login
// time, and the header avatar only gets corrected once the user opens Settings.
// Fetching here means GET /auth/profile runs on app start, before any screen
// asks for it, and `setCurrentUser` pushes the result into the global auth
// state so every avatar re-renders with the stored photo.
//
// Renders nothing. Safe to mount once, at the root of the app.
export default function UserProfileSync() {
  useEffect(() => {
    // No token means no session to restore (landing page, login screen, ...).
    if (!hasStoredSession()) return;

    fetchCurrentUserProfile();
  }, []);

  return null;
}
