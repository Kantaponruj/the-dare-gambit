import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useSocket } from "../../context/SocketContext";

export const RevealScreen: React.FC<{ match: any }> = ({ match }) => {
  const socket = useSocket();
  const card = match.currentCard;

  const handleConfirm = () => {
    socket?.emit("game:confirm_reveal");
  };

  if (!card) return <Typography>Loading card...</Typography>;

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        THE REVEAL
      </Typography>

      <Paper
        elevation={6}
        sx={{
          maxWidth: 500,
          mx: "auto",
          p: 4,
          minHeight: 300,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          bgcolor: card.type === "TRUTH" ? "#e1f5fe" : "#fff3e0",
        }}
      >
        <Typography variant="h3" color="primary" gutterBottom>
          {card.type}
        </Typography>
        <Typography variant="h5" gutterBottom>
          {card.score} PTS
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          {card.content}
        </Typography>
      </Paper>

      <Button
        variant="contained"
        size="large"
        sx={{ mt: 4 }}
        onClick={handleConfirm}
      >
        Start Action
      </Button>
    </Box>
  );
};
