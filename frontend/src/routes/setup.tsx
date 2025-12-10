import React, { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { TournamentSetup } from "../features/tournament/TournamentSetup";
import { TeamRegistration } from "../features/tournament/TeamRegistration";
import { useSocket } from "../context/SocketContext";

const steps = ["Tournament Configuration", "Team Registration", "Start Game"];

export const SetupPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [tournamentConfig, setTournamentConfig] = useState<any>(null);
  const [isTeamRegistrationValid, setIsTeamRegistrationValid] = useState(false);
  const [startError, setStartError] = useState<string>("");
  const navigate = useNavigate();
  const socket = useSocket();

  const handleNext = () => {
    // If moving from step 0 to step 1, tournament is already created by TournamentSetup
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFinish = () => {
    if (socket) {
      console.log("SetupPage: Emitting tournament:start");
      setStartError("");
      socket.emit("tournament:start");
    }
    // Navigate after a short delay to allow error to be caught
    setTimeout(() => {
      if (!startError) {
        navigate({ to: "/tournament" });
      }
    }, 500);
  };

  // Listen for errors
  React.useEffect(() => {
    if (!socket) return;

    const handleError = (error: string) => {
      console.error("Tournament start error:", error);
      setStartError(error);
    };

    socket.on("error", handleError);

    return () => {
      socket.off("error", handleError);
    };
  }, [socket]);

  // Determine if we can proceed
  const canProceed = () => {
    if (activeStep === 0) {
      // Check if tournament config is filled
      return !!tournamentConfig;
    }
    if (activeStep === 1) {
      return isTeamRegistrationValid;
    }
    return true;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            bgcolor: "#241e1a",
            color: "#fff",
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
            Tournament Setup Wizard
          </Typography>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    "& .MuiStepLabel-label": { color: "rgba(255,255,255,0.7)" },
                    "& .Mui-active": { color: "#ff8a00 !important" },
                    "& .Mui-completed": { color: "#4caf50 !important" },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 2, mb: 4, minHeight: 300 }}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom align="center">
                  Step 1: Configure Tournament
                </Typography>
                <TournamentSetup onConfigChange={setTournamentConfig} />
              </Box>
            )}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom align="center">
                  Step 2: Register Teams
                </Typography>
                <TeamRegistration
                  onValidityChange={setIsTeamRegistrationValid}
                />
              </Box>
            )}
            {activeStep === 2 && (
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h5" gutterBottom>
                  Ready to Start!
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb: 3, color: "rgba(255,255,255,0.7)" }}
                >
                  All teams are registered. You can now proceed to the
                  Tournament Bracket.
                </Typography>

                {startError && (
                  <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Cannot Start Tournament:
                    </Typography>
                    <Typography variant="body2">{startError}</Typography>
                  </Alert>
                )}

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleFinish}
                  sx={{
                    bgcolor: "#ff8a00",
                    "&:hover": { bgcolor: "#e67e00" },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Go to Bracket
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1, color: "rgba(255,255,255,0.5)" }}
            >
              Back
            </Button>
            <Box sx={{ flex: 1 }} />
            {activeStep < steps.length - 1 && (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                variant="contained"
                sx={{
                  bgcolor: canProceed() ? "#ff8a00" : "rgba(255,255,255,0.1)",
                  color: canProceed() ? "#fff" : "rgba(255,255,255,0.3)",
                  "&:hover": { bgcolor: "#e67e00" },
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
