import { type ReactNode } from "react";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import {
  DashboardRounded,
  EmojiEventsRounded,
  EqualizerRounded,
  LogoutRounded,
  SettingsRounded,
  SportsEsportsRounded,
  SupervisorAccountRounded,
  TvRounded,
} from "@mui/icons-material";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  TournamentProvider,
  useTournament,
} from "../features/tournament/TournamentContext";

function usePrimaryNav() {
  const { config } = useTournament();
  return [
    {
      label: "Dashboard",
      icon: <DashboardRounded fontSize="small" />,
      to: "/",
    },
    {
      label: "Game Control",
      icon: <SportsEsportsRounded fontSize="small" />,
      to: "/control",
      disabled: !config,
    },
    {
      label: "Game Display",
      icon: <TvRounded fontSize="small" />,
      to: "/display",
      disabled: !config,
    },
    {
      label: "GM Panel",
      icon: <SupervisorAccountRounded fontSize="small" />,
      to: "/gm",
    },
    {
      label: "Tournament",
      icon: <EmojiEventsRounded fontSize="small" />,
      to: "/shows",
    },
    {
      label: "Questions",
      icon: <SportsEsportsRounded fontSize="small" />,
      to: "/questions",
    },
    {
      label: "Statistics",
      icon: <EqualizerRounded fontSize="small" />,
      disabled: true,
    },
  ];
}

const secondaryNav = [
  {
    label: "Settings",
    icon: <SettingsRounded fontSize="small" />,
    to: "/settings",
  },
  { label: "Logout", icon: <LogoutRounded fontSize="small" />, disabled: true },
];

const drawerWidth = 260;

export function AppShell() {
  const { location } = useRouterState();
  const pathname = location.pathname;
  return (
    <TournamentProvider>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: "#221c18",
          color: "text.primary",
        }}
      >
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              background: "#241e1a",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Brand />
          </Box>
          <List sx={{ px: 1 }}>
            <PrimaryNav pathname={pathname} />
          </List>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", mx: 3 }} />
          <List sx={{ px: 1 }}>
            <NavList items={secondaryNav} pathname={pathname} />
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 3, md: 5 },
            ml: { md: `${drawerWidth}px` },
            background:
              "radial-gradient(circle at top, rgba(255,138,0,0.08), transparent 60%)",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </TournamentProvider>
  );
}

function PrimaryNav({ pathname }: { pathname: string }) {
  // Now safely inside provider tree
  const items = usePrimaryNav();
  return <NavList items={items} pathname={pathname} />;
}

function Brand() {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <PaperLogo />
      <Box>
        <Typography variant="subtitle2" color="rgba(255,255,255,0.6)">
          Truth or Dare
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Control Hub
        </Typography>
      </Box>
    </Stack>
  );
}

function PaperLogo() {
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        background: "linear-gradient(135deg,#ff8a00,#ffb870)",
      }}
    />
  );
}

type NavListProps = {
  items: Array<{
    label: string;
    icon: ReactNode;
    to?: string;
    disabled?: boolean;
  }>;
  pathname: string;
};

function NavList({ items, pathname }: NavListProps) {
  return (
    <>
      {items.map((item) => {
        const active = Boolean(item.to && pathname === item.to);
        const Component = item.to ? Link : "div";
        return (
          <ListItemButton
            key={item.label}
            component={Component as any}
            to={item.to}
            disabled={item.disabled}
            selected={active}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: active ? "#ffedd5" : "rgba(255,255,255,0.75)",
              "&.Mui-selected": {
                bgcolor: "rgba(255,138,0,0.2)",
                border: "1px solid rgba(255,138,0,0.4)",
                color: "#fff",
              },
              "&:hover": {
                bgcolor: "rgba(255,138,0,0.12)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ fontWeight: active ? 600 : 500 }}
            >
              {item.label}
            </ListItemText>
          </ListItemButton>
        );
      })}
    </>
  );
}
