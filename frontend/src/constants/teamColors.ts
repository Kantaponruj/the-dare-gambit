export const TEAM_COLORS = [
  { name: "Red", value: "#ef4444", light: "#fca5a5" },
  { name: "Orange", value: "#f97316", light: "#fb923c" },
  { name: "Yellow", value: "#eab308", light: "#fde047" },
  { name: "Green", value: "#22c55e", light: "#86efac" },
  { name: "Blue", value: "#3b82f6", light: "#93c5fd" },
  { name: "Purple", value: "#a855f7", light: "#d8b4fe" },
  { name: "Pink", value: "#ec4899", light: "#f9a8d4" },
  { name: "Teal", value: "#14b8a6", light: "#5eead4" },
  { name: "Indigo", value: "#6366f1", light: "#a5b4fc" },
  { name: "Cyan", value: "#06b6d4", light: "#67e8f9" },
];

export const getAvailableColors = (usedColors: string[]) => {
  return TEAM_COLORS.filter((color) => !usedColors.includes(color.value));
};

export const getColorByValue = (value: string) => {
  return TEAM_COLORS.find((color) => color.value === value);
};
