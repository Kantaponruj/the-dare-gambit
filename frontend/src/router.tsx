import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { DebugBoundary } from "./components/DebugBoundary";
import { LoginPage } from "./routes/login";
import { SetupPage } from "./routes/setup";
import { GMControlPage } from "./routes/gm";
import GameDisplayPage from "./routes/display";
import { SettingsPage } from "./routes/settings";
import { AdminRoute as AdminPage } from "./routes/admin";
import { TournamentRoute as TournamentPage } from "./routes/tournament";
import { PlayPage } from "./routes/play";
import { LandingPage } from "./routes/landing";

// Layouts
import { AdminLayout } from "./layouts/AdminLayout";
import { PlayerLayout } from "./layouts/PlayerLayout";

// Providers
import { TournamentProvider } from "./features/tournament/TournamentContext";
import { SocketProvider } from "./context/SocketContext";

// Auth
import { isAuthenticated } from "./features/auth/authGuard";

// Root route now has no layout; layout applied only after auth + tournament creation.
const rootRoute = createRootRoute({
  component: () => (
    <DebugBoundary>
      <SocketProvider>
        <TournamentProvider>
          <Outlet />
        </TournamentProvider>
      </SocketProvider>
    </DebugBoundary>
  ),
  beforeLoad: ({ location }) => {
    const authenticated = isAuthenticated();
    const hasTournament = !!localStorage.getItem("tournament.config");

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login"];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    // If not authenticated and trying to access protected route, redirect to login
    if (!authenticated && !isPublicRoute) {
      throw redirect({ to: "/login" });
    }

    // If authenticated, check tournament requirement
    if (authenticated) {
      // Routes that require tournament setup
      const tournamentRequiredRoutes = [
        "/admin",
        "/settings",
        "/tournament",
        "/gm",
        "/display",
      ];
      const requiresTournament = tournamentRequiredRoutes.some((route) =>
        location.pathname.startsWith(route)
      );

      // If tournament is required but doesn't exist, redirect to setup
      if (!hasTournament && requiresTournament) {
        throw redirect({ to: "/setup" });
      }
    }
  },
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// Admin Layout Routes
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin-layout",
  component: AdminLayout,
});

const adminRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin",
  component: AdminPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/settings",
  component: SettingsPage,
});

const tournamentRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/tournament",
  component: TournamentPage,
});

const gmRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/gm",
  component: GMControlPage,
});

// Player Layout Routes
const playerLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "player-layout",
  component: PlayerLayout,
});

const displayRoute = createRoute({
  getParentRoute: () => playerLayoutRoute,
  path: "/display",
  component: GameDisplayPage,
});

// Setup Route
const setupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/setup",
  component: SetupPage,
});

const playRoute = createRoute({
  getParentRoute: () => playerLayoutRoute,
  path: "/play",
  component: PlayPage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  setupRoute,
  adminLayoutRoute.addChildren([
    adminRoute,
    settingsRoute,
    tournamentRoute,
    gmRoute,
  ]),
  playerLayoutRoute.addChildren([displayRoute, playRoute]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    auth: undefined!,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
