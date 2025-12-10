import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({}) => {
  const port = Number(process.env.FRONTEND_PORT || 5180);
  return {
    plugins: [react()],
    server: {
      port,
      host: "0.0.0.0",
    },
    preview: {
      port,
      host: "0.0.0.0",
    },
  };
});
