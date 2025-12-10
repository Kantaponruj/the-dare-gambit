# Design System Documentation

## Overview

The design system provides a centralized set of design tokens, animations, and utilities for building consistent UI components across the game show application.

## Installation

All design system files are located in `src/design-system/`:

- `tokens.ts` - Color palette, spacing, typography, etc.
- `animations.ts` - Keyframe animations
- `hooks.ts` - React hooks for accessing tokens
- `index.ts` - Main export file

## Usage

### Basic Import

```typescript
import { colors, spacing, typography } from "@/design-system";
```

### Using with MUI Components

```typescript
import { colors, borderRadius } from "@/design-system";

<Button
  sx={{
    bgcolor: colors.primary,
    borderRadius: borderRadius.md / 8,
    "&:hover": {
      bgcolor: colors.primaryDark,
    },
  }}
>
  Click me
</Button>;
```

### Using Hooks

```typescript
import { useDesignTokens, useAnimations } from "@/design-system";

function MyComponent() {
  const { colors, spacing } = useDesignTokens();
  const { float } = useAnimations();

  return (
    <Box
      sx={{
        color: colors.primary,
        padding: spacing.md / 8,
        animation: `${float} 3s ease-in-out infinite`,
      }}
    >
      Floating content
    </Box>
  );
}
```

### Using Animations

```typescript
import { float, pulse, createAnimation } from "@/design-system";

<Box
  sx={{
    animation: `${float} 3s ease-in-out infinite`,
    // or using the helper
    animation: createAnimation(pulse, "1s", "ease", "infinite"),
  }}
/>;
```

## Design Tokens Reference

### Colors

```typescript
colors.primary; // #ff8a00 (Main brand color)
colors.success; // #4caf50 (Success state)
colors.error; // #f44336 (Error state)
colors.primaryAlpha[50]; // rgba(255, 138, 0, 0.5) (50% opacity)
```

### Spacing

```typescript
spacing.xs; // 4px
spacing.sm; // 8px
spacing.md; // 16px
spacing.lg; // 24px
spacing.xl; // 32px

// For MUI sx prop, divide by 8:
padding: spacing.md / 8; // padding: 2 (in MUI units)
```

### Typography

```typescript
typography.fontFamily.primary;
typography.fontSize.xl;
typography.fontWeight.bold;
typography.lineHeight.normal;
```

### Border Radius

```typescript
borderRadius.sm; // 4px
borderRadius.md; // 8px
borderRadius.lg; // 12px
borderRadius.full; // 9999px (fully rounded)
```

## Examples

### Button with Primary Color

```typescript
<Button
  sx={{
    bgcolor: colors.primary,
    color: colors.white,
    "&:hover": {
      bgcolor: colors.primaryDark,
      boxShadow: shadows.glow.primary,
    },
  }}
>
  Action Button
</Button>
```

### Animated Card

```typescript
import { float } from "@/design-system";

<Paper
  sx={{
    bgcolor: colors.background.paper,
    border: `1px solid ${colors.border.default}`,
    borderRadius: borderRadius.lg / 8,
    animation: `${float} 3s ease-in-out infinite`,
  }}
>
  Content
</Paper>;
```

### Responsive Spacing

```typescript
<Box
  sx={{
    p: { xs: spacing.sm / 8, md: spacing.lg / 8 },
    mt: spacing.xl / 8,
  }}
>
  Content
</Box>
```

## Migration Guide

### Before (Hardcoded values)

```typescript
<Box
  sx={{
    bgcolor: "#ff8a00",
    color: "#fff",
    p: 2,
    borderRadius: "8px",
  }}
/>
```

### After (Using design system)

```typescript
import { colors, spacing, borderRadius } from "@/design-system";

<Box
  sx={{
    bgcolor: colors.primary,
    color: colors.white,
    p: spacing.md / 8,
    borderRadius: borderRadius.md / 8,
  }}
/>;
```

## Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Use semantic color names** (e.g., `colors.success` instead of `colors.green`)
3. **Divide spacing by 8** when using with MUI sx prop
4. **Import only what you need** to keep bundle size small
5. **Use hooks in components** for better reactivity

## Contributing

When adding new tokens:

1. Add to appropriate section in `tokens.ts`
2. Use descriptive names
3. Group related values together
4. Document usage in this README
