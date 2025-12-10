import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { router } from "./router";
import { theme } from "./theme";
import "./index.css";

const queryClient = new QueryClient();

console.log("App mounting: initializing query client and router");
// Global error diagnostics to help trace blank screen issues.
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    console.error("GlobalError", e.error || e.message);
  });
  window.addEventListener("unhandledrejection", (e) => {
    console.error("UnhandledRejection", e.reason);
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-left" />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
