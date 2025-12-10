import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Chip, Avatar } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useSocket } from "../../context/SocketContext";

interface Team {
  id: string;
  name: string;
  score: number;
}

interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  phase: string;
  winnerId: string | null;
}

interface Round {
  name: string;
  matches: Match[];
}

// Helper function to calculate rounds based on team count
const calculateRounds = (teamCount: number): string[] => {
  const roundNames: string[] = [];
  let currentTeams = teamCount;

  while (currentTeams > 1) {
    if (currentTeams === 16) roundNames.push("Round of 16");
    else if (currentTeams === 8) roundNames.push("Quarter-Finals");
    else if (currentTeams === 4) roundNames.push("Semi-Finals");
    else if (currentTeams === 2) roundNames.push("Finals");
    currentTeams = currentTeams / 2;
  }

  return roundNames;
};

// Helper function to organize matches into rounds
const organizeMatchesByRounds = (
  matches: Match[],
  teamCount: number
): Round[] => {
  const roundNames = calculateRounds(teamCount);
  const rounds: Round[] = [];

  let matchesPerRound = teamCount / 2;
  let matchIndex = 0;

  for (const roundName of roundNames) {
    const roundMatches = matches.slice(
      matchIndex,
      matchIndex + matchesPerRound
    );
    rounds.push({
      name: roundName,
      matches: roundMatches,
    });
    matchIndex += matchesPerRound;
    matchesPerRound = matchesPerRound / 2;
  }

  return rounds;
};

const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
  const isLive = match.phase !== "IDLE" && match.phase !== "FINISHED";

  const getTeamStatus = (teamId: string) => {
    if (match.winnerId === teamId) return "WINNER";
    if (match.winnerId && match.winnerId !== teamId) return "ELIMINATED";
    return null;
  };

  const TeamRow = ({ team, label }: { team: Team; label: string }) => {
    const status = getTeamStatus(team.id);
    const isWinner = status === "WINNER";
    const isEliminated = status === "ELIMINATED";

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.5,
          borderRadius: 1,
          bgcolor: isWinner
            ? "rgba(16, 185, 129, 0.15)"
            : isEliminated
            ? "rgba(255,255,255,0.02)"
            : "rgba(255,255,255,0.05)",
          border: isWinner
            ? "1px solid rgba(16, 185, 129, 0.5)"
            : "1px solid rgba(255, 255, 255, 0.1)",
          mb: 0.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: isWinner ? "success.main" : "rgba(255, 255, 255, 0.1)",
              width: 32,
              height: 32,
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {label}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: isEliminated ? "rgba(255,255,255,0.5)" : "#fff",
              }}
            >
              {team.name}
            </Typography>
            {isWinner && (
              <Chip
                icon={<EmojiEventsIcon sx={{ fontSize: 14 }} />}
                label="Winner"
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.7rem",
                  bgcolor: "success.main",
                  color: "white",
                  mt: 0.5,
                }}
              />
            )}
          </Box>
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: isEliminated ? "rgba(255,255,255,0.3)" : "text.primary",
          }}
        >
          {team.score || 0}
        </Typography>
      </Box>
    );
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 2,
        borderRadius: 2,
        bgcolor: isLive ? "rgba(249, 115, 22, 0.05)" : "transparent",
        borderColor: isLive
          ? "rgba(249, 115, 22, 0.3)"
          : "rgba(255, 255, 255, 0.1)",
      }}
    >
      {isLive && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <AccessTimeIcon sx={{ fontSize: 16, color: "primary.main" }} />
          <Typography
            variant="caption"
            sx={{ color: "primary.main", fontWeight: 600 }}
          >
            LIVE - {match.phase}
          </Typography>
        </Box>
      )}
      <TeamRow team={match.teamA} label="A" />
      <Typography
        align="center"
        variant="caption"
        sx={{ display: "block", color: "rgba(255,255,255,0.3)", my: 0.5 }}
      >
        VS
      </Typography>
      <TeamRow team={match.teamB} label="B" />
    </Paper>
  );
};

export const BracketView: React.FC = () => {
  const socket = useSocket();
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournament, setTournament] = useState<any>(null);
  const [rounds, setRounds] = useState<Round[]>([]);

  const fetchBracket = () => {
    if (socket) {
      socket.emit("tournament:get_state");
    }
  };

  useEffect(() => {
    if (!socket) return;

    fetchBracket();

    socket.on("tournament:state", (data) => {
      if (data) {
        setTournament(data);
        if (data.matches) {
          setMatches(data.matches);
          const organizedRounds = organizeMatchesByRounds(
            data.matches,
            data.maxTeams
          );
          setRounds(organizedRounds);
        }
      }
    });

    return () => {
      socket.off("tournament:state");
    };
  }, [socket]);

  if (!tournament) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="body1" color="text.secondary">
          No tournament data available
        </Typography>
      </Box>
    );
  }

  if (matches.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <EmojiEventsIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          No matches yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start the tournament to generate the bracket
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Tournament Bracket
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tournament.name} - {tournament.maxTeams} Teams
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchBracket}
          size="small"
        >
          Refresh
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 4,
          overflowX: "auto",
          pb: 2,
        }}
      >
        {rounds.map((round, roundIndex) => (
          <Box
            key={roundIndex}
            sx={{
              minWidth: 300,
              flex: "0 0 auto",
            }}
          >
            <Typography
              variant="h6"
              align="center"
              sx={{
                fontWeight: 600,
                mb: 3,
                pb: 1,
                borderBottom: "2px solid",
                borderColor: "primary.main",
              }}
            >
              {round.name}
            </Typography>
            {round.matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
            {round.matches.length === 0 && (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderStyle: "dashed",
                  bgcolor: "transparent",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Awaiting previous round
                </Typography>
              </Paper>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
