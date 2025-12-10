import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ReplayIcon from "@mui/icons-material/Replay";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ShieldIcon from "@mui/icons-material/Shield";

interface TeamMember {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  score: number;
  color: string;
  image?: string;
  members?: TeamMember[];
}

interface TournamentSummaryProps {
  winner: Team | null;
  teams: Team[];
  onViewBracket: () => void;
  onPlayAgain?: () => void;
  isGM?: boolean;
}

export const TournamentSummary: React.FC<TournamentSummaryProps> = ({
  winner,
  teams,
  onViewBracket,
  onPlayAgain,
  isGM = false,
}) => {
  // Sort teams by score descending
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  // Mock key stats for now
  const getKeyStat = (index: number) => {
    const stats = [
      "Highest single round score: 150",
      "Most Truths selected: 12",
      "Fastest correct answer: 3.2s",
      "Most Dares completed: 5",
      "Longest winning streak: 3",
    ];
    return stats[index % stats.length];
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#121212",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 8,
        px: 2,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          color: "#fff",
          fontWeight: 800,
          mb: 6,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        CHAMPIONS!
      </Typography>

      {/* Winner Card */}
      {winner && (
        <Paper
          elevation={24}
          sx={{
            p: 6,
            borderRadius: 4,
            bgcolor: "#1a1a1a",
            border: "2px solid #ff8a00",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: 600,
            width: "100%",
            mb: 6,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow effect */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              bgcolor: "#ff8a00",
              boxShadow: "0 0 20px 10px rgba(255, 138, 0, 0.5)",
            }}
          />

          <EmojiEventsIcon sx={{ fontSize: 64, color: "#ff8a00", mb: 3 }} />

          <Avatar
            src={winner.image}
            sx={{
              width: 120,
              height: 120,
              bgcolor: winner.color,
              fontSize: 48,
              mb: 3,
              border: "4px solid #ff8a00",
            }}
          >
            {winner.image ? null : <ShieldIcon sx={{ fontSize: 60 }} />}
          </Avatar>

          <Typography
            variant="h3"
            sx={{ color: "#fff", fontWeight: 700, mb: 1 }}
          >
            {winner.name}
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: "rgba(255,255,255,0.7)", mb: 2, textAlign: "center" }}
          >
            {winner.members?.map((m) => m.name).join(", ") || "No members"}
          </Typography>

          <Typography variant="h6" sx={{ color: "#ff8a00", fontWeight: 600 }}>
            Congratulations to the winners!
          </Typography>
        </Paper>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={3} sx={{ mb: 8 }}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<AccountTreeIcon />}
          onClick={onViewBracket}
          sx={{
            borderColor: "rgba(255,255,255,0.2)",
            color: "#fff",
            px: 4,
            py: 1.5,
            "&:hover": {
              borderColor: "#fff",
              bgcolor: "rgba(255,255,255,0.05)",
            },
          }}
        >
          View Bracket
        </Button>
        {isGM && onPlayAgain && (
          <Button
            variant="contained"
            size="large"
            startIcon={<ReplayIcon />}
            onClick={onPlayAgain}
            sx={{
              bgcolor: "#ff8a00",
              color: "#fff",
              px: 4,
              py: 1.5,
              "&:hover": { bgcolor: "#e67e00" },
            }}
          >
            Play Again
          </Button>
        )}
      </Stack>

      {/* Leaderboard */}
      <Box sx={{ width: "100%", maxWidth: 800 }}>
        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700, mb: 3 }}>
          Tournament Leaderboard
        </Typography>

        <TableContainer
          component={Paper}
          sx={{
            bgcolor: "#1a1a1a",
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    borderBottomColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  Rank
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    borderBottomColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  Team
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    borderBottomColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  Total Score
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    borderBottomColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  Key Stat
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTeams.map((team, index) => (
                <TableRow
                  key={team.id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <TableCell sx={{ color: "#fff" }}>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={team.image}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: team.color,
                          fontSize: 14,
                        }}
                      >
                        {team.name[0]}
                      </Avatar>
                      <Typography sx={{ color: "#fff", fontWeight: 500 }}>
                        {team.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "#fff", fontWeight: 700 }}
                  >
                    {team.score}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {getKeyStat(index)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};
