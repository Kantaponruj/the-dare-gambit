import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, Container, Paper } from "@mui/material";
import { TournamentInfo } from "../features/tournament/TournamentInfo";
import { TeamRegistration } from "../features/tournament/TeamRegistration";
import { BracketView } from "../features/tournament/BracketView";
import { useSocket } from "../context/SocketContext";

export const TournamentRoute: React.FC = () => {
  const [tab, setTab] = useState(0);
  const socket = useSocket();

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  useEffect(() => {
    if (!socket) return;

    // Fetch initial state
    socket.emit("tournament:get_state");

    const handleState = (tournament: any) => {
      if (tournament) {
        // Auto-switch to appropriate tab based on status
        if (tournament.status === "REGISTRATION" && tab === 0) {
          setTab(1); // Switch to Teams tab
        } else if (
          (tournament.status === "ACTIVE" ||
            tournament.status === "FINISHED") &&
          tab < 2
        ) {
          setTab(2); // Switch to Bracket tab
        }
      }
    };

    socket.on("tournament:state", handleState);

    return () => {
      socket.off("tournament:state");
    };
  }, [socket, tab]);

  return (
    <Box sx={{ minHeight: "100vh", pb: 6 }}>
      {/* Header */}
      <Box
        sx={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          py: 3,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Box>
            <Box sx={{ fontSize: "2rem", fontWeight: 700, mb: 0.5 }}>
              🏆 Tournament Management
            </Box>
            <Box sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
              Manage tournament settings, teams, and view the bracket
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Tabs */}
        <Paper
          variant="outlined"
          sx={{
            mb: 4,
            display: "inline-flex",
            borderRadius: 2,
          }}
        >
          <Tabs
            value={tab}
            onChange={handleChange}
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "primary.main",
              },
            }}
          >
            <Tab label="Tournament Info" sx={{ px: 3 }} />
            <Tab label="Teams" sx={{ px: 3 }} />
            <Tab label="Bracket" sx={{ px: 3 }} />
          </Tabs>
        </Paper>

        {/* Content */}
        <Box>
          {tab === 0 && <TournamentInfo />}
          {tab === 1 && <TeamRegistration />}
          {tab === 2 && <BracketView />}
        </Box>
      </Container>
    </Box>
  );
};
