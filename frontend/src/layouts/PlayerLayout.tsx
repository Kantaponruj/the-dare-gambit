import React from "react";
import { Box, CssBaseline } from "@mui/material";
import { Outlet } from "@tanstack/react-router";

export const PlayerLayout: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#121212",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CssBaseline />
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
};
