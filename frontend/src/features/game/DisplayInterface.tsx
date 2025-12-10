import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { Match } from "../../types/game";
import { useSocket } from "../../context/SocketContext";
import { MatchSummary } from "./MatchSummary";
import { TournamentSummary } from "../tournament/TournamentSummary";
import { useNavigate } from "@tanstack/react-router";
import { GameInstructions } from "./GameInstructions";

export const DisplayInterface: React.FC = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [timerValue, setTimerValue] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.emit("match:get_state");

    socket.on("match:state", (state) => {
      setMatch(state);
      if (state.timer !== null) {
        setTimerValue(state.timer);
      } else {
        setTimerValue(null);
      }
    });

    socket.emit("tournament:get_state");
    socket.on("tournament:state", (state) => {
      setTournament(state);
    });

    socket.on("timer:update", (val: number) => {
      setTimerValue(val);
    });

    socket.on("timer:end", () => {
      setTimerValue(0);
    });

    return () => {
      socket.off("match:state");
      socket.off("tournament:state");
      socket.off("timer:update");
      socket.off("timer:end");
    };
  }, [socket]);

  const handleCopyCode = () => {
    if (match?.gameCode) {
      navigator.clipboard.writeText(match.gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCategoryColor = (name: string) => {
    const colors = [
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
      "#2196f3",
      "#00bcd4",
      "#009688",
      "#4caf50",
      "#8bc34a",
      "#cddc39",
      "#ffeb3b",
      "#ffc107",
      "#ff9800",
      "#ff5722",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Tournament Finished
  if (tournament?.status === "FINISHED") {
    const winner = tournament.teams.reduce((prev: any, current: any) => {
      return prev.score > current.score ? prev : current;
    });

    return (
      <TournamentSummary
        winner={winner}
        teams={tournament.teams}
        onViewBracket={() => navigate({ to: "/tournament" })}
        isGM={false}
      />
    );
  }

  // Waiting for Tournament Setup
  if (!match) {
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
          p: 4,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: "#fff",
            fontWeight: 700,
            mb: 2,
            textAlign: "center",
            fontSize: { xs: "2rem", sm: "3rem" },
          }}
        >
          กำลังรอการตั้งค่าการแข่งขัน...
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
          }}
        >
          โปรดรอให้ Game Master ตั้งค่าเกม
        </Typography>
      </Box>
    );
  }

  // Pre-game: Show Room Code + QR Code
  if (match.phase === "IDLE") {
    const joinUrl = `${window.location.origin}/play`;

    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "#050201",
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(255, 138, 0, 0.15), transparent 60%),
            linear-gradient(180deg, rgba(5, 2, 1, 1) 0%, rgba(20, 10, 5, 1) 100%)
          `,
          display: "flex",
          flexDirection: "column",
          p: 4,
        }}
      >
        {/* Team Scores Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            px: 4,
          }}
        >
          <Box sx={{ textAlign: "left" }}>
            <Typography
              variant="caption"
              sx={{
                color: match.teamA.color,
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: "1rem",
                textTransform: "uppercase",
              }}
            >
              {match.teamA.name}
            </Typography>
            <Typography
              variant="h2"
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: { xs: "2.5rem", sm: "4rem" },
              }}
            >
              {match.teamA.score || 0}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{
                color: "#ff8a00",
                fontWeight: 700,
                fontSize: { xs: "1.2rem", sm: "2rem" },
              }}
            >
              VS
            </Typography>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="caption"
              sx={{
                color: match.teamB.color,
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: "1rem",
                textTransform: "uppercase",
              }}
            >
              {match.teamB.name}
            </Typography>
            <Typography
              variant="h2"
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: { xs: "2.5rem", sm: "4rem" },
              }}
            >
              {match.teamB.score || 0}
            </Typography>
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 6,
              maxWidth: 900,
              width: "100%",
              bgcolor: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: 4,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h2"
              sx={{
                color: "#fff",
                fontWeight: 700,
                mb: 1,
                textTransform: "uppercase",
                fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
              }}
            >
              เข้าร่วมเกม
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.6)",
                mb: 6,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              สแกน QR Code หรือใช้รหัสห้องเพื่อเข้าร่วม
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 6,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* QR Code Section */}
              <Box sx={{ textAlign: "center" }}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "#fff",
                    borderRadius: 3,
                    display: "inline-block",
                    boxShadow: "0 0 40px rgba(255, 138, 0, 0.3)",
                  }}
                >
                  <QRCodeSVG value={joinUrl} size={256} level="H" />
                </Paper>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.5)", mt: 2 }}
                >
                  สแกนด้วยกล้องโทรศัพท์
                </Typography>
              </Box>

              {/* Divider */}
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  borderColor: "rgba(255,255,255,0.1)",
                  display: { xs: "none", md: "block" },
                }}
              />
              <Divider
                sx={{
                  borderColor: "rgba(255,255,255,0.1)",
                  width: "80%",
                  display: { xs: "block", md: "none" },
                }}
              />

              {/* Room Code Section */}
              <Box sx={{ textAlign: "center", flex: 1 }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: "#ff8a00",
                    fontWeight: 700,
                    letterSpacing: 3,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  รหัสห้อง
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    mb: 3,
                    p: 4,
                    bgcolor: "rgba(255, 138, 0, 0.1)",
                    border: "3px solid #ff8a00",
                    borderRadius: 3,
                    position: "relative",
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      color: "#fff",
                      fontWeight: 800,
                      letterSpacing: { xs: 8, sm: 16 },
                      fontFamily: "monospace",
                      fontSize: { xs: "3rem", sm: "4rem", md: "5rem" },
                    }}
                  >
                    {match.gameCode}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                  onClick={handleCopyCode}
                  sx={{
                    bgcolor: copied ? "#4caf50" : "#ff8a00",
                    "&:hover": {
                      bgcolor: copied ? "#45a049" : "#e67e00",
                    },
                    py: 2,
                    px: 4,
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    borderRadius: 2,
                    minWidth: 200,
                  }}
                >
                  {copied ? "คัดลอกแล้ว!" : "คัดลอกรหัส"}
                </Button>

                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.5)", mt: 2 }}
                >
                  ไปที่{" "}
                  <Box
                    component="span"
                    sx={{ color: "#ff8a00", fontWeight: 600 }}
                  >
                    {window.location.origin}/play
                  </Box>
                </Typography>

                {/* How to Play Button */}
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setInstructionsOpen(true)}
                  sx={{
                    mt: 3,
                    borderColor: "#ff8a00",
                    color: "#ff8a00",
                    "&:hover": {
                      borderColor: "#e67e00",
                      bgcolor: "rgba(255, 138, 0, 0.1)",
                    },
                    py: 1.5,
                    px: 4,
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  🎮 วิธีการเล่น
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Game Instructions Dialog */}
        <GameInstructions
          open={instructionsOpen}
          onClose={() => setInstructionsOpen(false)}
        />
      </Box>
    );
  }

  // Match Finished
  if (match.phase === "FINISHED" || match.winnerId) {
    return (
      <MatchSummary
        teamA={match.teamA}
        teamB={match.teamB}
        winnerId={match.winnerId}
        isGM={false}
        isTournamentWinner={!match.nextMatchId}
      />
    );
  }

  // In-Game Display
  const teamA = match.teamA;
  const teamB = match.teamB;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "#000",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header with Scores */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: { xs: 2, sm: 3 },
          bgcolor: "#1a1a1a",
          borderBottom: "2px solid rgba(255,255,255,0.1)",
          position: "relative",
        }}
      >
        {/* Team A */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: teamA.color,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.9rem" },
            }}
          >
            {teamA.name}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              color: "#fff",
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "3rem", md: "4rem" },
            }}
          >
            {teamA.score || 0}
          </Typography>
        </Box>

        {/* Center Info */}
        <Box sx={{ textAlign: "center", px: { xs: 2, sm: 4 } }}>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.5)",
              display: "block",
              fontSize: { xs: "0.6rem", sm: "0.75rem", md: "0.9rem" },
            }}
          >
            ROUND {match.currentRound || 1}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: "#ff8a00",
              fontWeight: 700,
              fontSize: { xs: "1rem", sm: "2rem", md: "2.5rem" },
            }}
          >
            TRUTH or DARE
          </Typography>

          {/* Game Code Display */}
          <Box
            sx={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "rgba(255, 138, 0, 0.1)",
              border: "1.5px solid #ff8a00",
              borderRadius: 1.5,
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.5, sm: 0.75 },
              mt: 1,
              gap: 0.25,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.6)",
                fontSize: { xs: "0.5rem", sm: "0.6rem" },
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Code
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#ff8a00",
                fontWeight: 700,
                fontSize: { xs: "0.75rem", sm: "0.95rem" },
                letterSpacing: 2,
              }}
            >
              {match.gameCode}
            </Typography>
          </Box>
        </Box>

        {/* Team B */}
        <Box sx={{ flex: 1, textAlign: "right" }}>
          <Typography
            variant="caption"
            sx={{
              color: teamB.color,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.9rem" },
            }}
          >
            {teamB.name}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              color: "#fff",
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "3rem", md: "4rem" },
            }}
          >
            {teamB.score || 0}
          </Typography>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          overflowY: "auto",
        }}
      >
        {/* Prominent Center Timer */}
        {timerValue !== null && timerValue > 0 && (
          <Box
            sx={{
              textAlign: "center",
              animation: timerValue <= 5 ? "pulse 0.8s infinite" : "none",
            }}
          >
            <Box
              sx={{
                display: "inline-block",
              }}
            >
              {/* Glow effect background */}
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: { xs: "20px", sm: "50px", md: "100px" },
                  height: { xs: "20px", sm: "50px", md: "100px" },
                  borderRadius: "50%",
                  bgcolor: timerValue <= 5 ? "#f44336" : "#ff8a00",
                  opacity: timerValue <= 5 ? 0.3 : 0.2,
                  filter: "blur(90px)",
                  animation: timerValue <= 5 ? "pulse 0.5s infinite" : "none",
                }}
              />

              {/* Timer Number */}
              <Typography
                variant="h1"
                sx={{
                  position: "relative",
                  color: timerValue <= 5 ? "#f44336" : "#ff8a00",
                  fontWeight: 900,
                  fontFamily: "monospace",
                  fontSize: { xs: "1rem", sm: "5rem", md: "10rem" },
                  lineHeight: 1,
                  textShadow: `
                    0 0 40px ${timerValue <= 5 ? "#f44336" : "#ff8a00"},
                    0 0 80px ${timerValue <= 5 ? "#f44336" : "#ff8a00"},
                    0 0 120px ${timerValue <= 5 ? "#f44336" : "#ff8a00"}
                  `,
                  WebkitTextStroke: "3px rgba(255,255,255,0.2)",
                }}
              >
                {timerValue}
              </Typography>

              {/* "วินาที" text below */}
              <Typography
                variant="h3"
                sx={{
                  position: "relative",
                  color: "#fff",
                  fontWeight: 700,
                  mt: { xs: 1, sm: 2 },
                  fontSize: { xs: "1rem", sm: "2rem", md: "2rem" },
                  opacity: 0.9,
                  textShadow: `0 0 20px ${
                    timerValue <= 5 ? "#f44336" : "#ff8a00"
                  }`,
                  mb: { xs: 2, sm: 4, md: 6 },
                }}
              >
                วินาที
              </Typography>
            </Box>
          </Box>
        )}

        {/* Phase-specific displays */}
        {match.phase === "BUZZER" && (
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h2"
              sx={{
                color: match.buzzerLocked ? "#ff8a00" : "#fff",
                fontWeight: 700,
                fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
                mb: 2,
              }}
            >
              {match.buzzerLocked ? "🔒 BUZZER ถูกล็อค!" : "⚡ รอกดบัซเซอร์..."}
            </Typography>
            {match.buzzerWinnerId && (
              <Typography
                variant="h4"
                sx={{ color: "#ff8a00", fontWeight: 600 }}
              >
                ทีม{" "}
                {match.buzzerWinnerId === teamA.id ? teamA.name : teamB.name}{" "}
                กดก่อน!
              </Typography>
            )}
          </Box>
        )}

        {match.phase === "CATEGORY_SELECT" && (
          <Box sx={{ width: "100%", maxWidth: 1200 }}>
            <Typography
              variant="h3"
              sx={{
                color: "#fff",
                fontWeight: 700,
                textAlign: "center",
                mb: 4,
                fontSize: { xs: "2rem", sm: "3rem" },
              }}
            >
              เลือกหมวดหมู่
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(auto-fit, minmax(250px, 1fr))",
                },
                gap: 3,
              }}
            >
              {(match.availableOptions || []).map((option, index) => {
                const color = getCategoryColor(option.category);
                const isSelected =
                  match.selectedOption?.category === option.category &&
                  match.selectedOption?.difficulty === option.difficulty;
                return (
                  <Paper
                    key={index}
                    sx={{
                      p: 3,
                      bgcolor: isSelected ? `${color}20` : "#1a1a1a",
                      border: `3px solid ${color}`,
                      borderRadius: 2,
                      boxShadow: isSelected
                        ? `0 0 30px ${color}`
                        : `0 0 15px ${color}40`,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: { xs: "1.2rem", sm: "1.5rem" },
                        mb: 1,
                      }}
                    >
                      {option.category}
                    </Typography>
                    <Chip
                      label={option.difficulty}
                      sx={{
                        bgcolor:
                          option.difficulty === "EASY"
                            ? "#4caf50"
                            : option.difficulty === "MEDIUM"
                            ? "#ff9800"
                            : "#f44336",
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    />
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}

        {match.phase === "STRATEGY_SELECT" && (
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                color: "#fff",
                fontWeight: 700,
                mb: 4,
                fontSize: { xs: "2rem", sm: "3rem" },
              }}
            >
              เลือกกลยุทธ์
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={4}
              sx={{ alignItems: "center", justifyContent: "center" }}
            >
              <Paper
                sx={{
                  p: 4,
                  bgcolor: "rgba(76, 175, 80, 0.1)",
                  border: "3px solid #4caf50",
                  borderRadius: 3,
                  minWidth: 300,
                }}
              >
                <Typography
                  variant="h3"
                  sx={{ color: "#4caf50", fontWeight: 700 }}
                >
                  TRUTH
                </Typography>
                <Typography sx={{ color: "#fff", mt: 1 }}>
                  ตอบเองได้ 100%
                </Typography>
              </Paper>
              <Paper
                sx={{
                  p: 4,
                  bgcolor: "rgba(255, 138, 0, 0.1)",
                  border: "3px solid #ff8a00",
                  borderRadius: 3,
                  minWidth: 300,
                }}
              >
                <Typography
                  variant="h3"
                  sx={{ color: "#ff8a00", fontWeight: 700 }}
                >
                  DARE
                </Typography>
                <Typography sx={{ color: "#fff", mt: 1 }}>
                  ท้าคู่แข่งได้ 50%
                </Typography>
              </Paper>
            </Stack>
          </Box>
        )}

        {match.phase === "ANSWER_SELECT" && match.currentQuestion && (
          <Box sx={{ width: "100%", maxWidth: 1200 }}>
            <Paper
              sx={{
                p: 4,
                bgcolor: "#1a1a1a",
                borderRadius: 3,
                mb: 4,
                border: "2px solid rgba(255,255,255,0.1)",
              }}
            >
              <Chip
                label={match.selectedCategory || "คำถาม"}
                sx={{
                  bgcolor: getCategoryColor(match.selectedCategory || ""),
                  color: "#fff",
                  fontWeight: 600,
                  mb: 2,
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                  mb: 2,
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                {match.currentQuestion.text}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                คะแนน: {match.currentQuestion.points || 100} แต้ม
              </Typography>
            </Paper>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              {(match.currentQuestion.choices || []).map(
                (choice: string, index: number) => {
                  const isSelected = match.selectedAnswer === choice;
                  return (
                    <Paper
                      key={index}
                      sx={{
                        p: 3,
                        bgcolor: isSelected
                          ? "rgba(255, 138, 0, 0.2)"
                          : "#1a1a1a",
                        border: isSelected
                          ? "3px solid #ff8a00"
                          : "2px solid rgba(255,255,255,0.1)",
                        borderRadius: 2,
                        boxShadow: isSelected
                          ? "0 0 30px rgba(255, 138, 0, 0.3)"
                          : "none",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: { xs: "1rem", sm: "1.25rem" },
                        }}
                      >
                        {choice}
                      </Typography>
                    </Paper>
                  );
                }
              )}
            </Box>
          </Box>
        )}

        {(match.phase === "REVEAL" ||
          match.phase === "ACTION" ||
          match.phase === "ANSWER_APPROVAL") && (
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                color: "#ff8a00",
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: "1rem", sm: "2rem" },
              }}
            >
              {match.phase === "REVEAL" && "🎴 แสดงการ์ด"}
              {match.phase === "ACTION" && "🎬 กำลังแสดง"}
              {match.phase === "ANSWER_APPROVAL" && "⏳ รอการตัดสิน"}
            </Typography>
            {match.currentCard && (
              <Paper
                sx={{
                  p: 4,
                  bgcolor: "#1a1a1a",
                  borderRadius: 3,
                  maxWidth: 800,
                  border: "2px solid #ff8a00",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ color: "#fff", fontWeight: 600 }}
                >
                  {match.currentCard.text}
                </Typography>
              </Paper>
            )}
          </Box>
        )}

        {match.phase === "SCORING" && (
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                color: "#4caf50",
                fontWeight: 700,
                mb: 4,
                fontSize: { xs: "2rem", sm: "3rem" },
              }}
            >
              📊 ผลของรอบนี้
            </Typography>
            <Stack
              direction="row"
              spacing={6}
              sx={{ justifyContent: "center" }}
            >
              <Box>
                <Typography variant="h6" sx={{ color: teamA.color }}>
                  {teamA.name}
                </Typography>
                <Typography
                  variant="h2"
                  sx={{ color: "#fff", fontWeight: 700 }}
                >
                  {teamA.score}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: teamB.color }}>
                  {teamB.name}
                </Typography>
                <Typography
                  variant="h2"
                  sx={{ color: "#fff", fontWeight: 700 }}
                >
                  {teamB.score}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
};
