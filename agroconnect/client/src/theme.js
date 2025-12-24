import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#2e7d32",
      },
      background: {
        default: mode === "dark" ? "#0f172a" : "#f5f7fa",
        paper: mode === "dark" ? "#111827" : "#ffffff",
      },
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', sans-serif",
      h1: { fontSize: "2.6rem", fontWeight: 700 },
      h2: { fontSize: "2.2rem", fontWeight: 700 },
      h3: { fontSize: "1.9rem", fontWeight: 600 },
      h4: { fontSize: "1.6rem", fontWeight: 600 },
      h5: { fontSize: "1.3rem", fontWeight: 500 },
      body1: { fontSize: "1.05rem" },
      body2: { fontSize: "0.95rem" },
      button: {
        fontSize: "0.95rem",
        fontWeight: 600,
        textTransform: "none",
      },
    },
    shape: {
      borderRadius: 12,
    },
  });
