import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { API_URL } from "../../config/api";

interface Question {
  id: string;
  text: string;
}

export const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/questions`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          setQuestions([]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleAdd = () => {
    if (newQuestion && answer) {
      fetch(`${API_URL}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "General",
          text: newQuestion,
          answer,
        }),
      })
        .then((res) => res.json())
        .then((savedQ) => {
          setQuestions([...questions, savedQ]);
          setNewQuestion("");
          setAnswer("");
        });
    }
  };

  const handleDelete = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Buzzer Question Bank
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="New Question"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        <Button variant="contained" onClick={handleAdd}>
          Add
        </Button>
      </Box>
      <List>
        {questions.map((q) => (
          <ListItem
            key={q.id}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDelete(q.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={q.text} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
