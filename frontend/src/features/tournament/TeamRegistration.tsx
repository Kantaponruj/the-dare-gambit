import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSocket } from "../../context/SocketContext";
import { TEAM_COLORS } from "../../constants/teamColors";

// Preset team icons (emojis)
const TEAM_ICONS = [
  "🦁",
  "🐯",
  "🐻",
  "🦅",
  "🐺",
  "🦊",
  "🐉",
  "🦈",
  "🦄",
  "🐲",
  "🦖",
  "🦕",
  "🐙",
  "🦑",
  "🦇",
  "🦉",
];

interface TeamRegistrationProps {
  onValidityChange?: (isValid: boolean) => void;
}

export const TeamRegistration: React.FC<TeamRegistrationProps> = ({
  onValidityChange,
}) => {
  const socket = useSocket();
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [memberInputs, setMemberInputs] = useState<{
    [teamId: string]: string[];
  }>({});
  const [playerPool, setPlayerPool] = useState("");

  // Dialog states
  const [addTeamDialogOpen, setAddTeamDialogOpen] = useState(false);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);

  // Form states
  const [teamName, setTeamName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");

  // Track which team is being edited
  const [editingMembersTeamId, setEditingMembersTeamId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit("tournament:get_state");

    socket.on("tournament:state", (data) => {
      console.log("TeamRegistration: Received tournament:state", data);
      if (data) {
        setTournament(data);
        console.log("TeamRegistration: Setting teams", data.teams);
        setTeams(data.teams || []);

        // Initialize member inputs if teams exist
        if (data.teams && data.teams.length > 0) {
          const inputs: { [teamId: string]: string[] } = {};
          data.teams.forEach((team: any) => {
            if (team.members && team.members.length > 0) {
              console.log(
                `TeamRegistration: Team ${team.name} has ${team.members.length} members`
              );
              inputs[team.id] = team.members.map((m: any) => m.name);
            } else {
              console.log(
                `TeamRegistration: Team ${team.name} has no members, init empty`
              );
              inputs[team.id] = Array(data.minMembersPerTeam || 1).fill("");
            }
          });
          console.log("TeamRegistration: Setting memberInputs", inputs);
          setMemberInputs(inputs);
        }
      }
    });

    return () => {
      socket.off("tournament:state");
    };
  }, [socket]);

  // Check validity whenever teams or members change
  useEffect(() => {
    if (onValidityChange) {
      const isValid = allTeamsComplete();
      onValidityChange(isValid);
    }
  }, [teams, memberInputs, tournament]);

  const getUsedColors = () => {
    return teams.map((t) => t.color);
  };

  const getAvailableColors = () => {
    const used = getUsedColors();
    return TEAM_COLORS.filter((c) => !used.includes(c.value));
  };

  const handleAutoCreateTeams = () => {
    if (!socket || !tournament) return;

    const numTeams = parseInt(
      localStorage.getItem("tournament.numTeams") || "4"
    );

    for (let i = 0; i < numTeams; i++) {
      const teamName = `Team ${i + 1}`;
      const color = TEAM_COLORS[i % TEAM_COLORS.length].value;
      const image = TEAM_ICONS[i % TEAM_ICONS.length];

      socket.emit("team:register", { name: teamName, color, image });
    }
  };

  const handleRandomize = () => {
    if (!socket || !tournament) return;

    const names = playerPool
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n);

    if (names.length === 0) return;

    socket.emit("tournament:randomize", { names });
    setPlayerPool(""); // Clear input on success
  };

  const handleOpenAddDialog = () => {
    const availableColors = getAvailableColors();
    if (availableColors.length > 0) {
      setSelectedColor(availableColors[0].value);
    }
    setSelectedIcon(TEAM_ICONS[teams.length % TEAM_ICONS.length]);
    setTeamName(`Team ${teams.length + 1}`);
    setAddTeamDialogOpen(true);
  };

  const handleAddTeam = () => {
    if (!socket || !teamName.trim()) return;

    socket.emit("team:register", {
      name: teamName,
      color: selectedColor,
      image: selectedIcon,
    });

    setAddTeamDialogOpen(false);
    setTeamName("");
  };

  const handleOpenEditDialog = (team: any) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setSelectedColor(team.color);
    setSelectedIcon(team.image || TEAM_ICONS[0]);
    setEditTeamDialogOpen(true);
  };

  const handleEditTeam = () => {
    if (!socket || !editingTeam || !teamName.trim()) return;

    socket.emit("team:update", { teamId: editingTeam.id, name: teamName });

    if (selectedColor !== editingTeam.color) {
      socket.emit("team:update_color", {
        teamId: editingTeam.id,
        color: selectedColor,
      });
    }

    if (selectedIcon !== editingTeam.image) {
      socket.emit("team:update_image", {
        teamId: editingTeam.id,
        image: selectedIcon,
      });
    }

    setEditTeamDialogOpen(false);
    setEditingTeam(null);
  };

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    if (!socket) return;
    if (confirm(`Are you sure you want to delete "${teamName}"?`)) {
      socket.emit("team:delete", { teamId });
    }
  };

  const handleMemberNameChange = (
    teamId: string,
    index: number,
    value: string
  ) => {
    // Mark this team as being edited
    if (editingMembersTeamId !== teamId) {
      setEditingMembersTeamId(teamId);
    }

    setMemberInputs((prev) => ({
      ...prev,
      [teamId]: prev[teamId].map((name, i) => (i === index ? value : name)),
    }));
  };

  const handleAddMemberField = (teamId: string) => {
    // Mark this team as being edited
    if (editingMembersTeamId !== teamId) {
      setEditingMembersTeamId(teamId);
    }

    setMemberInputs((prev) => ({
      ...prev,
      [teamId]: [...(prev[teamId] || []), ""],
    }));
  };

  const handleRemoveMemberField = (teamId: string, index: number) => {
    // Mark this team as being edited
    if (editingMembersTeamId !== teamId) {
      setEditingMembersTeamId(teamId);
    }

    setMemberInputs((prev) => ({
      ...prev,
      [teamId]: prev[teamId].filter((_, i) => i !== index),
    }));
  };

  const handleSaveTeamMembers = (teamId: string) => {
    if (!socket) return;

    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const memberNames = memberInputs[teamId] || [];

    // Remove existing members
    team.members?.forEach((member: any) => {
      socket.emit("team:remove_member", { teamId, memberId: member.id });
    });

    // Add new members
    memberNames.forEach((name) => {
      if (name.trim()) {
        socket.emit("team:add_member", { teamId, memberName: name.trim() });
      }
    });

    // Clear editing state
    setEditingMembersTeamId(null);
  };

  const isTeamComplete = (teamId: string) => {
    const memberNames = memberInputs[teamId] || [];
    const minMembers = tournament?.minMembersPerTeam || 1;
    const filledMembers = memberNames.filter((name) => name.trim()).length;
    return filledMembers >= minMembers;
  };

  const allTeamsComplete = () => {
    return teams.length > 0 && teams.every((team) => isTeamComplete(team.id));
  };

  const canAddTeam = () => {
    return teams.length < (tournament?.maxTeams || 16);
  };

  if (!tournament) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with action buttons */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="body1" color="text.secondary">
            {teams.length === 0
              ? `Create teams and fill in member names (${tournament.minMembersPerTeam} members per team)`
              : `Fill in member names for each team (${tournament.minMembersPerTeam} members per team)`}
          </Typography>
          {allTeamsComplete() && (
            <Chip
              icon={<CheckCircleIcon />}
              label="All teams complete!"
              color="success"
              sx={{ mt: 1 }}
            />
          )}
        </Box>

        {teams.length === 0 ? (
          <Button
            variant="contained"
            size="large"
            startIcon={<GroupsIcon />}
            onClick={handleAutoCreateTeams}
          >
            Auto-Create {tournament.maxTeams} Teams
          </Button>
        ) : (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            disabled={!canAddTeam()}
          >
            Add Team
          </Button>
        )}
      </Box>

      {/* Player Pool Section */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, bgcolor: "#2a2a2a" }}>
        <Typography variant="h6" gutterBottom>
          Player Pool
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter all player names below (one per line). We'll randomize them into
          teams for you.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              multiline
              rows={6}
              fullWidth
              placeholder="Alice&#10;Bob&#10;Charlie&#10;..."
              value={playerPool}
              onChange={(e) => setPlayerPool(e.target.value)}
              sx={{ bgcolor: "rgba(0,0,0,0.2)" }}
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Status:
              </Typography>
              <Typography
                variant="body2"
                color={
                  playerPool.split("\n").filter((n) => n.trim()).length ===
                  (tournament.totalPeople || 0)
                    ? "success.main"
                    : "warning.main"
                }
              >
                • Entered:{" "}
                {playerPool.split("\n").filter((n) => n.trim()).length} /{" "}
                {localStorage.getItem("tournament.totalPeople") || "?"} required
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              onClick={handleRandomize}
              disabled={!playerPool.trim()}
              startIcon={<GroupsIcon />}
              sx={{ mt: 2 }}
            >
              Randomize & Assign
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Teams Grid */}
      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid size={{ xs: 12, md: 6 }} key={team.id}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                borderColor: team.color,
                borderWidth: 2,
                bgcolor: `${team.color}10`,
              }}
            >
              {/* Team Header */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Avatar
                  sx={{
                    bgcolor: team.color,
                    width: 50,
                    height: 50,
                    fontSize: "1.5rem",
                  }}
                >
                  {team.image || <GroupsIcon />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {team.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {memberInputs[team.id]?.filter((n) => n.trim()).length || 0}{" "}
                    / {tournament.minMembersPerTeam} members
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEditDialog(team)}
                    sx={{ color: "primary.main" }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteTeam(team.id, team.name)}
                    sx={{ color: "error.main" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                {isTeamComplete(team.id) && <CheckCircleIcon color="success" />}
              </Box>

              {/* Member Inputs */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {(memberInputs[team.id] || []).map((memberName, index) => (
                  <Box key={index} sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      label={`Member ${index + 1}`}
                      value={memberName}
                      onChange={(e) =>
                        handleMemberNameChange(team.id, index, e.target.value)
                      }
                      size="small"
                      fullWidth
                      placeholder={`Enter name for member ${index + 1}`}
                    />
                    {(memberInputs[team.id]?.length || 0) >
                      tournament.minMembersPerTeam && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveMemberField(team.id, index)}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}

                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddMemberField(team.id)}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Add Member
                </Button>
              </Box>

              {/* Save Button - only show when this team is being edited */}
              {editingMembersTeamId === team.id && (
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 2,
                    bgcolor: team.color,
                    "&:hover": {
                      bgcolor: team.color,
                      opacity: 0.9,
                    },
                  }}
                  onClick={() => handleSaveTeamMembers(team.id)}
                >
                  Save Team Members
                </Button>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Add Team Dialog */}
      <Dialog
        open={addTeamDialogOpen}
        onClose={() => setAddTeamDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Team</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              fullWidth
              autoFocus
            />

            <FormControl fullWidth>
              <InputLabel>Team Color</InputLabel>
              <Select
                value={selectedColor}
                label="Team Color"
                onChange={(e) => setSelectedColor(e.target.value)}
              >
                {getAvailableColors().map((color) => (
                  <MenuItem key={color.value} value={color.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: color.value,
                          border: "1px solid rgba(255,255,255,0.3)",
                        }}
                      />
                      {color.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Team Icon</InputLabel>
              <Select
                value={selectedIcon}
                label="Team Icon"
                onChange={(e) => setSelectedIcon(e.target.value)}
              >
                {TEAM_ICONS.map((icon) => (
                  <MenuItem key={icon} value={icon}>
                    <Box sx={{ fontSize: "1.5rem" }}>{icon}</Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTeamDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddTeam}
            variant="contained"
            disabled={!teamName.trim()}
          >
            Add Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog
        open={editTeamDialogOpen}
        onClose={() => setEditTeamDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Team</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              fullWidth
              autoFocus
            />

            <FormControl fullWidth>
              <InputLabel>Team Color</InputLabel>
              <Select
                value={selectedColor}
                label="Team Color"
                onChange={(e) => setSelectedColor(e.target.value)}
              >
                {TEAM_COLORS.filter(
                  (c) =>
                    c.value === editingTeam?.color ||
                    !getUsedColors().includes(c.value)
                ).map((color) => (
                  <MenuItem key={color.value} value={color.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: color.value,
                          border: "1px solid rgba(255,255,255,0.3)",
                        }}
                      />
                      {color.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Team Icon</InputLabel>
              <Select
                value={selectedIcon}
                label="Team Icon"
                onChange={(e) => setSelectedIcon(e.target.value)}
              >
                {TEAM_ICONS.map((icon) => (
                  <MenuItem key={icon} value={icon}>
                    <Box sx={{ fontSize: "1.5rem" }}>{icon}</Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTeamDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditTeam}
            variant="contained"
            disabled={!teamName.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
