/**
 * Design System - Main Export
 *
 * Central export point for all design system modules.
 * Import from this file to access all design system utilities.
 *
 * @module design-system
 *
 * @example
 * // Import tokens
 * import { colors, spacing, typography } from '@/design-system';
 *
 * @example
 * // Import animations
 * import { float, pulse, createAnimation } from '@/design-system';
 *
 * @example
 * // Import hooks
 * import { useDesignTokens, useAnimations } from '@/design-system';
 */

// Export all tokens
export * from "./tokens";

// Export all animations
export * from "./animations";

// Export all hooks
export * from "./hooks";

// Re-export theme for convenience
export { theme } from "../theme";
