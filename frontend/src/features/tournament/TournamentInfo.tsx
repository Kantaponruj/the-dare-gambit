import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Divider,
  FormControlLabel,
  Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import { useSocket } from "../../context/SocketContext";

export const TournamentInfo: React.FC = () => {
  const socket = useSocket();
  const [isEditing, setIsEditing] = useState(false);
  const [tournament, setTournament] = useState<any>(null);

  // Edit state
  const [editName, setEditName] = useState("");
  const [editMaxTeams, setEditMaxTeams] = useState(4);
  const [editMinTeams, setEditMinTeams] = useState(2);
  const [editMinMembers, setEditMinMembers] = useState(1);
  const [editRoundsPerGame, setEditRoundsPerGame] = useState(10);
  const [editBuzzerEnabled, setEditBuzzerEnabled] = useState(true);

  useEffect(() => {
    if (!socket) return;

    socket.emit("tournament:get_state");

    socket.on("tournament:state", (data) => {
      if (data) {
        setTournament(data);
        setEditName(data.name);
        setEditMaxTeams(data.maxTeams);
        setEditMinTeams(data.minTeams || 2);
        setEditMinMembers(data.minMembersPerTeam || 1);
        setEditRoundsPerGame(data.defaultRoundsPerGame || 10);
        setEditBuzzerEnabled(
          data.buzzerEnabled !== undefined ? data.buzzerEnabled : true
        );
      }
    });

    return () => {
      socket.off("tournament:state");
    };
  }, [socket]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (tournament) {
      setEditName(tournament.name);
      setEditMaxTeams(tournament.maxTeams);
      setEditMinTeams(tournament.minTeams || 2);
      setEditMinMembers(tournament.minMembersPerTeam || 1);
      setEditRoundsPerGame(tournament.defaultRoundsPerGame || 10);
      setEditBuzzerEnabled(
        tournament.buzzerEnabled !== undefined ? tournament.buzzerEnabled : true
      );
    }
  };

  const handleSave = () => {
    if (socket && editName.trim()) {
      socket.emit("tournament:update", {
        name: editName,
        maxTeams: editMaxTeams,
      });
      socket.emit("tournament:update_settings", {
        minTeams: editMinTeams,
        minMembersPerTeam: editMinMembers,
        defaultRoundsPerGame: editRoundsPerGame,
        buzzerEnabled: editBuzzerEnabled,
      });
      setIsEditing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SETUP":
        return "default";
      case "REGISTRATION":
        return "primary";
      case "ACTIVE":
        return "success";
      case "FINISHED":
        return "error";
      default:
        return "default";
    }
  };

  if (!tournament) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <InfoIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          No tournament found. Please create one from the setup page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Tournament Information
          </Typography>
          {!isEditing ? (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              size="small"
            >
              Edit
            </Button>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                size="small"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                size="small"
              >
                Save
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Tournament Name */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                fontWeight: 600,
                mb: 1,
                display: "block",
              }}
            >
              Tournament Name
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter tournament name"
              />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {tournament.name}
              </Typography>
            )}
          </Box>

          {/* Max Teams */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                fontWeight: 600,
                mb: 1,
                display: "block",
              }}
            >
              Maximum Teams
            </Typography>
            {isEditing ? (
              <FormControl fullWidth>
                <Select
                  value={editMaxTeams}
                  onChange={(e) => setEditMaxTeams(Number(e.target.value))}
                >
                  <MenuItem value={4}>4 Teams</MenuItem>
                  <MenuItem value={8}>8 Teams</MenuItem>
                  <MenuItem value={16}>16 Teams</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {tournament.maxTeams} Teams
              </Typography>
            )}
          </Box>

          {/* Min Teams */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                fontWeight: 600,
                mb: 1,
                display: "block",
              }}
            >
              Minimum Teams Required
            </Typography>
            {isEditing ? (
              <TextField
                type="number"
                fullWidth
                value={editMinTeams}
                onChange={(e) => setEditMinTeams(Number(e.target.value))}
                inputProps={{ min: 2, max: editMaxTeams }}
              />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {tournament.minTeams || 2} Teams
              </Typography>
            )}
          </Box>

          {/* Min Members Per Team */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                fontWeight: 600,
                mb: 1,
                display: "block",
              }}
            >
              Minimum Members Per Team
            </Typography>
            {isEditing ? (
              <TextField
                type="number"
                fullWidth
                value={editMinMembers}
                onChange={(e) => setEditMinMembers(Number(e.target.value))}
                inputProps={{ min: 1, max: 10 }}
              />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {tournament.minMembersPerTeam || 1} Members
              </Typography>
            )}
          </Box>

          {/* Rounds Per Game */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                fontWeight: 600,
                mb: 1,
                display: "block",
              }}
            >
              Rounds Per Game
            </Typography>
            {isEditing ? (
              <FormControl fullWidth>
                <Select
                  value={editRoundsPerGame}
                  onChange={(e) => setEditRoundsPerGame(Number(e.target.value))}
                >
                  <MenuItem value={5}>5 Rounds (Very Short)</MenuItem>
                  <MenuItem value={8}>8 Rounds (Short)</MenuItem>
                  <MenuItem value={10}>10 Rounds (Standard)</MenuItem>
                  <MenuItem value={12}>12 Rounds (Medium)</MenuItem>
                  <MenuItem value={15}>15 Rounds (Long)</MenuItem>
                  <MenuItem value={20}>20 Rounds (Very Long)</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {tournament.defaultRoundsPerGame || 10} Rounds
              </Typography>
            )}
          </Box>

          {/* Buzzer Enabled */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                fontWeight: 600,
                mb: 1,
                display: "block",
              }}
            >
              Buzzer Round
            </Typography>
            {isEditing ? (
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editBuzzerEnabled}
                      onChange={(e) => setEditBuzzerEnabled(e.target.checked)}
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
                  When enabled, matches start with a buzzer round. When
                  disabled, GM selects which team plays first.
                </Typography>
              </Box>
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {tournament.buzzerEnabled !== false ? "Enabled" : "Disabled"}
              </Typography>
            )}
          </Box>

          {/* Current Teams */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                fontWeight: 600,
                mb: 1,
                display: "block",
              }}
            >
              Registered Teams
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {tournament.teams?.length || 0} / {tournament.maxTeams}
            </Typography>
          </Box>

          {/* Status */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                fontWeight: 600,
                mb: 1,
                display: "block",
              }}
            >
              Status
            </Typography>
            <Chip
              label={tournament.status}
              color={getStatusColor(tournament.status)}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
