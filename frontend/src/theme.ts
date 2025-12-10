import { createTheme } from "@mui/material/styles";
import {
  colors,
  typography,
  borderRadius,
  transitions,
} from "./design-system/tokens";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.primary,
      light: colors.primaryLight,
      dark: colors.primaryDark,
    },
    secondary: {
      main: colors.secondary,
      light: colors.secondaryLight,
      dark: colors.secondaryDark,
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    success: {
      main: colors.success,
      light: colors.successLight,
      dark: colors.successDark,
    },
    error: {
      main: colors.error,
      light: colors.errorLight,
      dark: colors.errorDark,
    },
    warning: {
      main: colors.warning,
      light: colors.warningLight,
      dark: colors.warningDark,
    },
    info: {
      main: colors.info,
      light: colors.infoLight,
      dark: colors.infoDark,
    },
  },
  typography: {
    fontFamily: typography.fontFamily.primary,
    h1: {
      fontWeight: typography.fontWeight.bold,
      letterSpacing: typography.letterSpacing.tighter,
    },
    h2: {
      fontWeight: typography.fontWeight.bold,
      letterSpacing: typography.letterSpacing.tight,
    },
    h3: {
      fontWeight: typography.fontWeight.bold,
    },
    h4: {
      fontWeight: typography.fontWeight.bold,
    },
    h5: {
      fontWeight: typography.fontWeight.semibold,
    },
    h6: {
      fontWeight: typography.fontWeight.semibold,
    },
    subtitle1: {
      fontWeight: typography.fontWeight.medium,
    },
    subtitle2: {
      fontWeight: typography.fontWeight.medium,
    },
    body1: {
      fontWeight: typography.fontWeight.normal,
    },
    body2: {
      fontWeight: typography.fontWeight.normal,
    },
    button: {
      textTransform: "none",
      fontWeight: typography.fontWeight.semibold,
      letterSpacing: typography.letterSpacing.wide,
    },
  },
  shape: {
    borderRadius: borderRadius.md,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        outlined: {
          border: `1px solid ${colors.border.default}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          padding: "10px 20px",
          fontSize: typography.fontSize.base,
          transition: transitions.preset.default,
          "&:hover": {
            transform: "none",
          },
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: `0 2px 8px ${colors.primaryAlpha[30]}`,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.default}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: typography.fontWeight.semibold,
          fontSize: typography.fontSize.base,
          minHeight: 48,
          "&.Mui-selected": {
            color: colors.primary,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: typography.fontWeight.semibold,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: transitions.preset.default,
          "&:hover": {
            backgroundColor: colors.background.elevated,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.primaryAlpha[50],
            },
          },
        },
      },
    },
  },
});
