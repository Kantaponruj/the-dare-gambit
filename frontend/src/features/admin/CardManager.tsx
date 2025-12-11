import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card as MuiCard,
  CardContent,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import QuizIcon from "@mui/icons-material/Quiz";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import { API_URL } from "../../config/api";

type CardType = "TRUTH" | "DARE";

interface Card {
  id: string;
  category: string;
  type: CardType;
  text: string; // Changed from 'question' to match server
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  points: number; // Changed from 'score' to match server
  answers?: string[];
  correctAnswer?: string;
}

export const CardManager: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("All");
  const [filterPoints, setFilterPoints] = useState<string>("All");

  // Dialog State
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    category: string;
    type: CardType;
    text: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    points: number;
    answers: string[];
    correctAnswer: string;
  }>({
    category: "",
    type: "TRUTH",
    text: "",
    difficulty: "EASY",
    points: 100,
    answers: ["", "", "", ""],
    correctAnswer: "",
  });

  useEffect(() => {
    fetchCards();
    fetchCategories();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetch(`${API_URL}/cards`);
      const data = await res.json();
      setCards(data);
    } catch (error) {
      console.error("Failed to fetch cards", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleOpen = (card?: Card) => {
    if (card) {
      setEditingId(card.id);
      setFormData({
        category: card.category,
        type: card.type,
        text: card.text,
        difficulty: card.difficulty || "EASY",
        points: card.points,
        answers: card.answers || ["", "", "", ""],
        correctAnswer: card.correctAnswer || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        category: categories[0] || "",
        type: "TRUTH",
        text: "",
        difficulty: "EASY",
        points: 100,
        answers: ["", "", "", ""],
        correctAnswer: "",
      });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    const payload: any = {
      category: formData.category,
      type: formData.type,
      text: formData.text,
      difficulty: formData.difficulty,
      points: formData.points,
    };

    if (formData.type === "TRUTH") {
      payload.answers = formData.answers;
      payload.correctAnswer = formData.correctAnswer;
    }

    try {
      if (editingId) {
        await fetch(`${API_URL}/cards/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${API_URL}/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setOpen(false);
      fetchCards();
    } catch (error) {
      console.error("Failed to save card", error);
      alert("Failed to save card. Please check inputs.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    try {
      await fetch(`${API_URL}/cards/${id}`, {
        method: "DELETE",
      });
      fetchCards();
    } catch (error) {
      console.error("Failed to delete card", error);
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = `${API_URL}/cards/template`;
  };

  const handleImportCSV = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/cards/import`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully imported ${data.count} cards!`);
        fetchCards();
      } else {
        alert("Failed to import cards: " + data.message);
      }
    } catch (error) {
      console.error("Failed to import cards", error);
      alert("Failed to import cards. Please check the file format.");
    }
    // Reset file input
    event.target.value = "";
  };

  const filteredCards = cards.filter((card) => {
    // Category filter
    if (filterCategory !== "All" && card.category !== filterCategory) {
      return false;
    }
    // Type filter
    if (filterType !== "All" && card.type !== filterType) {
      return false;
    }
    // Difficulty filter
    if (
      filterDifficulty !== "All" &&
      (card.difficulty || "EASY") !== filterDifficulty
    ) {
      return false;
    }
    // Points filter
    if (filterPoints !== "All") {
      if (filterPoints === "100" && card.points !== 100) return false;
      if (filterPoints === "200" && card.points !== 200) return false;
      if (filterPoints === "300" && card.points !== 300) return false;
    }
    return true;
  });

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mr: 1 }}>
            Cards
          </Typography>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              label="Category"
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType}
              label="Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="TRUTH">TRUTH</MenuItem>
              <MenuItem value="DARE">DARE</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={filterDifficulty}
              label="Difficulty"
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="EASY">EASY</MenuItem>
              <MenuItem value="MEDIUM">MEDIUM</MenuItem>
              <MenuItem value="HARD">HARD</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Points</InputLabel>
            <Select
              value={filterPoints}
              label="Points"
              onChange={(e) => setFilterPoints(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="100">100 pts</MenuItem>
              <MenuItem value="200">200 pts</MenuItem>
              <MenuItem value="300">300 pts</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleDownloadTemplate}
          >
            Template
          </Button>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
          >
            Import CSV
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleImportCSV}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Card
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2.5}>
        {filteredCards.map((card) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={card.id}>
            <MuiCard
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "rgba(255, 255, 255, 0.1)",
                bgcolor: "rgba(255, 255, 255, 0.02)",
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.5)",
                  borderColor:
                    card.type === "TRUTH"
                      ? "rgba(249, 115, 22, 0.5)"
                      : "rgba(16, 185, 129, 0.5)",
                },
              }}
            >
              {/* Card Header */}
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor:
                    card.type === "TRUTH"
                      ? "rgba(249, 115, 22, 0.1)"
                      : "rgba(16, 185, 129, 0.1)",
                  borderBottom: "1px solid",
                  borderColor:
                    card.type === "TRUTH"
                      ? "rgba(249, 115, 22, 0.2)"
                      : "rgba(16, 185, 129, 0.2)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  {card.type === "TRUTH" ? (
                    <QuizIcon sx={{ color: "#f97316", fontSize: 20 }} />
                  ) : (
                    <EmojiEventsIcon sx={{ color: "#10b981", fontSize: 20 }} />
                  )}
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: card.type === "TRUTH" ? "#f97316" : "#10b981",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {card.type}
                  </Typography>
                </Stack>
                <Chip
                  label={`${card.points} PTS`}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    bgcolor:
                      card.type === "TRUTH"
                        ? "rgba(249, 115, 22, 0.2)"
                        : "rgba(16, 185, 129, 0.2)",
                    color: card.type === "TRUTH" ? "#f97316" : "#10b981",
                    border: "1px solid",
                    borderColor:
                      card.type === "TRUTH"
                        ? "rgba(249, 115, 22, 0.3)"
                        : "rgba(16, 185, 129, 0.3)",
                  }}
                />
              </Box>

              <CardContent
                sx={{
                  p: 2.5,
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {/* Main Content */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.4,
                    minHeight: "3em",
                    fontSize: "1.1rem",
                  }}
                >
                  {card.text}
                </Typography>

                {/* Answers Section (TRUTH only) */}
                {card.type === "TRUTH" && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      mt: "auto",
                    }}
                  >
                    {card.answers?.map((ans, idx) => {
                      const isCorrect = ans === card.correctAnswer;
                      return (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: isCorrect
                              ? "rgba(16, 185, 129, 0.1)"
                              : "rgba(255, 255, 255, 0.03)",
                            border: "1px solid",
                            borderColor: isCorrect
                              ? "rgba(16, 185, 129, 0.3)"
                              : "transparent",
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: isCorrect
                                ? "#10b981"
                                : "rgba(255, 255, 255, 0.2)",
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: isCorrect ? "#10b981" : "text.secondary",
                              fontWeight: isCorrect ? 600 : 400,
                              flex: 1,
                            }}
                          >
                            {ans}
                          </Typography>
                          {isCorrect && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#10b981",
                                fontWeight: 700,
                                fontSize: "0.7rem",
                                textTransform: "uppercase",
                              }}
                            >
                              Correct
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {/* Footer Metadata */}
                <Box
                  sx={{
                    mt: card.type === "DARE" ? "auto" : 2,
                    pt: 2,
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={card.category}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        bgcolor: "rgba(59, 130, 246, 0.15)",
                        color: "#60a5fa",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                      }}
                    />
                    <Chip
                      label={card.difficulty || "EASY"}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        bgcolor:
                          card.difficulty === "HARD"
                            ? "rgba(239, 68, 68, 0.15)"
                            : card.difficulty === "MEDIUM"
                            ? "rgba(245, 158, 11, 0.15)"
                            : "rgba(34, 197, 94, 0.15)",
                        color:
                          card.difficulty === "HARD"
                            ? "#f87171"
                            : card.difficulty === "MEDIUM"
                            ? "#fbbf24"
                            : "#4ade80",
                        border: "1px solid",
                        borderColor:
                          card.difficulty === "HARD"
                            ? "rgba(239, 68, 68, 0.3)"
                            : card.difficulty === "MEDIUM"
                            ? "rgba(245, 158, 11, 0.3)"
                            : "rgba(34, 197, 94, 0.3)",
                      }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(card)}
                      sx={{
                        color: "text.secondary",
                        "&:hover": {
                          color: "primary.main",
                          bgcolor: "rgba(249, 115, 22, 0.1)",
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(card.id)}
                      sx={{
                        color: "text.secondary",
                        "&:hover": {
                          color: "error.main",
                          bgcolor: "rgba(239, 68, 68, 0.1)",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              </CardContent>
            </MuiCard>
          </Grid>
        ))}
      </Grid>

      {filteredCards.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 3,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 2,
          }}
        >
          <QuizIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
          <Typography variant="body1" sx={{ mb: 0.5 }}>
            No cards found
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {filterCategory === "All"
              ? "Add your first card to get started"
              : `No cards in "${filterCategory}" category`}
          </Typography>
        </Box>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingId ? "Edit Card" : "Add New Card"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as CardType,
                    })
                  }
                >
                  <MenuItem value="TRUTH">TRUTH</MenuItem>
                  <MenuItem value="DARE">DARE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={formData.difficulty}
                  label="Difficulty"
                  onChange={(e) => {
                    const diff = e.target.value as "EASY" | "MEDIUM" | "HARD";
                    const points =
                      diff === "EASY" ? 100 : diff === "MEDIUM" ? 200 : 300;
                    setFormData({
                      ...formData,
                      difficulty: diff,
                      points: points,
                    });
                  }}
                >
                  <MenuItem value="EASY">EASY (100 pts)</MenuItem>
                  <MenuItem value="MEDIUM">MEDIUM (200 pts)</MenuItem>
                  <MenuItem value="HARD">HARD (300 pts)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Question / Content"
                fullWidth
                multiline
                rows={3}
                margin="dense"
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
              />
            </Grid>

            {formData.type === "TRUTH" && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mt: 1, mb: 1, fontWeight: 600 }}
                  >
                    Answers (Select the correct one)
                  </Typography>
                </Grid>
                {formData.answers.map((ans, index) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={index}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === ans && ans !== ""}
                        onChange={() =>
                          setFormData({ ...formData, correctAnswer: ans })
                        }
                        disabled={ans === ""}
                        style={{
                          width: 18,
                          height: 18,
                          accentColor: "#f97316",
                          cursor: ans === "" ? "not-allowed" : "pointer",
                        }}
                      />
                      <TextField
                        label={`Answer ${index + 1}`}
                        fullWidth
                        size="small"
                        value={ans}
                        onChange={(e) => {
                          const newAnswers = [...formData.answers];
                          newAnswers[index] = e.target.value;
                          let newCorrect = formData.correctAnswer;
                          if (formData.correctAnswer === ans) {
                            newCorrect = e.target.value;
                          }
                          setFormData({
                            ...formData,
                            answers: newAnswers,
                            correctAnswer: newCorrect,
                          });
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
