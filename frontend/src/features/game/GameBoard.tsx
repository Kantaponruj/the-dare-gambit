import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSocket } from "../../context/SocketContext";

export const GameBoard: React.FC<{ match: any }> = ({ match }) => {
  const socket = useSocket();
  const categories = ["General", "Music", "Movies", "Science", "History"]; // Mock categories

  const handleSelect = (category: string) => {
    socket?.emit("game:select_category", { categoryId: category });
  };

  const currentTeamName =
    match.currentTurnTeamId === match.teamA.id
      ? match.teamA.name
      : match.teamB.name;

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Select Category
      </Typography>
      <Typography variant="h6" color="primary">
        Control: {currentTeamName}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "center",
          mt: 4,
          maxWidth: 800,
          mx: "auto",
        }}
      >
        {categories.map((cat) => (
          <Box key={cat} sx={{ width: "30%" }}>
            <Button
              variant="contained"
              fullWidth
              sx={{ height: 100, fontSize: "1.2rem" }}
              onClick={() => handleSelect(cat)}
            >
              {cat}
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
