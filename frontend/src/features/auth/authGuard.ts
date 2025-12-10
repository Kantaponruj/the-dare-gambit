/**
 * Authentication guard utilities
 */

/**
 * Check if user is authenticated by checking both token and logged in flag
 */
export function isAuthenticated(): boolean {
  const hasToken = !!localStorage.getItem("auth.token");
  const isLoggedIn = localStorage.getItem("auth.loggedIn") === "1";
  return hasToken && isLoggedIn;
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuth(): void {
  localStorage.removeItem("auth.token");
  localStorage.removeItem("auth.loggedIn");
}

/**
 * Get authentication redirect path based on current state
 */
export function getAuthRedirectPath(): string {
  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return "/login";
  }

  // If authenticated but no tournament, redirect to setup
  if (!localStorage.getItem("tournament.id")) {
    return "/setup";
  }

  // Otherwise, allow access
  return "";
}
