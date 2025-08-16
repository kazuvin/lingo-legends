# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm install` - Install all dependencies
- `cd packages/web && pnpm dev` - Start development server (React Router v7 SPA mode)
- `cd packages/web && pnpm build` - Build for production
- `cd packages/web && pnpm start` - Start production server
- `cd packages/web && pnpm typecheck` - Run TypeScript type checking

### Storybook
- `cd packages/web && pnpm storybook` - Start Storybook development server on port 6006
- `cd packages/web && pnpm build-storybook` - Build Storybook for production

### Code Quality
- `prettier` is configured at the root level for code formatting

## Architecture

This is a monorepo using pnpm workspaces with the following structure:

### Technology Stack
- **Framework**: React Router v7 in SPA mode (SSR disabled)
- **Build Tool**: Vite with TypeScript
- **Styling**: Tailwind CSS v4 with class-variance-authority for component variants
- **Component Library**: Custom components with Storybook for documentation
- **Package Manager**: pnpm with workspace support

### Key Directories
- `packages/web/` - Main React application
- `packages/web/app/components/ui/` - Reusable UI components (Button, etc.)
- `packages/web/app/utils/` - Utility functions including `cn()` for className merging
- `packages/web/stories/` - Storybook stories and assets

### Component Architecture
- Components use `class-variance-authority` (cva) for variant-based styling
- The `cn()` utility (clsx + tailwind-merge) is used for conditional className composition
- UI components follow a consistent pattern with TypeScript interfaces extending HTML attributes
- Components use React.forwardRef for proper ref forwarding
- **Component Definition**: Use function declarations instead of React.FC. Prefer `export function ComponentName() {}` over `export const ComponentName: React.FC = () => {}`

### Styling System
- **Color System**: Uses OKLCH color space for shadcn/ui variables defined in `app.css` using Tailwind v4's `@theme` directive
- **Custom Properties**: All colors are defined as CSS custom properties with OKLCH values for better perceptual uniformity
- **Dark Mode**: Automatic dark mode support using CSS nesting syntax `&:is(.dark *)`
- **Semantic Colors**: Includes background, foreground, primary, secondary, muted, accent, destructive, border, input, ring colors
- **Chart Colors**: Predefined chart color palette (chart-1 through chart-5)

### Configuration
- `react-router.config.ts` - React Router configuration (SPA mode enabled)
- `vite.config.ts` - Vite build configuration with Tailwind CSS and TypeScript path support
- `.storybook/` - Storybook configuration for component documentation
- `pnpm-workspace.yaml` - Workspace configuration with build optimization settings
- `app.css` - Global styles with Tailwind imports and OKLCH color definitions