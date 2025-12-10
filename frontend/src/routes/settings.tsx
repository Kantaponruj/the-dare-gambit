import { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Tabs,
  Tab,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
  Button,
} from "@mui/material";
type SettingsSection = "general" | "game" | "tournament" | "data";

export function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>("general");
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="overline" color="text.secondary">
          Configuration
        </Typography>
        <Typography variant="h4">Application Settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage global, gameplay and tournament preferences.
        </Typography>
      </Stack>

      <Tabs
        value={section}
        onChange={(_, v) => setSection(v)}
        sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <Tab value="general" label="General" />
        <Tab value="game" label="Game" />
        <Tab value="tournament" label="Tournament" />
        <Tab value="data" label="Data" />
      </Tabs>

      {section === "general" && <GeneralSettings />}
      {section === "game" && <GameSettings />}
      {section === "tournament" && <TournamentSettings />}
      {section === "data" && <DataSettings />}
    </Stack>
  );
}

function SectionPaper({ children }: { children: React.ReactNode }) {
  return (
    <Paper sx={{ p: 3, background: "#2b2623", borderRadius: 2 }}>
      {children}
    </Paper>
  );
}

function GeneralSettings() {
  const [themeDark, setThemeDark] = useState(true);
  const [language, setLanguage] = useState("th");
  return (
    <SectionPaper>
      <Stack spacing={3}>
        <Typography variant="h6">General</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={themeDark}
              onChange={(e) => setThemeDark(e.target.checked)}
            />
          }
          label="Dark Theme"
        />
        <TextField
          label="Language Code"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          size="small"
          sx={{ maxWidth: 160 }}
        />
      </Stack>
    </SectionPaper>
  );
}

function GameSettings() {
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  return (
    <SectionPaper>
      <Stack spacing={3}>
        <Typography variant="h6">Game Settings</Typography>
        <TextField
          label="Default Timer Seconds"
          type="number"
          value={timerSeconds}
          onChange={(e) => setTimerSeconds(Number(e.target.value) || 0)}
          size="small"
          sx={{ maxWidth: 180 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
            />
          }
          label="Auto advance rounds"
        />
      </Stack>
    </SectionPaper>
  );
}

function TournamentSettings() {
  const [maxTeams, setMaxTeams] = useState(16);
  const [groupSize, setGroupSize] = useState(4);
  return (
    <SectionPaper>
      <Stack spacing={3}>
        <Typography variant="h6">Tournament</Typography>
        <TextField
          label="Max Teams"
          type="number"
          value={maxTeams}
          onChange={(e) => setMaxTeams(Number(e.target.value) || 0)}
          size="small"
          sx={{ maxWidth: 140 }}
        />
        <TextField
          label="Group Size"
          type="number"
          value={groupSize}
          onChange={(e) => setGroupSize(Number(e.target.value) || 0)}
          size="small"
          sx={{ maxWidth: 140 }}
        />
        <Typography variant="body2" color="text.secondary">
          Future: seeding, bracket format, elimination rules.
        </Typography>
      </Stack>
    </SectionPaper>
  );
}

function DataSettings() {
  return (
    <SectionPaper>
      <Stack spacing={3}>
        <Typography variant="h6">Data & Import/Export</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage persistence, backup and migration of show data.
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button variant="contained" color="primary" disabled>
            Export Data
          </Button>
          <Button variant="outlined" color="primary" disabled>
            Import Data
          </Button>
          <Button variant="text" color="error" disabled>
            Reset All
          </Button>
        </Box>
      </Stack>
    </SectionPaper>
  );
}
