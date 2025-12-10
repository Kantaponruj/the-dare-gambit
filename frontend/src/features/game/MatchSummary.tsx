import React from "react";
import { Box, Typography, Paper, Button, Avatar } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

interface Team {
  id: string;
  name: string;
  score: number;
  color: string;
  image?: string;
}

interface MatchSummaryProps {
  teamA: Team;
  teamB: Team;
  winnerId: string | null;
  onNextMatch?: () => void;
  isGM?: boolean;
  isTournamentWinner?: boolean;
}

export const MatchSummary: React.FC<MatchSummaryProps> = ({
  teamA,
  teamB,
  winnerId,
  onNextMatch,
  isGM = false,
  isTournamentWinner = false,
}) => {
  const winner =
    winnerId === teamA.id ? teamA : winnerId === teamB.id ? teamB : null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        p: 4,
        textAlign: "center",
      }}
    >
      <EmojiEventsIcon sx={{ fontSize: 80, color: "gold", mb: 2 }} />
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: "gold" }}>
        MATCH FINISHED
      </Typography>
      <Typography variant="h5" sx={{ mb: 2, color: "text.secondary" }}>
        Winner: {winner ? winner.name : "Draw"}
      </Typography>

      <Typography
        variant="h2"
        sx={{
          color: "gold", // Changed from #fff to gold for consistency with other titles
          fontWeight: 700,
          mb: 4,
          textTransform: "uppercase",
        }}
      >
        {isTournamentWinner ? "CHAMPIONS!" : "MATCH WINNER"}
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 4,
          mb: 6,
          width: "100%",
          maxWidth: 800,
        }}
      >
        {/* Team A */}
        <Paper
          elevation={winnerId === teamA.id ? 10 : 1}
          sx={{
            flex: 1,
            p: 4,
            borderRadius: 4,
            bgcolor:
              winnerId === teamA.id
                ? "rgba(255, 215, 0, 0.1)"
                : "background.paper",
            border:
              winnerId === teamA.id
                ? "2px solid gold"
                : "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            src={teamA.image}
            sx={{
              width: 80,
              height: 80,
              bgcolor: teamA.color,
              fontSize: 32,
              mb: 2,
            }}
          >
            {teamA.name[0]}
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {teamA.name}
          </Typography>
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, color: "primary.main" }}
          >
            {teamA.score}
          </Typography>
        </Paper>

        {/* VS */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h4" sx={{ opacity: 0.3, fontWeight: 800 }}>
            VS
          </Typography>
        </Box>

        {/* Team B */}
        <Paper
          elevation={winnerId === teamB.id ? 10 : 1}
          sx={{
            flex: 1,
            p: 4,
            borderRadius: 4,
            bgcolor:
              winnerId === teamB.id
                ? "rgba(255, 215, 0, 0.1)"
                : "background.paper",
            border:
              winnerId === teamB.id
                ? "2px solid gold"
                : "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            src={teamB.image}
            sx={{
              width: 80,
              height: 80,
              bgcolor: teamB.color,
              fontSize: 32,
              mb: 2,
            }}
          >
            {teamB.name[0]}
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {teamB.name}
          </Typography>
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, color: "primary.main" }}
          >
            {teamB.score}
          </Typography>
        </Paper>
      </Box>

      {isGM && onNextMatch && (
        <Button
          variant="contained"
          size="large"
          endIcon={<NavigateNextIcon />}
          onClick={onNextMatch}
          sx={{
            px: 6,
            py: 2,
            fontSize: "1.2rem",
            borderRadius: 50,
            background: "linear-gradient(45deg, #FFD700 30%, #FFA500 90%)",
            color: "black",
            fontWeight: 700,
            boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
          }}
        >
          Start Next Match
        </Button>
      )}
    </Box>
  );
};
