import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useSocket } from "../../context/SocketContext";

export const BuzzerScreen: React.FC<{ match: any }> = ({ match }) => {
  const socket = useSocket();

  // For MVP, let's simulate being Team A or Team B with buttons
  const handleBuzzer = (teamId: string) => {
    if (!match.buzzerLocked) {
      socket?.emit("game:buzzer", { teamId });
    }
  };

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        BUZZER ROUND
      </Typography>
      {match.currentQuestion && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            bgcolor: "#fffde7",
            maxWidth: 800,
            mx: "auto",
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            {match.currentQuestion.text}
          </Typography>
        </Paper>
      )}
      <Typography variant="h6" color="text.secondary">
        Press your buzzer!
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 4, mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            fontSize: "2rem",
          }}
          disabled={match.buzzerLocked}
          onClick={() => handleBuzzer(match.teamA.id)}
        >
          {match.teamA.name}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            fontSize: "2rem",
          }}
          disabled={match.buzzerLocked}
          onClick={() => handleBuzzer(match.teamB.id)}
        >
          {match.teamB.name}
        </Button>
      </Box>
      {match.buzzerWinnerId && (
        <Typography variant="h5" sx={{ mt: 4, color: "error.main" }}>
          LOCKED! Winner:{" "}
          {match.buzzerWinnerId === match.teamA.id
            ? match.teamA.name
            : match.teamB.name}
        </Typography>
      )}
    </Box>
  );
};
