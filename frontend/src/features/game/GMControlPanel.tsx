import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  Stack,
  Alert,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import AddIcon from "@mui/icons-material/Add";
import TimerIcon from "@mui/icons-material/Timer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SettingsIcon from "@mui/icons-material/Settings";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TvIcon from "@mui/icons-material/Tv";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useSocket } from "../../context/SocketContext";
import { useNavigate } from "@tanstack/react-router";
import { MatchSummary } from "./MatchSummary";
import { TournamentSummary } from "../tournament/TournamentSummary";

// Add pulse animation
const pulseAnimation = `
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

export const GMControlPanel: React.FC = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [match, setMatch] = useState<any>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [timerValue, setTimerValue] = useState<number | null>(null);
  const [startError, setStartError] = useState<string>("");
  const [currentRound, setCurrentRound] = useState<number>(1);

  useEffect(() => {
    if (!socket) return;

    socket.emit("match:get_state");

    socket.on("match:state", (state) => {
      setMatch(state);
      if (state && state.timer !== null) {
        setTimerValue(state.timer);
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

    socket.on("error", (error: string) => {
      console.error("Socket error:", error);
      setStartError(error);
    });

    return () => {
      socket.off("match:state");
      socket.off("tournament:state");
      socket.off("timer:update");
      socket.off("timer:end");
      socket.off("error");
    };
  }, [socket]);

  const handleStartMatch = () => {
    setStartError("");
    socket?.emit("match:start");
  };

  const handleJudgeBuzzer = (winnerId: string | null) => {
    socket?.emit("game:judge_buzzer", { winnerTeamId: winnerId });
  };

  const handleScoreAction = (success: boolean) => {
    socket?.emit("game:score_action", { success });
    // Increment round when action is scored
    if (match && currentRound < match.totalRounds) {
      setCurrentRound(currentRound + 1);
    }
  };

  const handleApproveAnswer = (approved: boolean) => {
    socket?.emit("game:approve_answer", { approved });
    // Increment round when answer is approved
    if (match && currentRound < match.totalRounds) {
      setCurrentRound(currentRound + 1);
    }
  };

  // Timer Controls
  const startTimer = (duration: number) => {
    socket?.emit("timer:start", { duration });
  };

  const stopTimer = () => {
    socket?.emit("timer:stop");
  };

  const addTime = (seconds: number) => {
    socket?.emit("timer:add", { seconds });
  };

  const handleSelectAnswer = (answer: string) => {
    socket?.emit("game:select_answer", { answer });
  };

  const handleSelectStrategy = (strategy: "TRUTH" | "DARE") => {
    socket?.emit("game:select_strategy", { strategy });
  };

  const handleSelectOption = (option: {
    category: string;
    difficulty: string;
  }) => {
    socket?.emit("game:select_option", option);
  };

  const handleNextMatch = () => {
    socket?.emit("tournament:next_match");
  };

  const [openStopMatchDialog, setOpenStopMatchDialog] = useState(false);
  const [openEndTournamentDialog, setOpenEndTournamentDialog] = useState(false);

  const handleStopMatch = () => {
    socket?.emit("match:end");
    setOpenStopMatchDialog(false);
  };

  const handleEndTournament = () => {
    socket?.emit("tournament:end");
    setOpenEndTournamentDialog(false);
  };

  const handleOpenDisplay = () => {
    window.open("/display", "_blank", "noopener,noreferrer");
  };

  const getPhaseDisplay = () => {
    if (!match) return "";

    switch (match.phase) {
      case "BUZZER":
        return "🔔 Buzzer Round - Who's Fastest?";
      case "STRATEGY_SELECT":
        return "🎯 Choose Strategy: Truth or Dare?";
      case "ANSWER_SELECT":
        return "📝 Answer Selection";
      case "ANSWER_APPROVAL":
        return "✅ GM Answer Approval";
      case "REVEAL":
        return "🎴 Card Reveal";
      case "ACTION":
        return "🎬 Performing Action";
      case "SCORING":
        return "📊 Round Results";
      case "CATEGORY_SELECT":
        return "📂 Category Selection";
      default:
        return match.phase;
    }
  };

  const getTurnTeamName = () => {
    if (!match || !match.currentTurnTeamId) return "—";
    return match.currentTurnTeamId === match.teamA.id
      ? match.teamA.name
      : match.teamB.name;
  };

  const getAnsweringTeamName = () => {
    if (!match || !match.answeringTeamId) return "—";
    return match.answeringTeamId === match.teamA.id
      ? match.teamA.name
      : match.teamB.name;
  };

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
        onPlayAgain={() => navigate({ to: "/setup" })}
        isGM={true}
      />
    );
  }

  if (!match || match.phase === "IDLE") {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          minHeight: "100vh",
          bgcolor: "#121212",
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            maxWidth: 600,
            mx: "auto",
            bgcolor: "#1a1a1a",
            borderColor: "rgba(255,255,255,0.1)",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#fff", fontWeight: 600 }}
          >
            Game Master Control Panel
          </Typography>

          {!match ? (
            <>
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  textAlign: "left",
                  bgcolor: "rgba(33, 150, 243, 0.1)",
                  border: "1px solid rgba(33, 150, 243, 0.3)",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, color: "#64b5f6" }}
                >
                  No Active Tournament
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  You need to set up a tournament first. Please go to the setup
                  page to:
                </Typography>
                <Typography
                  variant="body2"
                  component="ul"
                  sx={{ mt: 1, pl: 2, color: "rgba(255,255,255,0.7)" }}
                >
                  <li>Configure tournament settings</li>
                  <li>Register teams and members</li>
                  <li>Start the tournament</li>
                </Typography>
              </Alert>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate({ to: "/setup" })}
                startIcon={<SettingsIcon />}
                fullWidth
                sx={{
                  bgcolor: "#ff8a00",
                  "&:hover": { bgcolor: "#e67e00" },
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                Go to Tournament Setup
              </Button>
            </>
          ) : (
            <>
              {match.gameCode && (
                <Box
                  sx={{
                    mb: 4,
                    p: 3,
                    bgcolor: "rgba(255, 138, 0, 0.1)",
                    border: "2px dashed #ff8a00",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{ color: "#ff8a00", fontWeight: 700, letterSpacing: 2 }}
                  >
                    GAME CODE
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{ color: "#fff", fontWeight: 800, letterSpacing: 8 }}
                  >
                    {match.gameCode}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Share this code with players to join
                  </Typography>
                </Box>
              )}

              <Typography sx={{ mb: 3, color: "rgba(255,255,255,0.7)" }}>
                Match is ready to start.
              </Typography>

              {startError && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    textAlign: "left",
                    bgcolor: "rgba(244, 67, 54, 0.1)",
                    border: "1px solid rgba(244, 67, 54, 0.3)",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1, color: "#ef5350" }}
                  >
                    Cannot Start Match:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {startError}
                  </Typography>
                </Alert>
              )}

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartMatch}
                  startIcon={<PlayArrowIcon />}
                  fullWidth
                  sx={{
                    bgcolor: "#ff8a00",
                    "&:hover": { bgcolor: "#e67e00" },
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  Start Match
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleOpenDisplay}
                  startIcon={<TvIcon />}
                  endIcon={<OpenInNewIcon />}
                  fullWidth
                  sx={{
                    borderColor: "#3b82f6",
                    color: "#3b82f6",
                    "&:hover": {
                      borderColor: "#2563eb",
                      bgcolor: "rgba(59, 130, 246, 0.1)",
                    },
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  Open Display View
                </Button>
              </Stack>

              <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />

              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setOpenEndTournamentDialog(true)}
                  fullWidth
                >
                  End Tournament
                </Button>
              </Stack>
            </>
          )}
        </Paper>
      </Box>
    );
  }

  if (match.phase === "FINISHED") {
    return (
      <MatchSummary
        teamA={match.teamA}
        teamB={match.teamB}
        winnerId={match.winnerId}
        onNextMatch={handleNextMatch}
        isGM={true}
      />
    );
  }

  const totalRounds = match?.totalRounds || 10;
  const roundProgress = (currentRound / totalRounds) * 100;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#121212",
      }}
    >
      {/* Header */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          zIndex: 1,
          borderRadius: 0,
          bgcolor: "#1a1a1a",
          borderColor: "rgba(255,255,255,0.1)",
          borderLeft: 0,
          borderRight: 0,
          borderTop: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
              GM Control Panel
            </Typography>
            {/* Game Code Display */}
            {match.gameCode && (
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: "rgba(255, 138, 0, 0.15)",
                  border: "1px solid #ff8a00",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#ff8a00",
                    fontWeight: 700,
                    fontSize: "0.65rem",
                  }}
                >
                  CODE:
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#fff",
                    fontWeight: 800,
                    letterSpacing: 3,
                    fontFamily: "monospace",
                  }}
                >
                  {match.gameCode}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {/* Round Counter */}
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}
              >
                ROUND
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "#ff8a00", fontWeight: 700 }}
              >
                {currentRound} / {totalRounds}
              </Typography>
            </Box>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: "rgba(255,255,255,0.1)" }}
            />
            <Chip
              label={getPhaseDisplay()}
              sx={{
                bgcolor: "#ff8a00",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.9rem",
                px: 1,
              }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenDisplay}
              startIcon={<TvIcon />}
              sx={{
                borderColor: "#3b82f6",
                color: "#3b82f6",
                "&:hover": {
                  borderColor: "#2563eb",
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                },
                fontWeight: 600,
              }}
            >
              Display
            </Button>
          </Box>
        </Box>
        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={roundProgress}
          sx={{
            mt: 1,
            height: 6,
            borderRadius: 1,
            bgcolor: "rgba(255,255,255,0.1)",
            "& .MuiLinearProgress-bar": {
              bgcolor: "#ff8a00",
              borderRadius: 1,
            },
          }}
        />
      </Paper>

      {/* Main Content - 3 Columns */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* LEFT COLUMN: Game Flow Info */}
        <Box
          sx={{
            width: "25%",
            p: 2,
            borderRight: "1px solid rgba(255,255,255,0.1)",
            overflowY: "auto",
            bgcolor: "#1a1a1a",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#fff", fontWeight: 600 }}
          >
            Game Flow
          </Typography>

          <Stack spacing={2}>
            {/* Current Turn Info */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: "#121212",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontSize: "0.7rem",
                }}
              >
                Turn Holder
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "#ff8a00", fontWeight: 700, mt: 0.5 }}
              >
                {getTurnTeamName()}
              </Typography>
              {match.selectedStrategy && (
                <Chip
                  label={match.selectedStrategy}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor:
                      match.selectedStrategy === "TRUTH"
                        ? "rgba(76, 175, 80, 0.2)"
                        : "rgba(255, 138, 0, 0.2)",
                    color:
                      match.selectedStrategy === "TRUTH"
                        ? "#4caf50"
                        : "#ff8a00",
                    fontWeight: 600,
                  }}
                />
              )}
            </Paper>

            {/* Answering Team */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: "#121212",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontSize: "0.7rem",
                }}
              >
                Answering Team
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "#fff", fontWeight: 600, mt: 0.5 }}
              >
                {getAnsweringTeamName()}
              </Typography>
            </Paper>

            {/* Game Rules Reminder */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: "#121212",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "#ff8a00", fontWeight: 600, mb: 1 }}
              >
                📖 Scoring Rules
              </Typography>
              <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.05)" }} />
              <Typography
                variant="caption"
                sx={{
                  color: "#4caf50",
                  display: "block",
                  mb: 0.5,
                  fontWeight: 600,
                }}
              >
                TRUTH (Self-Answer):
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  display: "block",
                  mb: 1,
                  fontSize: "0.7rem",
                }}
              >
                • Correct: 100% points
                <br />• Wrong: 0 points
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#ff8a00",
                  display: "block",
                  mb: 0.5,
                  fontWeight: 600,
                }}
              >
                DARE (Challenge):
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  display: "block",
                  fontSize: "0.7rem",
                }}
              >
                • They succeed: 0 points (they get 50%)
                <br />• They fail: 50% points to you
              </Typography>
            </Paper>

            {/* Timer Controls */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: "#121212",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TimerIcon sx={{ mr: 1, color: "#ff8a00" }} />
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#fff", fontWeight: 600 }}
                >
                  Timer
                </Typography>
              </Box>

              <Typography
                variant="h3"
                align="center"
                sx={{
                  mb: 2,
                  fontFamily: "monospace",
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                {timerValue !== null ? timerValue : "--"}
              </Typography>

              <Stack spacing={1}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => startTimer(15)}
                    startIcon={<PlayArrowIcon />}
                  >
                    15s
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => startTimer(30)}
                    startIcon={<PlayArrowIcon />}
                  >
                    30s
                  </Button>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={stopTimer}
                  startIcon={<StopIcon />}
                >
                  Stop
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => addTime(5)}
                  startIcon={<AddIcon />}
                >
                  +5 Sec
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Box>

        {/* CENTER COLUMN: Preview */}
        <Box
          sx={{
            width: "50%",
            p: 2,
            bgcolor: "#121212",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#fff", mb: 2, fontWeight: 600 }}
          >
            Live Preview
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              bgcolor: "#1a1a1a",
              borderColor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "auto",
              p: 3,
            }}
          >
            {/* Phase-specific displays */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              {match.phase === "BUZZER" && (
                <Typography
                  variant="h2"
                  sx={{
                    color: match.buzzerLocked ? "#ff8a00" : "#fff",
                    fontWeight: 700,
                  }}
                >
                  {match.buzzerLocked
                    ? "BUZZER LOCKED!"
                    : "WAITING FOR BUZZER..."}
                </Typography>
              )}

              {match.phase === "CATEGORY_SELECT" && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(3, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  {match.availableOptions?.map(
                    (
                      option: { category: string; difficulty: string },
                      index: number
                    ) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 3,
                          textAlign: "center",
                          cursor: "pointer",
                          bgcolor: "rgba(255,255,255,0.05)",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                        onClick={() => handleSelectOption(option)}
                      >
                        <Typography variant="h6" gutterBottom>
                          {option.category}
                        </Typography>
                        <Chip
                          label={option.difficulty}
                          color={
                            option.difficulty === "EASY"
                              ? "success"
                              : option.difficulty === "MEDIUM"
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
                      </Paper>
                    )
                  )}
                </Box>
              )}

              {match.phase === "STRATEGY_SELECT" && (
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                      mb: 3,
                      textAlign: "center",
                    }}
                  >
                    Teams are choosing strategy...
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      textAlign: "center",
                    }}
                  >
                    Waiting for{" "}
                    {match.currentTurnTeamId === match.teamA.id
                      ? match.teamA.name
                      : match.teamB.name}{" "}
                    to select TRUTH or DARE
                  </Typography>
                </Box>
              )}

              {match.currentQuestion && match.phase === "ANSWER_SELECT" && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    bgcolor: "rgba(255, 138, 0, 0.05)",
                    borderRadius: 3,
                    border: "3px solid #ff8a00",
                    mb: 3,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Decorative corner */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 100,
                      height: 100,
                      background:
                        "linear-gradient(135deg, transparent 50%, rgba(255, 138, 0, 0.1) 50%)",
                    }}
                  />

                  {/* Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 3,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="overline"
                        sx={{
                          color: "#ff8a00",
                          fontSize: "0.875rem",
                          fontWeight: 800,
                          letterSpacing: 3,
                          display: "block",
                        }}
                      >
                        📝 QUESTION CARD
                      </Typography>
                      <Chip
                        label={match.currentQuestion.category || "General"}
                        size="small"
                        sx={{
                          mt: 0.5,
                          bgcolor: "rgba(255, 138, 0, 0.2)",
                          color: "#ff8a00",
                          fontWeight: 700,
                          fontSize: "0.65rem",
                        }}
                      />
                    </Box>
                    <Chip
                      label={`${match.currentQuestion.points} PTS`}
                      sx={{
                        bgcolor: "#ff8a00",
                        color: "#000",
                        fontWeight: 800,
                        fontSize: "1rem",
                        height: 36,
                      }}
                    />
                  </Box>

                  {/* Question Text */}
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: "rgba(0,0,0,0.3)",
                      borderRadius: 2,
                      border: "1px solid rgba(255, 138, 0, 0.3)",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        color: "#fff",
                        fontWeight: 600,
                        lineHeight: 1.5,
                      }}
                    >
                      {match.currentQuestion.text}
                    </Typography>
                  </Box>

                  {/* Answer Choices - Compact Grid */}
                  {match.currentQuestion.choices && (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 1.5,
                      }}
                    >
                      {match.currentQuestion.choices.map(
                        (choice: string, idx: number) => {
                          const isCorrect =
                            choice.trim().toLowerCase() ===
                            match.currentQuestion.answer.trim().toLowerCase();
                          return (
                            <Box
                              key={idx}
                              sx={{
                                p: 1.5,
                                borderRadius: 1,
                                border: isCorrect
                                  ? "2px solid #4caf50"
                                  : "1px solid rgba(255,255,255,0.15)",
                                bgcolor: isCorrect
                                  ? "rgba(76, 175, 80, 0.15)"
                                  : "rgba(255,255,255,0.03)",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                transition: "all 0.2s ease",
                              }}
                            >
                              {isCorrect && (
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: "#4caf50",
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isCorrect ? "#4caf50" : "#fff",
                                  fontWeight: isCorrect ? 700 : 400,
                                  fontSize: "0.9rem",
                                }}
                              >
                                {choice}
                                {isCorrect && " ✓"}
                              </Typography>
                            </Box>
                          );
                        }
                      )}
                    </Box>
                  )}
                </Paper>
              )}

              {/* DARE Card Display (REVEAL & ACTION Phases) */}
              {match.currentCard &&
                (match.phase === "REVEAL" || match.phase === "ACTION") && (
                  <Stack spacing={3} sx={{ mb: 3 }}>
                    {/* Dare Card */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        bgcolor: "rgba(244, 67, 54, 0.05)",
                        borderRadius: 3,
                        border: "3px solid #f44336",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Decorative corner */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: 100,
                          height: 100,
                          background:
                            "linear-gradient(135deg, transparent 50%, rgba(244, 67, 54, 0.1) 50%)",
                        }}
                      />

                      {/* Header */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 3,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="overline"
                            sx={{
                              color: "#f44336",
                              fontSize: "0.875rem",
                              fontWeight: 800,
                              letterSpacing: 3,
                              display: "block",
                            }}
                          >
                            🔥 DARE CHALLENGE
                          </Typography>
                          <Chip
                            label={match.currentCard.difficulty || "MEDIUM"}
                            size="small"
                            sx={{
                              mt: 0.5,
                              bgcolor: "rgba(244, 67, 54, 0.2)",
                              color: "#f44336",
                              fontWeight: 700,
                              fontSize: "0.65rem",
                            }}
                          />
                        </Box>
                        <Chip
                          label={`${
                            match.currentCard.score || match.currentCard.points
                          } PTS`}
                          sx={{
                            bgcolor: "#f44336",
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: "1rem",
                            height: 36,
                          }}
                        />
                      </Box>

                      {/* Challenge Text */}
                      <Box
                        sx={{
                          p: 3,
                          bgcolor: "rgba(0,0,0,0.3)",
                          borderRadius: 2,
                          border: "1px solid rgba(244, 67, 54, 0.3)",
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            color: "#fff",
                            fontWeight: 600,
                            lineHeight: 1.5,
                            textAlign: "center",
                          }}
                        >
                          {match.currentCard.text}
                        </Typography>
                      </Box>

                      {/* Additional Info */}
                      {match.currentCard.category && (
                        <Box sx={{ mt: 2, textAlign: "center" }}>
                          <Typography
                            variant="caption"
                            sx={{ color: "rgba(255,255,255,0.5)" }}
                          >
                            Category: {match.currentCard.category}
                          </Typography>
                        </Box>
                      )}
                    </Paper>

                    {/* START ACTION Button (only in REVEAL phase) */}
                    {match.phase === "REVEAL" && (
                      <Button
                        variant="contained"
                        size="large"
                        color="error"
                        fullWidth
                        onClick={() => socket?.emit("game:confirm_reveal")}
                        sx={{
                          py: 3,
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          borderRadius: 2,
                          boxShadow: "0 4px 20px rgba(244, 67, 54, 0.4)",
                          "&:hover": {
                            boxShadow: "0 6px 25px rgba(244, 67, 54, 0.6)",
                          },
                        }}
                      >
                        ▶️ START ACTION
                      </Button>
                    )}
                  </Stack>
                )}
            </Box>

            {/* Timer Overlay in Preview */}
            {timerValue !== null && timerValue > 0 && (
              <Box sx={{ position: "absolute", top: 20, right: 20 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: timerValue <= 5 ? "#ff8a00" : "#fff",
                    textShadow: timerValue <= 5 ? "0 0 20px #ff8a00" : "none",
                  }}
                >
                  {timerValue}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* RIGHT COLUMN: Teams & Controls */}
        <Box
          sx={{
            width: "25%",
            p: 2,
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            bgcolor: "#1a1a1a",
            overflowY: "auto",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#fff", fontWeight: 600 }}
          >
            Teams & Controls
          </Typography>

          <Stack spacing={2}>
            {/* GM Controls */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: "#121212",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ color: "#fff", fontWeight: 600 }}
              >
                GM Actions
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  fullWidth
                  onClick={() => setOpenStopMatchDialog(true)}
                  sx={{ borderColor: "rgba(244, 67, 54, 0.5)" }}
                >
                  Stop Match
                </Button>
              </Box>

              {/* Team Selection when Buzzer Disabled */}
              {match.phase === "BUZZER" &&
                tournament?.buzzerEnabled === false && (
                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.7)", mb: 1 }}
                    >
                      Select which team plays first:
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleJudgeBuzzer(match.teamA.id)}
                      sx={{
                        bgcolor: match.teamA.color,
                        "&:hover": { bgcolor: match.teamA.color, opacity: 0.8 },
                      }}
                    >
                      {match.teamA.name}
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleJudgeBuzzer(match.teamB.id)}
                      sx={{
                        bgcolor: match.teamB.color,
                        "&:hover": { bgcolor: match.teamB.color, opacity: 0.8 },
                      }}
                    >
                      {match.teamB.name}
                    </Button>
                  </Stack>
                )}

              {match.phase === "BUZZER" && match.buzzerLocked && (
                <Stack spacing={1}>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    Buzzer Winner:{" "}
                    <strong>
                      {match.buzzerWinnerId === match.teamA.id
                        ? match.teamA.name
                        : match.teamB.name}
                    </strong>
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleJudgeBuzzer(match.buzzerWinnerId)}
                  >
                    Award Turn
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleJudgeBuzzer(null)}
                  >
                    Reset Buzzer
                  </Button>
                </Stack>
              )}

              {match.phase === "ANSWER_SELECT" && match.currentQuestion && (
                <Stack spacing={1}>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.7)", mb: 1 }}
                  >
                    <strong>Emergency Answer Selection</strong>
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.5)",
                      mb: 1,
                      display: "block",
                    }}
                  >
                    Select answer for player (tech issues / time expired)
                  </Typography>
                  {match.currentQuestion.choices?.map(
                    (choice: string, idx: number) => (
                      <Button
                        key={idx}
                        variant="outlined"
                        size="small"
                        onClick={() => handleSelectAnswer(choice)}
                        sx={{
                          borderColor: "rgba(255,255,255,0.3)",
                          color: "#fff",
                          "&:hover": {
                            borderColor: "#ff8a00",
                            bgcolor: "rgba(255, 138, 0, 0.1)",
                          },
                          justifyContent: "flex-start",
                          textAlign: "left",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            bgcolor: "#ff8a00",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 1,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {String.fromCharCode(65 + idx)}
                        </Box>
                        {choice}
                      </Button>
                    )
                  )}
                </Stack>
              )}

              {match.phase === "ANSWER_APPROVAL" && (
                <Stack spacing={1}>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.7)", mb: 1 }}
                  >
                    Selected: <strong>{match.selectedAnswer}</strong>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: match.isAnswerCorrect ? "#4caf50" : "#ef5350",
                      mb: 1,
                    }}
                  >
                    Auto-Check:{" "}
                    {match.isAnswerCorrect ? "✓ Correct" : "✗ Wrong"}
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleApproveAnswer(true)}
                  >
                    Approve & Score
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleApproveAnswer(false)}
                  >
                    Reject
                  </Button>
                </Stack>
              )}

              {match.phase === "ACTION" && (
                <Stack spacing={1}>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    Evaluate Performance
                  </Typography>

                  {/* Time Control Buttons */}
                  {match.currentCardType === "dare" && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255,255,255,0.5)",
                          mb: 0.5,
                          display: "block",
                        }}
                      >
                        Add Time:
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            socket?.emit("timer:add", { seconds: 5 })
                          }
                          sx={{ flex: 1 }}
                        >
                          +5s
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            socket?.emit("timer:add", { seconds: 10 })
                          }
                          sx={{ flex: 1 }}
                        >
                          +10s
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            socket?.emit("timer:add", { seconds: 30 })
                          }
                          sx={{ flex: 1 }}
                        >
                          +30s
                        </Button>
                      </Stack>
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleScoreAction(true)}
                  >
                    Success (+Points)
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleScoreAction(false)}
                  >
                    Fail (Next Round)
                  </Button>
                </Stack>
              )}

              {match.phase === "SCORING" && (
                <Stack spacing={2}>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.7)", mb: 1 }}
                  >
                    Round Completed!
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: match.isAnswerCorrect
                        ? "rgba(76, 175, 80, 0.1)"
                        : "rgba(244, 67, 54, 0.1)",
                      borderRadius: 2,
                      border: `1px solid ${
                        match.isAnswerCorrect ? "#4caf50" : "#f44336"
                      }`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: match.isAnswerCorrect ? "#4caf50" : "#f44336",
                        fontWeight: 700,
                        textAlign: "center",
                      }}
                    >
                      {match.isAnswerCorrect ? "✓ CORRECT" : "✗ WRONG"}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => socket?.emit("game:next_round")}
                    sx={{
                      bgcolor:
                        currentRound >= totalRounds ? "#f44336" : "#ff8a00",
                      "&:hover": {
                        bgcolor:
                          currentRound >= totalRounds ? "#d32f2f" : "#e67e00",
                      },
                      py: 1.5,
                      fontWeight: 700,
                    }}
                  >
                    {currentRound >= totalRounds
                      ? "🏁 Finish Match"
                      : "▶️ Next Round"}
                  </Button>
                </Stack>
              )}

              {/* Emergency Category Selection */}
              {match.phase === "CATEGORY_SELECT" && (
                <Stack spacing={1}>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.7)", mb: 1 }}
                  >
                    <strong>Emergency Category Selection</strong>
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.5)",
                      mb: 1,
                      display: "block",
                    }}
                  >
                    Select category for player (if needed)
                  </Typography>
                  {match.availableOptions?.map(
                    (
                      option: { category: string; difficulty: string },
                      idx: number
                    ) => (
                      <Button
                        key={idx}
                        variant="outlined"
                        size="small"
                        onClick={() => handleSelectOption(option)}
                        sx={{
                          borderColor: "rgba(255,255,255,0.3)",
                          color: "#fff",
                          "&:hover": {
                            borderColor: "#ff8a00",
                            bgcolor: "rgba(255, 138, 0, 0.1)",
                          },
                          justifyContent: "flex-start",
                          textAlign: "left",
                        }}
                      >
                        {option.category} ({option.difficulty})
                      </Button>
                    )
                  )}
                </Stack>
              )}

              {/* Emergency Strategy Selection */}
              {match.phase === "STRATEGY_SELECT" && (
                <Stack spacing={1}>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.7)", mb: 1 }}
                  >
                    <strong>Emergency Strategy Selection</strong>
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.5)",
                      mb: 1,
                      display: "block",
                    }}
                  >
                    Select strategy for player (if needed)
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSelectStrategy("TRUTH")}
                    sx={{
                      bgcolor: "#4caf50",
                      "&:hover": { bgcolor: "#45a049" },
                    }}
                  >
                    TRUTH (Answer Self)
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSelectStrategy("DARE")}
                    sx={{
                      bgcolor: "#ff8a00",
                      "&:hover": { bgcolor: "#e67e00" },
                    }}
                  >
                    DARE (Challenge Opponent)
                  </Button>
                </Stack>
              )}

              {![
                "BUZZER",
                "ACTION",
                "ANSWER_APPROVAL",
                "ANSWER_SELECT",
                "CATEGORY_SELECT",
                "STRATEGY_SELECT",
              ].includes(match.phase) && (
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Waiting for player action...
                </Typography>
              )}
            </Paper>

            {/* Team A */}
            <Card
              variant="outlined"
              sx={{
                bgcolor:
                  match.currentTurnTeamId === match.teamA.id
                    ? "rgba(255, 138, 0, 0.15)"
                    : "#121212",
                border:
                  match.buzzerWinnerId === match.teamA.id
                    ? "2px solid #ff8a00"
                    : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Team A
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "#fff" }}
                  >
                    {match.teamA.name}
                  </Typography>
                  {match.currentTurnTeamId === match.teamA.id && (
                    <Chip
                      icon={<EmojiEventsIcon />}
                      label="TURN"
                      size="small"
                      sx={{
                        bgcolor: "#ff8a00",
                        color: "#fff",
                        fontWeight: 600,
                        height: 24,
                      }}
                    />
                  )}
                </Box>
                <Typography
                  variant="h4"
                  sx={{ color: "#ff8a00", fontWeight: 700, mt: 1.5 }}
                >
                  {match.teamA.score || 0}
                </Typography>
              </CardContent>
            </Card>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <Typography
                sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}
              >
                VS
              </Typography>
            </Divider>

            {/* Team B */}
            <Card
              variant="outlined"
              sx={{
                bgcolor:
                  match.currentTurnTeamId === match.teamB.id
                    ? "rgba(255, 138, 0, 0.15)"
                    : "#121212",
                border:
                  match.buzzerWinnerId === match.teamB.id
                    ? "2px solid #ff8a00"
                    : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Team B
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "#fff" }}
                  >
                    {match.teamB.name}
                  </Typography>
                  {match.currentTurnTeamId === match.teamB.id && (
                    <Chip
                      icon={<EmojiEventsIcon />}
                      label="TURN"
                      size="small"
                      sx={{
                        bgcolor: "#ff8a00",
                        color: "#fff",
                        fontWeight: 600,
                        height: 24,
                      }}
                    />
                  )}
                </Box>
                <Typography
                  variant="h4"
                  sx={{ color: "#ff8a00", fontWeight: 700, mt: 1.5 }}
                >
                  {match.teamB.score || 0}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>

      {/* Stop Match Dialog */}
      <Dialog
        open={openStopMatchDialog}
        onClose={() => setOpenStopMatchDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: "#1a1a1a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ color: "#f44336" }}>Stop Current Match?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "rgba(255,255,255,0.7)" }}>
            Are you sure you want to stop the current match? This will
            immediately end the match and determine the winner based on current
            scores. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenStopMatchDialog(false)}
            sx={{ color: "rgba(255,255,255,0.5)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStopMatch}
            variant="contained"
            color="error"
            autoFocus
          >
            Stop Match
          </Button>
        </DialogActions>
      </Dialog>

      {/* End Tournament Dialog */}
      <Dialog
        open={openEndTournamentDialog}
        onClose={() => setOpenEndTournamentDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: "#1a1a1a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ color: "#f44336" }}>End Tournament?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "rgba(255,255,255,0.7)" }}>
            Are you sure you want to end the entire tournament? This will finish
            all matches and display the final results. This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEndTournamentDialog(false)}
            sx={{ color: "rgba(255,255,255,0.5)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEndTournament}
            variant="contained"
            color="error"
            autoFocus
          >
            End Tournament
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
