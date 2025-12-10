import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  CssBaseline,
} from "@mui/material";
import { Outlet, Link, useRouterState } from "@tanstack/react-router";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PieChartIcon from "@mui/icons-material/PieChart";

const drawerWidth = 260;

export const AdminLayout: React.FC = () => {
  const router = useRouterState();

  const menuItems = [
    { text: "Admin", icon: <DashboardIcon />, path: "/admin" },
    { text: "Tournament", icon: <EmojiEventsIcon />, path: "/tournament" },
    { text: "Game Control", icon: <SportsEsportsIcon />, path: "/gm" },
  ];

  const bottomItems = [
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
    { text: "Logout", icon: <LogoutIcon />, path: "/logout" },
  ];

  return (
    <Box sx={{ display: "flex", bgcolor: "#121212", minHeight: "100vh" }}>
      <CssBaseline />

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#1a1a1a", // Dark sidebar
            color: "#fff",
            borderRight: "1px solid rgba(255,255,255,0.05)",
          },
        }}
      >
        {/* Logo Area */}
        <Box
          sx={{ p: 3, display: "flex", alignItems: "center", gap: 2, mb: 2 }}
        >
          <PieChartIcon sx={{ color: "#ff8a00", fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1 }}>
              Truth or
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1 }}>
              Dare
            </Typography>
          </Box>
        </Box>

        <Box sx={{ overflow: "auto", flex: 1, px: 2 }}>
          <List>
            {menuItems.map((item) => {
              const isSelected = router.location.pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={isSelected}
                    sx={{
                      borderRadius: 2,
                      "&.Mui-selected": {
                        bgcolor: "#ff8a00",
                        color: "#fff",
                        "&:hover": { bgcolor: "#e67e00" },
                        "& .MuiListItemIcon-root": { color: "#fff" },
                      },
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.05)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: isSelected ? "#fff" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isSelected ? "bold" : "medium",
                        fontSize: "0.95rem",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Bottom Items */}
        <Box sx={{ p: 2 }}>
          <List>
            {bottomItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    borderRadius: 2,
                    color: "rgba(255,255,255,0.7)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.05)",
                      color: "#fff",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 0, bgcolor: "#121212", color: "#fff" }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
