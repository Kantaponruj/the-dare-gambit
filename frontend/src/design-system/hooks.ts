/**
 * Design System - Utility Hooks
 *
 * Custom hooks for accessing design system tokens and utilities
 *
 * @module design-system/hooks
 */

import { useMemo } from "react";
import * as tokens from "./tokens";
import * as animations from "./animations";

/**
 * Hook to access design system tokens
 * Provides easy access to colors, spacing, typography, etc.
 *
 * @example
 * const { colors, spacing } = useDesignTokens();
 * <Box sx={{ color: colors.primary, mt: spacing.md / 8 }} />
 */
export const useDesignTokens = () => {
  return useMemo(
    () => ({
      colors: tokens.colors,
      spacing: tokens.spacing,
      typography: tokens.typography,
      borderRadius: tokens.borderRadius,
      shadows: tokens.shadows,
      transitions: tokens.transitions,
      zIndex: tokens.zIndex,
      breakpoints: tokens.breakpoints,
    }),
    []
  );
};

/**
 * Hook to access animations
 * Provides easy access to keyframe animations
 *
 * @example
 * const { float, pulse } = useAnimations();
 * <Box sx={{ animation: `${float} 3s ease-in-out infinite` }} />
 */
export const useAnimations = () => {
  return useMemo(
    () => ({
      float: animations.float,
      pulse: animations.pulse,
      fadeIn: animations.fadeIn,
      fadeOut: animations.fadeOut,
      slideInFromBottom: animations.slideInFromBottom,
      slideOutToBottom: animations.slideOutToBottom,
      bounce: animations.bounce,
      shake: animations.shake,
      spin: animations.spin,
      glow: animations.glow,
      scaleIn: animations.scaleIn,
      scaleOut: animations.scaleOut,
      blink: animations.blink,
      slideInFromRight: animations.slideInFromRight,
      slideInFromLeft: animations.slideInFromLeft,
      wiggle: animations.wiggle,
      createAnimation: animations.createAnimation,
      presets: animations.animationPresets,
    }),
    []
  );
};

/**
 * Hook to get responsive spacing values
 * Converts spacing tokens to MUI-compatible values (divided by 8)
 *
 * @example
 * const spacing = useSpacing();
 * <Box sx={{ mt: spacing.md, px: spacing.lg }} />
 */
export const useSpacing = () => {
  return useMemo(
    () => ({
      xs: tokens.spacing.xs / 8, // 0.5
      sm: tokens.spacing.sm / 8, // 1
      md: tokens.spacing.md / 8, // 2
      lg: tokens.spacing.lg / 8, // 3
      xl: tokens.spacing.xl / 8, // 4
      "2xl": tokens.spacing["2xl"] / 8, // 5
      "3xl": tokens.spacing["3xl"] / 8, // 6
      "4xl": tokens.spacing["4xl"] / 8, // 8
      "5xl": tokens.spacing["5xl"] / 8, // 10
      "6xl": tokens.spacing["6xl"] / 8, // 12
    }),
    []
  );
};
