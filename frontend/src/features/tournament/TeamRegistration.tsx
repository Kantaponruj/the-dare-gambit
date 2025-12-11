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
import type { Team } from "../../types/game";

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
  onTeamsChange?: (teams: Team[]) => void;
  initialTeams?: Team[];
}

export const TeamRegistration: React.FC<TeamRegistrationProps> = ({
  onValidityChange,
  onTeamsChange,
  initialTeams = [],
}) => {
  const isOffline = !!onTeamsChange;
  const socket = useSocket();
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [memberInputs, setMemberInputs] = useState<{
    [teamId: string]: string[];
  }>({});
  const [playerPool, setPlayerPool] = useState("");
  const [isRandomizing, setIsRandomizing] = useState(false);

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
      if (data) {
        setTournament(data);
        // Only update teams from socket if not in offline/local mode
        if (!isOffline) {
          setTeams(data.teams || []);
        }
        setIsRandomizing(false); // Clear loading state

        // Initialize member inputs if teams exist (and we haven't already initialized them in offline mode)
        if (
          data.teams &&
          data.teams.length > 0 &&
          (!isOffline || Object.keys(memberInputs).length === 0)
        ) {
          const inputs: { [teamId: string]: string[] } = {};
          data.teams.forEach((team: any) => {
            if (team.members && team.members.length > 0) {
              inputs[team.id] = team.members.map((m: any) => m.name);
            } else {
              inputs[team.id] = Array(data.minMembersPerTeam || 1).fill("");
            }
          });
          setMemberInputs(inputs);
        }
      }
    });

    socket.on("tournament:randomize:ack", () => {
      // ACK received
    });

    socket.on("tournament:debug", () => {
      // Debug info received
    });

    socket.on("error", (err) => {
      console.error("TeamRegistration: Received socket error:", err);
      // Show error as a non-blocking toast or just log
    });

    return () => {
      socket.off("tournament:state");
      socket.off("tournament:randomize:ack");
      socket.off("tournament:debug");
      socket.off("error");
    };
  }, [socket]);

  // Sync initialTeams prop to local state (for offline mode initialization)
  useEffect(() => {
    if (
      isOffline &&
      initialTeams &&
      initialTeams.length > 0 &&
      teams.length === 0
    ) {
      setTeams(initialTeams);

      // Initialize member inputs
      const inputs: { [teamId: string]: string[] } = {};
      const minMembers = tournament?.minMembersPerTeam || 1;

      initialTeams.forEach((team: any) => {
        if (team.members && team.members.length > 0) {
          inputs[team.id] = team.members.map((m: any) => m.name);
        } else {
          inputs[team.id] = Array(minMembers).fill("");
        }
      });
      setMemberInputs(inputs);
    }
  }, [initialTeams, isOffline, tournament, teams.length]);

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

    if (isOffline) {
      const numTeams = parseInt(
        localStorage.getItem("tournament.numTeams") || "4"
      );
      const minMembers = tournament.minMembersPerTeam || 1;
      const newTeams = [];
      const inputs: any = {};

      for (let i = 0; i < numTeams; i++) {
        const teamId = `temp-${Date.now()}-${i}`;
        const teamName = `Team ${i + 1}`;
        const color = TEAM_COLORS[i % TEAM_COLORS.length].value;
        const image = TEAM_ICONS[i % TEAM_ICONS.length];

        newTeams.push({
          id: teamId,
          name: teamName,
          color,
          image,
          members: [],
          score: 0,
        });
        inputs[teamId] = Array(minMembers).fill("");
      }
      setTeams(newTeams);
      setMemberInputs(inputs);
      if (onTeamsChange) onTeamsChange(newTeams);
      return;
    }

    const numTeams = parseInt(
      localStorage.getItem("tournament.numTeams") || "4"
    );

    // Create all teams in a single batch by emitting them with small delay
    // to avoid overwhelming the socket
    const createTeam = (index: number) => {
      if (index >= numTeams) return;

      const teamName = `Team ${index + 1}`;
      const color = TEAM_COLORS[index % TEAM_COLORS.length].value;
      const image = TEAM_ICONS[index % TEAM_ICONS.length];

      socket.emit("team:register", { name: teamName, color, image });

      // Small delay between each to avoid flooding
      setTimeout(() => createTeam(index + 1), 50);
    };

    createTeam(0);
  };

  const generateTeamsLocally = (names: string[]) => {
    const numTeams =
      tournament?.maxTeams ||
      parseInt(localStorage.getItem("tournament.numTeams") || "4");
    const minMembers = tournament?.minMembersPerTeam || 1;

    const newTeams: any[] = [];
    const inputs: { [teamId: string]: string[] } = {};

    // Create teams
    for (let i = 0; i < numTeams; i++) {
      const teamId = `temp-${Date.now()}-${i}`; // Temporary ID
      const teamName = `Team ${i + 1}`;
      const color = TEAM_COLORS[i % TEAM_COLORS.length].value;
      const image = TEAM_ICONS[i % TEAM_ICONS.length];

      newTeams.push({
        id: teamId,
        name: teamName,
        color,
        image,
        members: [],
        score: 0,
      });

      inputs[teamId] = Array(minMembers).fill(""); // Init empty inputs
    }

    // Shuffle names
    const shuffled = [...names];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Distribute names
    shuffled.forEach((name, i) => {
      const teamIndex = i % newTeams.length;
      const team = newTeams[teamIndex];
      const member = {
        id: `mem-${Date.now()}-${i}`,
        name,
        role: "Member",
      };
      team.members.push(member);

      // Update input field
      const memberIdx = Math.floor(i / newTeams.length);
      if (!inputs[team.id]) inputs[team.id] = [];

      // Ensure input array is large enough
      if (memberIdx >= inputs[team.id].length) {
        // Fill gaps if any (though usually strictly sequential here)
        while (inputs[team.id].length <= memberIdx) inputs[team.id].push("");
      }
      inputs[team.id][memberIdx] = name;
    });

    return { teams: newTeams, inputs };
  };

  const handleRandomize = () => {
    if (!socket || !tournament || isRandomizing) {
      return;
    }

    const names = playerPool
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n);

    if (names.length === 0) {
      return;
    }

    setIsRandomizing(true);

    if (isOffline) {
      // Simulate short delay for UX
      setTimeout(() => {
        const { teams: newTeams, inputs: newInputs } =
          generateTeamsLocally(names);
        setTeams(newTeams);
        setMemberInputs(newInputs);
        if (onTeamsChange) onTeamsChange(newTeams);

        setPlayerPool("");
        setIsRandomizing(false);
      }, 300);
      return;
    }

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

    if (isOffline) {
      const teamId = `temp-${Date.now()}`;
      const newTeam = {
        id: teamId,
        name: teamName,
        color: selectedColor,
        image: selectedIcon,
        members: [],
        score: 0,
      };
      const newTeams = [...teams, newTeam];
      setTeams(newTeams);
      setMemberInputs((prev) => ({
        ...prev,
        [teamId]: Array(tournament.minMembersPerTeam || 1).fill(""),
      }));
      if (onTeamsChange) onTeamsChange(newTeams);

      setAddTeamDialogOpen(false);
      setTeamName("");
      return;
    }

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

    if (isOffline) {
      const newTeams = teams.map((t) => {
        if (t.id === editingTeam.id) {
          return {
            ...t,
            name: teamName,
            color: selectedColor,
            image: selectedIcon,
          };
        }
        return t;
      });
      setTeams(newTeams);
      if (onTeamsChange) onTeamsChange(newTeams);
      setEditTeamDialogOpen(false);
      setEditingTeam(null);
      return;
    }

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
      if (isOffline) {
        const newTeams = teams.filter((t) => t.id !== teamId);
        setTeams(newTeams);
        if (onTeamsChange) onTeamsChange(newTeams);
        return;
      }
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

    if (isOffline) {
      const members = memberInputs[teamId] || [];
      const newTeams = teams.map((t) => {
        if (t.id === teamId) {
          // Map string names to member objects
          return {
            ...t,
            members: members
              .filter((n) => n.trim())
              .map((name, i) => ({
                id: t.members[i]?.id || `mem-${Date.now()}-${i}`,
                name: name.trim(),
                role: "Member",
              })),
          };
        }
        return t;
      });
      setTeams(newTeams);
      if (onTeamsChange) onTeamsChange(newTeams);
      setEditingMembersTeamId(null);
      return;
    }

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
              disabled={!playerPool.trim() || isRandomizing}
              startIcon={<GroupsIcon />}
              sx={{ mt: 2 }}
            >
              {isRandomizing ? "Randomizing..." : "Randomize & Assign"}
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
