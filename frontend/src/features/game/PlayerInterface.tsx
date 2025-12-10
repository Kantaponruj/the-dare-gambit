import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import type { Match } from "../../types/game";
import { useSocket } from "../../context/SocketContext";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import { WaitingScreen } from "./WaitingScreen";
import { MatchSummary } from "./MatchSummary";
import { TournamentSummary } from "../tournament/TournamentSummary";
import { useNavigate } from "@tanstack/react-router";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { GameInstructions } from "./GameInstructions";

export const PlayerInterface: React.FC = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [timerValue, setTimerValue] = useState<number | null>(null);
  const [currentRound] = useState(1);

  const [gameCode, setGameCode] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [joinError, setJoinError] = useState("");
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

    socket.on(
      "game:code_result",
      (result: { success: boolean; error?: string }) => {
        if (result.success) {
          setHasJoined(true);
          setJoinError("");
        } else {
          setJoinError(result.error || "Invalid code");
        }
      }
    );

    return () => {
      socket.off("match:state");
      socket.off("tournament:state");
      socket.off("timer:update");
      socket.off("timer:end");
      socket.off("game:code_result");
    };
  }, [socket]);

  // Team Selection (if not set)
  useEffect(() => {
    const savedTeamId = localStorage.getItem("playerTeamId");
    if (savedTeamId) {
      setMyTeamId(savedTeamId);
    }
  }, []);

  const handleJoinGame = () => {
    if (!gameCode || gameCode.length !== 6) {
      setJoinError("กรุณากรอกรหัส 6 หลักให้ถูกต้อง");
      return;
    }
    socket?.emit("game:check_code", { code: gameCode });
  };

  const handleTeamSelect = (teamId: string) => {
    setMyTeamId(teamId);
    localStorage.setItem("playerTeamId", teamId);
  };

  const handleChangeTeam = () => {
    setMyTeamId(null);
    localStorage.removeItem("playerTeamId");
  };

  const handleBuzzer = () => {
    if (myTeamId && socket) {
      socket.emit("game:buzzer", { teamId: myTeamId });
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (socket) {
      socket.emit("game:select_answer", { answer });
    }
  };

  const handleSelectOption = (option: {
    category: string;
    difficulty: string;
  }) => {
    if (socket) {
      socket.emit("game:select_option", option);
    }
  };

  const handleStrategySelect = (strategy: "TRUTH" | "DARE") => {
    if (socket) {
      socket.emit("game:select_strategy", { strategy });
    }
  };

  // 0. Tournament Finished
  if (tournament?.status === "FINISHED") {
    // Find winner
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

  // 1. Waiting for Tournament Setup (No match data at all)
  if (!match) {
    return (
      <>
        {/* Help Icon Button - Floating */}
        <Button
          onClick={() => setInstructionsOpen(true)}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
            minWidth: "auto",
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: "rgba(255, 138, 0, 0.9)",
            color: "#fff",
            "&:hover": {
              bgcolor: "#ff8a00",
              transform: "scale(1.1)",
            },
            transition: "all 0.3s",
            boxShadow: "0 4px 20px rgba(255, 138, 0, 0.4)",
          }}
        >
          <HelpOutlineIcon sx={{ fontSize: "2rem" }} />
        </Button>

        <WaitingScreen
          message="กำลังรอการตั้งค่าการแข่งขัน..."
          subtext="รอให้ Game Master ตั้งค่าการแข่งขัน"
          myTeamId={myTeamId}
          match={match}
          onChangeTeam={handleChangeTeam}
        />

        {/* Game Instructions Dialog */}
        <GameInstructions
          open={instructionsOpen}
          onClose={() => setInstructionsOpen(false)}
        />
      </>
    );
  }

  // 2. Game Code Entry Screen (Before Team Selection)
  if (!hasJoined) {
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
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            maxWidth: 400,
            width: "100%",
            bgcolor: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: 4,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              fontWeight: 700,
              mb: 1,
              textTransform: "uppercase",
            }}
          >
            เข้าร่วมเกม
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.6)", mb: 4 }}
          >
            กรอกรหัส 6 หลักจาก Game Master
          </Typography>

          <Box sx={{ mb: 3 }}>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={gameCode}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setGameCode(val);
                setJoinError("");
              }}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "2rem",
                fontWeight: "bold",
                textAlign: "center",
                letterSpacing: "8px",
                color: "#ff8a00",
                backgroundColor: "rgba(0,0,0,0.3)",
                border: joinError
                  ? "2px solid #f44336"
                  : "2px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                outline: "none",
                fontFamily: "monospace",
              }}
            />
            {joinError && (
              <Typography
                variant="caption"
                sx={{ color: "#f44336", mt: 1, display: "block" }}
              >
                {joinError}
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleJoinGame}
            disabled={gameCode.length !== 6}
            sx={{
              bgcolor: "#ff8a00",
              "&:hover": { bgcolor: "#e67e00" },
              py: 2,
              fontSize: "1.1rem",
              fontWeight: 700,
              borderRadius: 2,
              "&.Mui-disabled": {
                bgcolor: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.3)",
              },
            }}
          >
            เข้าห้อง
          </Button>
        </Paper>
      </Box>
    );
  }

  // Team Selection Screen
  if (!myTeamId) {
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
          p: 2,
          m: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxHeight: "100%",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Paper
            sx={{
              p: { xs: 2, sm: 4 },
              maxWidth: 600,
              width: "100%",
              bgcolor: "#1a1a1a",
              borderRadius: 3,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "#fff",
                mb: 3,
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              เลือกทีมของคุณ
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleTeamSelect(match.teamA.id)}
                sx={{
                  bgcolor: match.teamA.color || "#ff8a00",
                  "&:hover": { bgcolor: match.teamA.color || "#e67e00" },
                  py: { xs: 2, sm: 3 },
                  fontSize: { xs: "1.1rem", sm: "1.5rem" },
                  fontWeight: 700,
                }}
              >
                {match.teamA.name}
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleTeamSelect(match.teamB.id)}
                sx={{
                  bgcolor: match.teamB.color || "#3b82f6",
                  "&:hover": { bgcolor: match.teamB.color || "#2563eb" },
                  py: { xs: 2, sm: 3 },
                  fontSize: { xs: "1.1rem", sm: "1.5rem" },
                  fontWeight: 700,
                }}
              >
                {match.teamB.name}
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    );
  }

  const myTeam = match.teamA.id === myTeamId ? match.teamA : match.teamB;
  const opponentTeam = match.teamA.id === myTeamId ? match.teamB : match.teamA;
  const isMyTurn = match.currentTurnTeamId === myTeamId;
  const isMyTeamAnswering = match.answeringTeamId === myTeamId;

  // FINISHED Screen
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

  // Category Selection Screen
  if (match.phase === "CATEGORY_SELECT" && isMyTurn) {
    // const categories = match.availableCategories || [];

    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "#000",
          display: "flex",
          flexDirection: "column",
          m: 0,
          overflow: "hidden",
        }}
      >
        <Box sx={{ width: "100%", height: "100%", overflowY: "auto", p: 3 }}>
          {/* Header with Scores */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: { xs: 2, sm: 4 },
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: myTeam.color,
                  fontWeight: 700,
                  letterSpacing: 1,
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                }}
              >
                {myTeam.name} {myTeam.id === myTeamId && "(YOU)"}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", sm: "3rem" },
                }}
              >
                {myTeam.score}
              </Typography>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: { xs: "0.6rem", sm: "0.75rem" },
                }}
              >
                รอบที่ {currentRound}
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

            <Box sx={{ textAlign: "right" }}>
              <Typography
                variant="caption"
                sx={{
                  color: opponentTeam.color,
                  fontWeight: 700,
                  letterSpacing: 1,
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                }}
              >
                {opponentTeam.name}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", sm: "3rem" },
                }}
              >
                {opponentTeam.score}
              </Typography>
            </Box>
          </Box>

          {/* Title */}
          <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 4 } }}>
            <Typography
              variant="h6"
              sx={{
                color: myTeam.color,
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: "0.9rem", sm: "1.25rem" },
              }}
            >
              เทิร์นของ {myTeam.name}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "3rem" },
              }}
            >
              เลือกหมวดหมู่
            </Typography>
          </Box>

          {/* Category Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(auto-fit, minmax(200px, 1fr))",
              },
              gap: { xs: 1.5, sm: 2 },
              maxWidth: 1000,
              mx: "auto",
            }}
          >
            {(match.availableOptions || []).map((option, index) => {
              const color = getCategoryColor(option.category);
              return (
                <Paper
                  key={index}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    bgcolor: "#1a1a1a",
                    color: "#fff",
                    borderRadius: 2,
                    border: `3px solid ${color}`,
                    boxShadow: `0 0 15px ${color}40`,
                    textAlign: "center",
                    minHeight: { xs: 80, sm: 100 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: `0 0 25px ${color}60`,
                    },
                  }}
                  onClick={() => handleSelectOption(option)}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1rem", sm: "1.2rem" },
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
      </Box>
    );
  }

  // Strategy Selection Screen (TRUTH or DARE)
  if (match.phase === "STRATEGY_SELECT" && isMyTurn) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "#000",
          display: "flex",
          flexDirection: "column",
          m: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            overflowY: "auto",
            p: { xs: 2, sm: 3 },
          }}
        >
          {/* Header with Scores */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: { xs: 2, sm: 4 },
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: myTeam.color,
                  fontWeight: 700,
                  letterSpacing: 1,
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                }}
              >
                {myTeam.name} {myTeam.id === myTeamId && "(YOU)"}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", sm: "3rem" },
                }}
              >
                {myTeam.score}
              </Typography>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: { xs: "0.6rem", sm: "0.75rem" },
                }}
              >
                รอบที่ {currentRound}
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

            <Box sx={{ textAlign: "right" }}>
              <Typography
                variant="caption"
                sx={{
                  color: opponentTeam.color,
                  fontWeight: 700,
                  letterSpacing: 1,
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                }}
              >
                {opponentTeam.name}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", sm: "3rem" },
                }}
              >
                {opponentTeam.score}
              </Typography>
            </Box>
          </Box>

          {/* Title */}
          <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 4 } }}>
            <Typography
              variant="h6"
              sx={{
                color: myTeam.color,
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: "0.9rem", sm: "1.25rem" },
              }}
            >
              เทิร์นของ {myTeam.name}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: "#fff",
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: "1.5rem", sm: "3rem" },
              }}
            >
              เลือกกลยุทธ์ของคุณ
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.6)",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              คุณจะตอบคำถามเอง หรือท้าคู่แข่ง?
            </Typography>
          </Box>

          {/* Strategy Options */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: { xs: 2, sm: 3 },
              maxWidth: 1200,
              mx: "auto",
              width: "100%",
              px: { xs: 0, sm: 2 },
            }}
          >
            {/* TRUTH Option */}
            <Paper
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                bgcolor: "#1a1a1a",
                border: "2px solid #4caf50",
                borderRadius: 3,
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  bgcolor: "rgba(76, 175, 80, 0.1)",
                  transform: "scale(1.02)",
                  boxShadow: "0 0 40px rgba(76, 175, 80, 0.3)",
                },
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
              onClick={() => handleStrategySelect("TRUTH")}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: { xs: 1.5, sm: 2 },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 48, sm: 60 },
                    height: { xs: 48, sm: 60 },
                    borderRadius: "50%",
                    bgcolor: "#4caf50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: { xs: 1.5, sm: 2 },
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: { xs: "1.5rem", sm: "2rem" },
                    }}
                  >
                    T
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: "#4caf50",
                      fontWeight: 700,
                      fontSize: { xs: "1.5rem", sm: "2rem" },
                    }}
                  >
                    TRUTH
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    เลือกตอบเอง
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2, borderColor: "rgba(76, 175, 80, 0.3)" }} />
              <Typography variant="body1" sx={{ color: "#fff", mb: 2 }}>
                <strong>บทบาทของคุณ:</strong> ทีมของคุณต้องตอบคำถามเอง
              </Typography>
              <Typography variant="body1" sx={{ color: "#fff", mb: 2 }}>
                <strong>บทบาทของคู่แข่ง:</strong> อยู่เฉยๆ ไม่ได้คะแนน
              </Typography>
              <Box
                sx={{
                  bgcolor: "rgba(76, 175, 80, 0.2)",
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid #4caf50",
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#4caf50", fontWeight: 700, mb: 1 }}
                >
                  📊 การให้คะแนน:
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  ✅ ตอบถูก: ได้ <strong>100%</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  ❌ ตอบผิด: ได้ <strong>0 คะแนน</strong>
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  fontStyle: "italic",
                  mt: "auto",
                }}
              >
                💡 รางวัลสูง แต่เสี่ยงมาก!
              </Typography>
            </Paper>

            {/* DARE Option */}
            <Paper
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                bgcolor: "#1a1a1a",
                border: "2px solid #ff8a00",
                borderRadius: 3,
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  bgcolor: "rgba(255, 138, 0, 0.1)",
                  transform: "scale(1.02)",
                  boxShadow: "0 0 40px rgba(255, 138, 0, 0.3)",
                },
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
              onClick={() => handleStrategySelect("DARE")}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: { xs: 1.5, sm: 2 },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 48, sm: 60 },
                    height: { xs: 48, sm: 60 },
                    borderRadius: "50%",
                    bgcolor: "#ff8a00",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: { xs: 1.5, sm: 2 },
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: { xs: "1.5rem", sm: "2rem" },
                    }}
                  >
                    D
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: "#ff8a00",
                      fontWeight: 700,
                      fontSize: { xs: "1.5rem", sm: "2rem" },
                    }}
                  >
                    DARE
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    ท้าให้อีกฝ่ายตอบ
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2, borderColor: "rgba(255, 138, 0, 0.3)" }} />
              <Typography variant="body1" sx={{ color: "#fff", mb: 2 }}>
                <strong>บทบาทของคุณ:</strong> ผลักความเสี่ยงให้คู่แข่ง
              </Typography>
              <Typography variant="body1" sx={{ color: "#fff", mb: 2 }}>
                <strong>บทบาทของคู่แข่ง:</strong> ต้องรับคำถาม/กิจกรรม
              </Typography>
              <Box
                sx={{
                  bgcolor: "rgba(255, 138, 0, 0.2)",
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid #ff8a00",
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#ff8a00", fontWeight: 700, mb: 1 }}
                >
                  📊 การให้คะแนน:
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  ✅ คู่แข่งสำเร็จ: คุณได้ <strong>0</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  ❌ คู่แข่งล้มเหลว: คุณได้ <strong>50%</strong>
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  fontStyle: "italic",
                  mt: "auto",
                }}
              >
                💡 คะแนนไม่เต็ม แต่ได้ฟรี!
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  }

  // Buzzer Screen (only if buzzer is enabled in tournament)
  if (match.phase === "BUZZER" && tournament?.buzzerEnabled !== false) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "#000",
          display: "flex",
          flexDirection: "column",
          m: 0,
          overflow: "hidden",
        }}
      >
        {/* Header with Scores */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 3,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{ color: myTeam.color, fontWeight: 700, letterSpacing: 1 }}
            >
              {myTeam.name} {myTeam.id === myTeamId && "(YOU)"}
            </Typography>
            <Typography variant="h3" sx={{ color: "#fff", fontWeight: 700 }}>
              {myTeam.score}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.5)" }}
            >
              รอบที่ {currentRound}
            </Typography>
            <Typography variant="h4" sx={{ color: "#ff8a00", fontWeight: 700 }}>
              TRUTH or DARE
            </Typography>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="caption"
              sx={{
                color: opponentTeam.color,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              {opponentTeam.name}
            </Typography>
            <Typography variant="h3" sx={{ color: "#fff", fontWeight: 700 }}>
              {opponentTeam.score}
            </Typography>
          </Box>
        </Box>

        {/* Main Buzzer Area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            px: 4,
          }}
        >
          {match.buzzerLocked ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h2"
                sx={{
                  color: "#ff8a00",
                  fontWeight: 700,
                  mb: 2,
                  animation: "pulse 1s infinite",
                }}
              >
                กดได้!
              </Typography>
              <Typography variant="h5" sx={{ color: "rgba(255,255,255,0.7)" }}>
                {match.buzzerWinnerId === match.teamA.id
                  ? match.teamA.name
                  : match.teamB.name}{" "}
                ได้เป็นคนแรก!
              </Typography>
            </Box>
          ) : (
            <>
              <Typography
                variant="h3"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  mb: 4,
                  textAlign: "center",
                }}
              >
                พร้อมเริ่มต้น?
              </Typography>

              {/* Buzzer Button */}
              <Button
                onClick={handleBuzzer}
                sx={{
                  width: { xs: 200, sm: 300 },
                  height: { xs: 200, sm: 300 },
                  borderRadius: "50%",
                  bgcolor: myTeam.color || "#ff8a00",
                  "&:hover": {
                    bgcolor: myTeam.color || "#e67e00",
                    transform: "scale(1.05)",
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                  boxShadow: `0 0 60px ${myTeam.color || "#ff8a00"}`,
                  transition: "all 0.2s",
                }}
              >
                <FlashOnIcon
                  sx={{
                    fontSize: { xs: 80, sm: 120 },
                    color: "#fff",
                  }}
                />
              </Button>

              <Typography
                variant="h5"
                sx={{ color: "rgba(255,255,255,0.7)", mt: 4, fontWeight: 600 }}
              >
                ถ้าคุณต้องการตอบคำถาม คลิกที่ปุ่มนี้!
              </Typography>
            </>
          )}
        </Box>

        {/* Timer */}
        {timerValue !== null && timerValue > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 20,
              right: 20,
              bgcolor: "rgba(0,0,0,0.7)",
              borderRadius: 2,
              px: 3,
              py: 1,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                color: timerValue <= 5 ? "#ff8a00" : "#fff",
              }}
            >
              {timerValue}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // Waiting Screen (for various phases when not player's action)
  if (
    (match.phase === "STRATEGY_SELECT" && !isMyTurn) ||
    (match.phase === "ANSWER_SELECT" && !isMyTeamAnswering) ||
    match.phase === "ANSWER_APPROVAL" ||
    (match.phase === "ACTION" && !isMyTurn) ||
    (match.phase === "CATEGORY_SELECT" && !isMyTurn)
  ) {
    const getPhaseMessage = () => {
      switch (match.phase) {
        case "CATEGORY_SELECT":
          return "เลือกหมวดหมู่...";
        case "STRATEGY_SELECT":
          return "ทีมกำลังวางแผน...";
        case "ANSWER_SELECT":
          return "กำลังตอบคำถาม...";
        case "ANSWER_APPROVAL":
          return "กำลังตัดสินใจ...";
        case "ACTION":
          return "กำลังทำ...";
        default:
          return "รอ...";
      }
    };

    return (
      <WaitingScreen
        message={getPhaseMessage()}
        match={match}
        myTeamId={myTeamId}
        timer={timerValue}
        selectedAnswer={
          match.phase === "ANSWER_APPROVAL" ? match.selectedAnswer : undefined
        }
      />
    );
  }

  // Answer Selection Screen (when it's my turn to answer)
  if (match.phase === "ANSWER_SELECT" && isMyTeamAnswering) {
    // If question not loaded yet, show waiting
    if (!match.currentQuestion) {
      return (
        <WaitingScreen
          message="Loading question..."
          match={match}
          myTeamId={myTeamId}
        />
      );
    }

    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "#000",
          display: "flex",
          flexDirection: "column",
          m: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            overflowY: "auto",
            p: 3,
          }}
        >
          {/* Header with Scores */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{ color: myTeam.color, fontWeight: 700, letterSpacing: 1 }}
              >
                {myTeam.name} {myTeam.id === myTeamId && "(YOU)"}
              </Typography>
              <Typography variant="h3" sx={{ color: "#fff", fontWeight: 700 }}>
                {myTeam.score}
              </Typography>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.5)" }}
              >
                รอบที่ {currentRound}
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#ff8a00", fontWeight: 700 }}
              >
                TRUTH or DARE
              </Typography>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography
                variant="caption"
                sx={{
                  color: opponentTeam.color,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                {opponentTeam.name}
              </Typography>
              <Typography variant="h3" sx={{ color: "#fff", fontWeight: 700 }}>
                {opponentTeam.score}
              </Typography>
            </Box>
          </Box>

          {/* Timer Display */}
          {timerValue !== null && timerValue > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  borderRadius: "50%",
                  border: `4px solid ${
                    timerValue <= 10 ? "#f44336" : "#ff8a00"
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 20px ${
                    timerValue <= 10
                      ? "rgba(244, 67, 54, 0.5)"
                      : "rgba(255, 138, 0, 0.5)"
                  }`,
                  animation: timerValue <= 10 ? "pulse 1s infinite" : "none",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: "2rem", sm: "2.5rem" },
                    fontWeight: 800,
                    color: timerValue <= 10 ? "#f44336" : "#fff",
                    fontFamily: "monospace",
                  }}
                >
                  {timerValue}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Question Display */}
          <Paper
            sx={{
              p: { xs: 2, sm: 4 },
              mb: { xs: 2, sm: 3 },
              bgcolor: "rgba(255, 138, 0, 0.1)",
              border: "2px solid #ff8a00",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: "#ff8a00",
                fontWeight: 700,
                letterSpacing: 2,
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
              }}
            >
              คำถาม
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: "#fff",
                fontWeight: 600,
                mt: 1,
                mb: 2,
                fontSize: { xs: "1.25rem", sm: "2rem" },
                lineHeight: 1.3,
              }}
            >
              {match.currentQuestion.text}
            </Typography>
            <Chip
              label={`${match.currentQuestion.points} คะแนน`}
              sx={{
                bgcolor: "#ff8a00",
                color: "#fff",
                fontWeight: 700,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            />
          </Paper>

          {/* Answer Options */}
          <Typography
            variant="h6"
            sx={{
              color: "#fff",
              mb: 2,
              fontWeight: 600,
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            เลือกคำตอบของคุณ:
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {match.currentQuestion.choices?.map(
              (choice: string, idx: number) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="large"
                  onClick={() => handleAnswerSelect(choice)}
                  sx={{
                    borderColor: "#fff",
                    color: "#fff",
                    "&:hover": {
                      borderColor: "#ff8a00",
                      bgcolor: "rgba(255, 138, 0, 0.1)",
                    },
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 1.5, sm: 2 },
                    fontSize: { xs: "0.9rem", sm: "1.1rem" },
                    justifyContent: "flex-start",
                    textAlign: "left",
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: { xs: 32, sm: 40 },
                      height: { xs: 32, sm: 40 },
                      borderRadius: "50%",
                      bgcolor: "#ff8a00",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: { xs: 1.5, sm: 2 },
                      fontWeight: 700,
                      flexShrink: 0,
                      fontSize: { xs: "0.85rem", sm: "1rem" },
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </Box>
                  {choice}
                </Button>
              )
            )}
          </Box>

          {/* Timer */}
          {timerValue !== null && timerValue > 0 && (
            <Box
              sx={{
                position: "fixed",
                top: 20,
                right: 20,
                bgcolor: "rgba(0,0,0,0.7)",
                borderRadius: 2,
                px: 3,
                py: 1,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: timerValue <= 5 ? "#ff8a00" : "#fff",
                }}
              >
                {timerValue}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // REVEAL Phase (Show Dare Card)
  if (match.phase === "REVEAL") {
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
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#f44336",
            fontWeight: 800,
            mb: 4,
            textTransform: "uppercase",
            letterSpacing: 2,
            textAlign: "center",
          }}
        >
          บัตร Dare ถูกเปิด!
        </Typography>
        {match.currentCard && (
          <Paper
            sx={{
              p: 4,
              bgcolor: "#1a1a1a",
              border: "2px solid #f44336",
              borderRadius: 4,
              maxWidth: 500,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 0 40px rgba(244, 67, 54, 0.3)",
            }}
          >
            <Chip
              label={match.currentCard.difficulty}
              sx={{ bgcolor: "#f44336", color: "#fff", fontWeight: 700, mb: 3 }}
            />
            <Typography
              variant="h3"
              sx={{ color: "#fff", fontWeight: 700, mb: 3, lineHeight: 1.3 }}
            >
              {match.currentCard.text}
            </Typography>
            <Typography variant="h5" sx={{ color: "#f44336", fontWeight: 700 }}>
              {match.currentCard.points} คะแนน
            </Typography>
          </Paper>
        )}
        <Typography
          variant="body1"
          sx={{ color: "rgba(255,255,255,0.6)", mt: 4, textAlign: "center" }}
        >
          รอ Game Master เริ่มต้น...
        </Typography>
      </Box>
    );
  }

  // ACTION Phase (Perform Dare)
  if ((match.phase as string) === "ACTION") {
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
        }}
      >
        {/* Timer */}
        {timerValue !== null && timerValue > 0 ? (
          <Box
            sx={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: "8px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 6,
              boxShadow: "0 0 60px rgba(255,255,255,0.2)",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: "6rem",
                fontWeight: 800,
                color: timerValue <= 10 ? "#f44336" : "#fff",
                fontFamily: "monospace",
              }}
            >
              {timerValue}
            </Typography>
          </Box>
        ) : (
          <Typography
            variant="h2"
            sx={{
              color: "#4caf50",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            เริ่มต้น!
          </Typography>
        )}
        {match.currentCard && (
          <Box sx={{ textAlign: "center", maxWidth: 600 }}>
            <Typography
              variant="h4"
              sx={{ color: "#fff", fontWeight: 700, mb: 2 }}
            >
              {match.currentCard.text}
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.6)" }}>
              ทำ dare เพื่อได้คะแนน!
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // Result Screen (SCORING)
  if (match.phase === "SCORING") {
    const isCorrect = match.isAnswerCorrect;

    const isMyTeamAnswering = match.answeringTeamId === myTeamId;

    // Determine message based on who answered and if it was correct
    let resultTitle = "";
    let resultMessage = "";
    let resultColor = "";

    if (isMyTeamAnswering) {
      if (isCorrect) {
        resultTitle = "ถูกต้อง!";
        resultMessage = "คุณได้คะแนน!";
        resultColor = "#4caf50";
      } else {
        resultTitle = "ผิด!";
        resultMessage = "พยายามอีกครั้ง";
        resultColor = "#f44336";
      }
    } else {
      // Opponent answered
      if (isCorrect) {
        resultTitle = "ผิด!";
        resultMessage = "พวกเขาได้คะแนน!";
        resultColor = "#f44336";
      } else {
        resultTitle = "ถูกต้อง!";
        resultMessage = "พวกเขาพลาด!";
        resultColor = "#4caf50";
      }
    }

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
        }}
      >
        <Box
          sx={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            bgcolor: resultColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 4,
            boxShadow: `0 0 60px ${resultColor}`,
            animation: "pulse 2s infinite",
          }}
        >
          <Typography variant="h1" sx={{ fontSize: "5rem", color: "#fff" }}>
            {isCorrect ? "✓" : "✗"}
          </Typography>
        </Box>

        <Typography
          variant="h2"
          sx={{
            color: resultColor,
            fontWeight: 800,
            mb: 2,
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          {resultTitle}
        </Typography>

        <Typography
          variant="h5"
          sx={{ color: "rgba(255,255,255,0.8)", mb: 4, textAlign: "center" }}
        >
          {resultMessage}
        </Typography>

        {match.currentQuestion?.answer && !isCorrect && (
          <Box
            sx={{
              p: 3,
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.5)" }}
            >
              CORRECT ANSWER
            </Typography>
            <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
              {match.currentQuestion.answer}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // Default fallback (covers IDLE and unknown phases)
  let message = `Loading game phase: ${match.phase}`;
  let subtext = "Please wait...";

  if (match.phase === "IDLE") {
    message = "รอเริ่มเกม!";
    subtext = "เกมกำลังจะเริ่มต้นแล้ว!";
  }

  return (
    <>
      {/* Help Icon Button - Floating */}
      <Button
        onClick={() => setInstructionsOpen(true)}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000,
          minWidth: "auto",
          width: 56,
          height: 56,
          borderRadius: "50%",
          bgcolor: "rgba(255, 138, 0, 0.9)",
          color: "#fff",
          "&:hover": {
            bgcolor: "#ff8a00",
            transform: "scale(1.1)",
          },
          transition: "all 0.3s",
          boxShadow: "0 4px 20px rgba(255, 138, 0, 0.4)",
        }}
      >
        <HelpOutlineIcon sx={{ fontSize: "2rem" }} />
      </Button>

      <WaitingScreen
        message={message}
        subtext={subtext}
        match={match}
        myTeamId={myTeamId}
        onChangeTeam={match.phase === "IDLE" ? handleChangeTeam : undefined}
      />

      {/* Game Instructions Dialog */}
      <GameInstructions
        open={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
      />
    </>
  );
};
