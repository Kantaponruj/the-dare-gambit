/**
 * Design System - Animations
 *
 * This file contains reusable keyframe animations and animation utilities
 * for the game show application.
 *
 * @module design-system/animations
 */

import { keyframes } from "@emotion/react";

// ============================================================================
// KEYFRAME ANIMATIONS
// ============================================================================

/**
 * Float animation - Smooth up and down movement
 * Used for: Background elements, floating buttons, attention-grabbing elements
 */
export const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

/**
 * Pulse animation - Scaling effect
 * Used for: Buttons, notifications, alerts
 */
export const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
`;

/**
 * Fade in animation
 * Used for: Modal entrances, content reveals
 */
export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Fade out animation
 * Used for: Modal exits, content removals
 */
export const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

/**
 * Slide in from bottom
 * Used for: Notifications, bottom sheets
 */
export const slideInFromBottom = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

/**
 * Slide out to bottom
 * Used for: Dismissing notifications, bottom sheets
 */
export const slideOutToBottom = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

/**
 * Bounce animation
 * Used for: Success states, celebratory moments
 */
export const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
`;

/**
 * Shake animation
 * Used for: Error states, invalid inputs
 */
export const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
`;

/**
 * Spin animation
 * Used for: Loading indicators
 */
export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

/**
 * Glow animation - Pulsing glow effect
 * Used for: Highlighting important elements, active states
 */
export const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 138, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 138, 0, 0.8);
  }
`;

/**
 * Scale in animation
 * Used for: Modals, alerts
 */
export const scaleIn = keyframes`
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

/**
 * Scale out animation
 * Used for: Closing modals, alerts
 */
export const scaleOut = keyframes`
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9);
    opacity: 0;
  }
`;

/**
 * Blink animation
 * Used for: Timers, urgent notifications
 */
export const blink = keyframes`
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0.3;
  }
`;

/**
 * Slide in from right
 * Used for: Side panels, notifications
 */
export const slideInFromRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

/**
 * Slide in from left
 * Used for: Side panels, notifications
 */
export const slideInFromLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

/**
 * Wiggle animation
 * Used for: Drawing attention, interactive elements
 */
export const wiggle = keyframes`
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
`;

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

/**
 * Animation preset configurations
 * Use these for consistent animation timing across the app
 */
export const animationPresets = {
  // Quick animations for micro-interactions
  quick: {
    duration: "150ms",
    easing: "ease-out",
  },

  // Normal animations for most transitions
  normal: {
    duration: "200ms",
    easing: "ease-in-out",
  },

  // Slow animations for dramatic effects
  slow: {
    duration: "500ms",
    easing: "ease-in-out",
  },

  // Bouncy animations for playful effects
  bouncy: {
    duration: "600ms",
    easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
} as const;

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

/**
 * Helper to create animation string
 * @param animation - Keyframe animation
 * @param duration - Animation duration
 * @param timing - Timing function
 * @param iteration - Number of iterations (default: 1, use 'infinite' for infinite)
 */
export const createAnimation = (
  animation: ReturnType<typeof keyframes>,
  duration: string = "1s",
  timing: string = "ease-in-out",
  iteration: string | number = 1
) => {
  return `${animation} ${duration} ${timing} ${iteration}`;
};
