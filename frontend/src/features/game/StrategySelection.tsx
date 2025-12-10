import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSocket } from "../../context/SocketContext";

export const StrategySelection: React.FC<{ match: any }> = ({ match }) => {
  const socket = useSocket();

  const handleSelect = (strategy: "TRUTH" | "DARE") => {
    socket?.emit("game:select_strategy", { strategy });
  };

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Choose Strategy
      </Typography>
      <Typography variant="h5" sx={{ mb: 4 }}>
        Category: {match.selectedCategory}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
        <Button
          variant="contained"
          color="info"
          size="large"
          sx={{ width: 200, height: 100, fontSize: "1.5rem" }}
          onClick={() => handleSelect("TRUTH")}
        >
          TRUTH
        </Button>
        <Button
          variant="contained"
          color="warning"
          size="large"
          sx={{ width: 200, height: 100, fontSize: "1.5rem" }}
          onClick={() => handleSelect("DARE")}
        >
          DARE
        </Button>
      </Box>
    </Box>
  );
};
