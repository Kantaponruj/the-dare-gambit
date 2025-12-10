import React, { useState } from "react";
import { Box, Typography, Tabs, Tab, Container, Paper } from "@mui/material";
import { CategoryManager } from "../features/admin/CategoryManager";
import { CardManager } from "../features/admin/CardManager";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

export const AdminRoute: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ minHeight: "100vh", pb: 6 }}>
      {/* Simple Header */}
      <Box
        sx={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          py: 3,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                bgcolor: "primary.main",
                borderRadius: 2,
                p: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: 28, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Manage your game content and categories
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Simple Tabs */}
        <Paper
          variant="outlined"
          sx={{
            mb: 4,
            display: "inline-flex",
            borderRadius: 2,
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "primary.main",
              },
            }}
          >
            <Tab label="Categories" sx={{ px: 3 }} />
            <Tab label="Cards" sx={{ px: 3 }} />
          </Tabs>
        </Paper>

        {/* Content */}
        <Box>
          {tabIndex === 0 && <CategoryManager />}
          {tabIndex === 1 && <CardManager />}
        </Box>
      </Container>
    </Box>
  );
};
