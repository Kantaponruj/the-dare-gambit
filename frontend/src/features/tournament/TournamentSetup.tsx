import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useSocket } from "../../context/SocketContext";

interface TournamentSetupProps {
  onConfigChange?: (config: any) => void;
}

export const TournamentSetup: React.FC<TournamentSetupProps> = ({
  onConfigChange,
}) => {
  const socket = useSocket();
  const [name, setName] = useState("");
  const [totalPeople, setTotalPeople] = useState(16);
  const [numTeams, setNumTeams] = useState(4);
  const [roundsPerGame, setRoundsPerGame] = useState(10);
  const [buzzerEnabled, setBuzzerEnabled] = useState(true);
  const [tournamentCreated, setTournamentCreated] = useState(false);

  const membersPerTeam = Math.floor(totalPeople / numTeams);
  const remainder = totalPeople % numTeams;

  // Auto-create tournament when config changes
  useEffect(() => {
    if (name.trim() && totalPeople >= numTeams) {
      const config = {
        name,
        totalPeople,
        numTeams,
        membersPerTeam,
        roundsPerGame,
        created: tournamentCreated,
      };

      // Notify parent that config is valid
      if (onConfigChange) {
        onConfigChange(config);
      }
    } else if (onConfigChange) {
      onConfigChange(null);
    }
  }, [
    name,
    totalPeople,
    numTeams,
    roundsPerGame,
    buzzerEnabled,
    tournamentCreated,
    membersPerTeam,
    onConfigChange,
  ]);

  // Create tournament when user is done configuring
  useEffect(() => {
    if (!socket || !name.trim() || totalPeople < numTeams || tournamentCreated)
      return;

    const timer = setTimeout(() => {
      console.log("Auto-creating tournament", {
        name,
        totalPeople,
        numTeams,
        membersPerTeam,
        roundsPerGame,
      });

      socket.emit("tournament:create", {
        name,
        maxTeams: numTeams,
        defaultRoundsPerGame: roundsPerGame,
        buzzerEnabled,
      });

      socket.emit("tournament:update_settings", {
        minTeams: numTeams,
        minMembersPerTeam: membersPerTeam,
        buzzerEnabled,
      });

      // Store for later use
      localStorage.setItem("tournament.totalPeople", totalPeople.toString());
      localStorage.setItem("tournament.numTeams", numTeams.toString());
      localStorage.setItem(
        "tournament.roundsPerGame",
        roundsPerGame.toString()
      );

      setTournamentCreated(true);
    }, 500); // Debounce to avoid creating multiple times

    return () => clearTimeout(timer);
  }, [
    socket,
    name,
    totalPeople,
    numTeams,
    membersPerTeam,
    roundsPerGame,
    buzzerEnabled,
    tournamentCreated,
  ]);

  useEffect(() => {
    if (!socket) return;
    socket.on("error", (err) => {
      console.error("Tournament setup error:", err);
    });
    return () => {
      socket.off("error");
    };
  }, [socket]);

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Tournament Configuration
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        gutterBottom
        sx={{ mb: 3 }}
      >
        Configure your tournament settings. The tournament will be created
        automatically.
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          label="Tournament Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setTournamentCreated(false);
          }}
          fullWidth
          required
        />

        <TextField
          label="Total Number of People"
          type="number"
          value={totalPeople}
          onChange={(e) => {
            setTotalPeople(Number(e.target.value));
            setTournamentCreated(false);
          }}
          inputProps={{ min: 4, max: 64 }}
          fullWidth
          helperText="Enter the total number of participants"
        />

        <FormControl fullWidth>
          <InputLabel>Number of Teams</InputLabel>
          <Select
            value={numTeams}
            label="Number of Teams"
            onChange={(e) => {
              setNumTeams(Number(e.target.value));
              setTournamentCreated(false);
            }}
          >
            <MenuItem value={4}>4 Teams</MenuItem>
            <MenuItem value={8}>8 Teams</MenuItem>
            <MenuItem value={16}>16 Teams</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Rounds Per Game</InputLabel>
          <Select
            value={roundsPerGame}
            label="Rounds Per Game"
            onChange={(e) => {
              setRoundsPerGame(Number(e.target.value));
              setTournamentCreated(false);
            }}
          >
            <MenuItem value={5}>5 Rounds (Very Short)</MenuItem>
            <MenuItem value={8}>8 Rounds (Short)</MenuItem>
            <MenuItem value={10}>10 Rounds (Standard)</MenuItem>
            <MenuItem value={12}>12 Rounds (Medium)</MenuItem>
            <MenuItem value={15}>15 Rounds (Long)</MenuItem>
            <MenuItem value={20}>20 Rounds (Very Long)</MenuItem>
          </Select>
        </FormControl>

        {/* Buzzer Toggle */}
        <Box
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={buzzerEnabled}
                onChange={(e) => {
                  setBuzzerEnabled(e.target.checked);
                  setTournamentCreated(false);
                }}
                color="primary"
              />
            }
            label="Enable Buzzer Round"
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5 }}
          >
            When enabled, matches start with a buzzer round where teams compete
            to answer first. When disabled, GM selects which team plays first.
          </Typography>
        </Box>

        {/* Calculation Display */}
        <Alert severity="info" sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Team Distribution:
          </Typography>
          <Typography variant="body2">
            • {numTeams} teams with {membersPerTeam} members each
          </Typography>
          {remainder > 0 && (
            <Typography variant="body2" color="warning.main">
              • {remainder} extra {remainder === 1 ? "person" : "people"} will
              need to be distributed
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 1 }}>
            Total: {totalPeople} people
          </Typography>
        </Alert>

        {tournamentCreated && name.trim() && (
          <Alert severity="success">
            ✓ Tournament configured! Click "Next" to proceed to team
            registration.
          </Alert>
        )}
      </Box>
    </Paper>
  );
};
