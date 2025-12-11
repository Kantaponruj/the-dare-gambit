import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Chip, Avatar } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useSocket } from "../../context/SocketContext";
import type { Match, Team } from "../../types/game";

interface Round {
  name: string;
  matches: Match[];
}

interface DisplayBracketViewProps {
  tournament?: any;
}

// Helper function to calculate rounds based on team count
const calculateRounds = (teamCount: number): string[] => {
  const roundNames: string[] = [];
  let currentTeams = teamCount;

  while (currentTeams > 1) {
    if (currentTeams === 16) roundNames.push("รอบ 16 ทีม");
    else if (currentTeams === 8) roundNames.push("รอบ 8 ทีม");
    else if (currentTeams === 4) roundNames.push("รอบรองชนะเลิศ");
    else if (currentTeams === 2) roundNames.push("🏆 รอบชิงชนะเลิศ");
    else roundNames.push(`รอบ ${currentTeams} ทีม`);
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
              bgcolor: isWinner
                ? "success.main"
                : team.color || "rgba(255, 255, 255, 0.1)",
              width: 36,
              height: 36,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {team.image || label}
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              sx={{
                fontWeight: isWinner ? 700 : 500,
                color: isEliminated ? "rgba(255,255,255,0.5)" : "#fff",
                fontSize: { xs: "1rem", sm: "1.1rem" },
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
                  height: 20,
                  fontSize: "0.75rem",
                  bgcolor: "success.main",
                  color: "white",
                  mt: 0.5,
                }}
              />
            )}
          </Box>
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: isEliminated ? "rgba(255,255,255,0.3)" : "#fff",
            minWidth: 40,
            textAlign: "right",
          }}
        >
          {team.score || 0}
        </Typography>
      </Box>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        bgcolor: isLive ? "rgba(249, 115, 22, 0.1)" : "rgba(255,255,255,0.03)",
        border: isLive
          ? "2px solid rgba(249, 115, 22, 0.5)"
          : "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: isLive ? "0 0 20px rgba(255,138,0,0.3)" : "none",
      }}
    >
      {isLive && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
            justifyContent: "center",
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 18, color: "#ff8a00" }} />
          <Typography
            variant="caption"
            sx={{ color: "#ff8a00", fontWeight: 600, fontSize: "0.9rem" }}
          >
            🔴 LIVE - {match.phase}
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

export const DisplayBracketView: React.FC<DisplayBracketViewProps> = ({
  tournament: propTournament,
}) => {
  const socket = useSocket();
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournament, setTournament] = useState<any>(propTournament);
  const [rounds, setRounds] = useState<Round[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("tournament:get_state");

    const handleState = (data: any) => {
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
    };

    socket.on("tournament:state", handleState);

    return () => {
      socket.off("tournament:state", handleState);
    };
  }, [socket]);

  if (!tournament || matches.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 2,
        }}
      >
        <EmojiEventsIcon
          sx={{ fontSize: 80, color: "rgba(255,255,255,0.2)" }}
        />
        <Typography
          variant="h4"
          sx={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}
        >
          ยังไม่มีสายแข่งขัน
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "rgba(255,255,255,0.3)", textAlign: "center" }}
        >
          กรุณารอให้ Game Master เริ่มการแข่งขัน
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            color: "#fff",
            fontWeight: 700,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
          }}
        >
          🏆 สายการแข่งขัน
        </Typography>
        <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.5)", mt: 1 }}>
          {tournament.name} - {tournament.maxTeams} ทีม
        </Typography>
      </Box>

      {/* Bracket Grid - Rounds in columns */}
      <Box
        sx={{
          display: "flex",
          gap: 4,
          overflowX: "auto",
          pb: 2,
          justifyContent: rounds.length <= 3 ? "center" : "flex-start",
        }}
      >
        {rounds.map((round, roundIndex) => (
          <Box
            key={roundIndex}
            sx={{
              minWidth: 320,
              flex: "0 0 auto",
            }}
          >
            {/* Round Header */}
            <Typography
              variant="h5"
              align="center"
              sx={{
                fontWeight: 700,
                mb: 3,
                pb: 1.5,
                borderBottom: "3px solid",
                borderColor: "#ff8a00",
                color: "#fff",
                fontSize: { xs: "1.2rem", sm: "1.4rem" },
              }}
            >
              {round.name}
            </Typography>

            {/* Matches in this round - arranged vertically */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                justifyContent: "center",
              }}
            >
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
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    รอผลรอบก่อนหน้า
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
