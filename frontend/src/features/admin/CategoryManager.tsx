import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  Divider,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";

const API_URL = import.meta.env.VITE_API_URL;

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    try {
      await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory }),
      });
      setNewCategory("");
      setOpenAdd(false);
      fetchCategories();
    } catch (error) {
      console.error("Failed to add category", error);
    }
  };

  const handleDelete = async (name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? All associated cards will be deleted.`
      )
    )
      return;
    try {
      await fetch(`${API_URL}/categories/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category", error);
    }
  };

  const handleEditOpen = (name: string) => {
    setEditingCategory(name);
    setEditValue(name);
    setOpenEdit(true);
  };

  const handleEditSave = async () => {
    if (!editValue.trim() || !editingCategory) return;
    try {
      await fetch(
        `${API_URL}/categories/${encodeURIComponent(editingCategory)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newName: editValue }),
        }
      );
      setOpenEdit(false);
      setEditingCategory("");
      setEditValue("");
      fetchCategories();
    } catch (error) {
      console.error("Failed to update category", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAdd(true)}
        >
          Add Category
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <List disablePadding>
          {categories.map((cat, index) => (
            <React.Fragment key={cat}>
              {index > 0 && <Divider />}
              <ListItem
                secondaryAction={
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                      onClick={() => handleEditOpen(cat)}
                      size="medium"
                      sx={{ color: "primary.main" }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(cat)}
                      size="medium"
                      sx={{ color: "error.main" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
                sx={{
                  py: 2,
                  px: 2,
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    mr: 2,
                    width: 40,
                    height: 40,
                  }}
                >
                  <CategoryIcon />
                </Avatar>
                <ListItemText
                  primary={cat}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: "1rem",
                  }}
                />
              </ListItem>
            </React.Fragment>
          ))}
          {categories.length === 0 && (
            <Box
              sx={{
                p: 6,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <CategoryIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                No categories yet
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Add your first category to get started
              </Typography>
            </Box>
          )}
        </List>
      </Paper>

      {/* Add Dialog */}
      <Dialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        PaperProps={{ sx: { minWidth: 400 } }}
      >
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        PaperProps={{ sx: { minWidth: 400 } }}
      >
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleEditSave();
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
