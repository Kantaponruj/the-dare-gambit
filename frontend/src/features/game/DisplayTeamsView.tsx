import React from "react";
import { Box, Typography, Paper, Avatar, Grid } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import type { Team } from "../../types/game";

interface DisplayTeamsViewProps {
  teams: Team[];
}

export const DisplayTeamsView: React.FC<DisplayTeamsViewProps> = ({
  teams,
}) => {
  if (!teams || teams.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}
        >
          ยังไม่มีทีมลงทะเบียน
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h3"
        sx={{
          color: "#fff",
          fontWeight: 700,
          textAlign: "center",
          mb: 4,
          fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
        }}
      >
        🏆 ทีมที่เข้าร่วม
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {teams.map((team) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={team.id}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: `${team.color}15`,
                border: `2px solid ${team.color}`,
                borderRadius: 3,
                height: "100%",
                boxShadow: `0 0 20px ${team.color}30`,
              }}
            >
              {/* Team Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: team.color,
                    width: 60,
                    height: 60,
                    fontSize: "2rem",
                    boxShadow: `0 0 15px ${team.color}50`,
                  }}
                >
                  {team.image || <GroupsIcon />}
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: { xs: "1.2rem", sm: "1.4rem" },
                    }}
                  >
                    {team.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {team.members?.length || 0} สมาชิก
                  </Typography>
                </Box>
              </Box>

              {/* Members List */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  mt: 2,
                }}
              >
                {team.members?.map((member, index) => (
                  <Box
                    key={member.id || index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1,
                      bgcolor: "rgba(255,255,255,0.05)",
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: team.color,
                      }}
                    />
                    <Typography
                      sx={{
                        color: "#fff",
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                    >
                      {member.name}
                    </Typography>
                  </Box>
                ))}
                {(!team.members || team.members.length === 0) && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255,255,255,0.4)",
                      fontStyle: "italic",
                      textAlign: "center",
                    }}
                  >
                    ยังไม่มีสมาชิก
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
