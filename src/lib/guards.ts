import { redirect } from "@tanstack/react-router";
import { getAccessToken, getStoredUser } from "./api";

/**
 * beforeLoad guard for protected routes.
 * Redirects to /login when no access token is stored, and to
 * /profile-setup when the cached user's profile is known to be
 * incomplete — so an incomplete profile can never reach the dashboard
 * (or any other protected page) until setup is finished.
 * Client-only: guarded routes set `ssr: false`, and getAccessToken()
 * returns null on the server without touching localStorage.
 */
export function requireAuth(): void {
  if (!getAccessToken()) {
    throw redirect({ to: "/login" });
  }
  const user = getStoredUser();
  // Only redirect on an explicit `false` — a missing/stale cached user
  // (e.g. localStorage cleared out from under an open tab) should fail
  // open here rather than loop; the page itself re-fetches /auth/me.
  if (user && user.profileComplete === false) {
    throw redirect({ to: "/profile-setup" });
  }
}

/**
 * beforeLoad guard for guest-only routes (/login, /register).
 * Redirects already-authenticated users onward — to /profile-setup if
 * their profile is still incomplete, otherwise straight to /dashboard.
 */
export function requireGuest(): void {
  if (getAccessToken()) {
    const user = getStoredUser();
    throw redirect({ to: user?.profileComplete === false ? "/profile-setup" : "/dashboard" });
  }
}

/**
 * beforeLoad guard for /profile-setup.
 * Requires login like any protected route, but — unlike requireAuth —
 * lets an incomplete profile through instead of bouncing it back here,
 * and sends an already-complete profile on to /dashboard instead of
 * showing setup again.
 */
export function requireIncompleteProfile(): void {
  if (!getAccessToken()) {
    throw redirect({ to: "/login" });
  }
  const user = getStoredUser();
  if (user && user.profileComplete !== false) {
    throw redirect({ to: "/dashboard" });
  }
}
