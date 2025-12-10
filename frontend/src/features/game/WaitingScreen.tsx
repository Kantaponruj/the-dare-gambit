import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { keyframes } from "@emotion/react";
import type { Match } from "../../types/game";

// Define animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

interface WaitingScreenProps {
  title?: string;
  message: string;
  subtext?: string;
  match?: Match | null;
  myTeamId?: string | null;
  onChangeTeam?: () => void;
  selectedAnswer?: string | null;
  timer?: number | null; // Add timer value
}

export const WaitingScreen: React.FC<WaitingScreenProps> = ({
  message,
  subtext,
  match,
  myTeamId,
  onChangeTeam,
  selectedAnswer,
  timer,
}) => {
  const myTeam =
    match && myTeamId
      ? match.teamA.id === myTeamId
        ? match.teamA
        : match.teamB
      : null;

  // Determine which team's turn it is for display
  const currentTurnTeam = match?.currentTurnTeamId
    ? match.teamA.id === match.currentTurnTeamId
      ? match.teamA
      : match.teamB
    : null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        overflow: "hidden",
      }}
    >
      {/* Background gradient circles */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: 300,
          height: 300,
          bgcolor: "#ff8a00",
          filter: "blur(150px)",
          opacity: 0.05,
          borderRadius: "50%",
          animation: `${float} 8s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: 300,
          height: 300,
          bgcolor: "#4e9eff",
          filter: "blur(150px)",
          opacity: 0.05,
          borderRadius: "50%",
          animation: `${float} 6s ease-in-out infinite reverse`,
        }}
      />

      {/* Top: Team Info Scores - Always show when match exists */}
      {match && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: { xs: 2, sm: 3 },
            zIndex: 2,
          }}
        >
          {/* Team A */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: match.teamA.color || "#4e9eff",
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
              }}
            >
              {match.teamA.name}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: { xs: "1.75rem", sm: "3rem" },
              }}
            >
              {match.teamA.score || 0}
            </Typography>
          </Box>

          {/* Round Info */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.5)",
                display: "block",
                fontSize: { xs: "0.6rem", sm: "0.75rem" },
              }}
            >
              รอบที่ {match.currentRound || 1}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: "#ff8a00",
                fontWeight: 700,
                fontSize: { xs: "1rem", sm: "2rem" },
              }}
            >
              TRUTH or DARE
            </Typography>
          </Box>

          {/* Team B */}
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="caption"
              sx={{
                color: match.teamB.color || "#ff8a00",
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
              }}
            >
              {match.teamB.name}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: { xs: "1.75rem", sm: "3rem" },
              }}
            >
              {match.teamB.score || 0}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Center Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          maxWidth: 800,
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Team Turn Indicator */}
        {currentTurnTeam && (
          <Stack>
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                fontWeight: 700,
                mb: { xs: 2, sm: 3 },
                letterSpacing: 1,
                fontSize: { xs: "2rem", sm: "3rem" },
              }}
            >
              ทีมปัจจุบัน
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#5dd9ff",
                fontWeight: 700,
                mb: { xs: 2, sm: 3 },
                textTransform: "uppercase",
                letterSpacing: 1,
                fontSize: { xs: "0.9rem", sm: "1.25rem" },
              }}
            >
              {currentTurnTeam.name}'s TURN
            </Typography>
          </Stack>
        )}

        {/* Current Team Display & Change Button */}
        {myTeam && (
          <Box
            sx={{
              mb: 4,
              p: 2,
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              minWidth: 280,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontWeight: 600,
                }}
              >
                ทีมของคุณ
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: myTeam.color,
                  fontWeight: 700,
                  mt: 0.5,
                }}
              >
                {myTeam.name}
              </Typography>
            </Box>

            {onChangeTeam && (
              <Button
                variant="outlined"
                size="small"
                onClick={onChangeTeam}
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  borderColor: "rgba(255,255,255,0.2)",
                  "&:hover": {
                    color: "#fff",
                    borderColor: "#fff",
                    bgcolor: "rgba(255,255,255,0.05)",
                  },
                  textTransform: "none",
                  px: 3,
                }}
              >
                เปลี่ยนทีม
              </Button>
            )}
          </Box>
        )}

        {/* Timer Display */}
        {timer !== null && timer !== undefined && timer > 0 && (
          <Box
            sx={{
              mb: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: 2,
                fontSize: "0.75rem",
              }}
            >
              เหลือเวลา
            </Typography>
            <Box
              sx={{
                width: { xs: 100, sm: 120 },
                height: { xs: 100, sm: 120 },
                borderRadius: "50%",
                border: `6px solid ${timer <= 10 ? "#f44336" : "#ff8a00"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 30px ${
                  timer <= 10
                    ? "rgba(244, 67, 54, 0.5)"
                    : "rgba(255, 138, 0, 0.5)"
                }`,
                animation:
                  timer <= 10 ? `${float} 0.5s ease-in-out infinite` : "none",
                transition: "all 0.3s ease",
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "2.5rem", sm: "3.5rem" },
                  fontWeight: 800,
                  color: timer <= 10 ? "#f44336" : "#fff",
                  fontFamily: "monospace",
                }}
              >
                {timer}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Main Waiting Message */}
        <Typography
          variant="h2"
          sx={{
            color: "#fff",
            fontWeight: 700,
            mb: { xs: 3, sm: 4 },
            lineHeight: 1.2,
            fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3.5rem" },
          }}
        >
          {message}
        </Typography>

        {/* Action Required Badge */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "#ffc107",
            fontWeight: 600,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h6"
            component="span"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            ✨
          </Typography>
          <Typography
            variant="h6"
            component="span"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            ดำเนินการโดย Game Master
          </Typography>
        </Box>

        {/* Subtext if provided */}
        {subtext && (
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.5)",
              mt: 2,
              maxWidth: 500,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {subtext}
          </Typography>
        )}

        {/* Selected Answer Display */}
        {selectedAnswer && (
          <Box
            sx={{
              mt: 4,
              p: 3,
              bgcolor: "rgba(255, 138, 0, 0.1)",
              border: "1px solid #ff8a00",
              borderRadius: 2,
              textAlign: "center",
              minWidth: 300,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#ff8a00",
                textTransform: "uppercase",
                letterSpacing: 1,
                fontWeight: 700,
                mb: 1,
                display: "block",
              }}
            >
              คุณเลือก
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: "#fff",
                fontWeight: 700,
              }}
            >
              {selectedAnswer}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
