/**
 * Design System - Core Design Tokens
 *
 * This file contains all the centralized design tokens for the game show application.
 * Import these tokens instead of hardcoding values throughout the application.
 *
 * @module design-system/tokens
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Brand Colors (Primary)
  primary: "#ff8a00",
  primaryLight: "#ffad4d",
  primaryDark: "#cc6e00",
  primaryAlpha: {
    10: "rgba(255, 138, 0, 0.1)",
    20: "rgba(255, 138, 0, 0.2)",
    30: "rgba(255, 138, 0, 0.3)",
    40: "rgba(255, 138, 0, 0.4)",
    50: "rgba(255, 138, 0, 0.5)",
    60: "rgba(255, 138, 0, 0.6)",
    70: "rgba(255, 138, 0, 0.7)",
    80: "rgba(255, 138, 0, 0.8)",
    90: "rgba(255, 138, 0, 0.9)",
  },

  // Secondary Colors
  secondary: "#4e9eff",
  secondaryLight: "#7bb5ff",
  secondaryDark: "#2b7acc",

  // Semantic Colors
  success: "#4caf50",
  successLight: "#6fbf73",
  successDark: "#357a38",

  error: "#f44336",
  errorLight: "#f6685e",
  errorDark: "#aa2e25",

  warning: "#ffc107",
  warningLight: "#ffcd38",
  warningDark: "#b28704",

  info: "#4e9eff",
  infoLight: "#7bb5ff",
  infoDark: "#2b7acc",

  // Grayscale
  black: "#000000",
  white: "#ffffff",
  gray: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#eeeeee",
    300: "#e0e0e0",
    400: "#bdbdbd",
    500: "#9e9e9e",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },

  // Background Colors
  background: {
    default: "#050201",
    paper: "#1a1a1a",
    dark: "#000000",
    elevated: "rgba(255, 255, 255, 0.05)",
  },

  // Text Colors
  text: {
    primary: "#ffffff",
    secondary: "rgba(255, 255, 255, 0.7)",
    tertiary: "rgba(255, 255, 255, 0.5)",
    disabled: "rgba(255, 255, 255, 0.3)",
  },

  // Border Colors
  border: {
    default: "rgba(255, 255, 255, 0.1)",
    light: "rgba(255, 255, 255, 0.05)",
    medium: "rgba(255, 255, 255, 0.2)",
    strong: "rgba(255, 255, 255, 0.3)",
  },

  // Team Colors (for game)
  team: {
    a: "#4e9eff",
    b: "#ff8a00",
  },

  // Special Colors
  transparent: "transparent",
} as const;

// ============================================================================
// SPACING
// ============================================================================

/**
 * Spacing scale based on 4px base unit
 * Use with MUI sx prop by dividing by 8: spacing.md / 8 = 2
 */
export const spacing = {
  xs: 4, // 0.5 in MUI (4/8)
  sm: 8, // 1 in MUI
  md: 16, // 2 in MUI
  lg: 24, // 3 in MUI
  xl: 32, // 4 in MUI
  "2xl": 40, // 5 in MUI
  "3xl": 48, // 6 in MUI
  "4xl": 64, // 8 in MUI
  "5xl": 80, // 10 in MUI
  "6xl": 96, // 12 in MUI
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font Family
  fontFamily: {
    primary:
      "'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    mono: "'Courier New', Courier, monospace",
  },

  // Font Sizes
  fontSize: {
    xs: "0.65rem", // 10.4px
    sm: "0.75rem", // 12px
    base: "0.875rem", // 14px
    md: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
    "7xl": "4.5rem", // 72px
  },

  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line Heights
  lineHeight: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: "-0.02em",
    tight: "-0.01em",
    normal: "0",
    wide: "0.01em",
    wider: "0.02em",
    widest: "0.1em",
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  full: 9999,
  circle: "50%",
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",

  // Glow effects (for game elements)
  glow: {
    primary: "0 0 20px rgba(255, 138, 0, 0.5)",
    primaryStrong: "0 0 40px rgba(255, 138, 0, 0.7)",
    success: "0 0 20px rgba(76, 175, 80, 0.5)",
    error: "0 0 20px rgba(244, 67, 54, 0.5)",
  },
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  // Duration
  duration: {
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
    slower: "500ms",
  },

  // Easing
  easing: {
    linear: "linear",
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },

  // Common presets
  preset: {
    default: "all 0.2s ease",
    fast: "all 0.15s ease",
    slow: "all 0.3s ease",
  },
} as const;

// ============================================================================
// Z-INDEX
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
} as const;
