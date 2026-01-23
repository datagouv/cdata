# AGENTS.md

This document provides guidelines and information for agents working with this codebase.

## Project Overview

This is the frontend application for [data.gouv.fr](https://www.data.gouv.fr), France's Open Data platform. It's built with:

- **Framework**: Nuxt 3 (Vue 3)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + DSFR (Design System de la République Française)
- **State Management**: Vue 3 Composition API
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Key Directories and Files

- `pages/` - Page components and routes
- `components/` - Vue components used throughout the application
- `datagouv-components/` - Shared component library
- `composables/` - Reusable Vue composables
- `utils/` - Utility functions
- `assets/` - Static assets, CSS, fonts
- `server/` - Server-side routes and API handlers
- `tests/` - End-to-end tests (Playwright)
- `nuxt.config.ts` - Nuxt configuration
- `package.json` - Dependencies and scripts

## Essential Commands

```bash
# Development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Lint code
pnpm run lint

# Auto-fix linting issues
pnpm run lint:fix

# Run end-to-end tests
pnpm run test:e2e

# Run specific test
pnpm run test:e2e -- --testNamePattern="homepage is working"
```

## Code Structure and Patterns

### Component Structure

- All components use `<script setup>` syntax with Composition API
- Components follow a consistent naming pattern: `ComponentName.vue`
- Shared components are in `datagouv-components/` directory
- Page-specific components are in `components/` directory

### File Organization

- Pages are organized by feature in `pages/`
- Components are grouped by functionality in `components/`
- Utilities are in `utils/`
- Composables are in `composables/`

### TypeScript Usage

- Strongly typed components and functions
- Type definitions in `types/` directory
- Vue 3 Composition API with `setup` syntax
- Strict typing for props and emits

### State Management

- Uses Vue 3 Composition API (`ref`, `computed`, `watch`)
- Shared composables in `composables/`
- Global state through Nuxt's `useNuxtApp()` and `useRuntimeConfig()`

## Testing Approach

- End-to-end tests using Playwright
- Test files are in `tests/` directory
- Tests are structured by feature
- Uses snapshots for visual regression testing

## Key Features and Libraries

- **DSFR Integration**: Uses official French government's design system
- **Markdown Editor**: Uses Milkdown and ProseMirror
- **Map Components**: Uses Leaflet and MapLibre
- **Data Visualization**: Uses Chart.js
- **API Integration**: Connects to udata backend API
- **Internationalization**: Vue I18n for translations

## Environment Variables

Important environment variables used in development:
- `NUXT_PUBLIC_API_BASE`: Base URL for API calls
- `NUXT_PUBLIC_DEV_API_KEY`: API key for development environment
- `NUXT_APP_COMMIT_ID`: Git commit ID
- `NUXT_PUBLIC_BASE_URL`: Base URL for the application

## Development Guidelines

1. Follow Vue 3 Composition API patterns
2. Use `<script setup>` syntax for components
3. Use TypeScript for all code
4. Follow DSFR design system guidelines
5. Maintain accessibility standards (WCAG 2.1 AA)
6. Write clear, maintainable code
7. Follow ESLint and formatting rules
8. Use pre-commit hooks to auto-format code

## Build and Deployment

- Uses Docker for deployment
- CI pipeline with GitHub Actions
- Production build with `pnpm run build`
- Preview with `pnpm run preview`

## Gotchas and Non-obvious Patterns

1. The application uses a dual-package structure with a shared component library (`datagouv-components`)
2. The codebase includes both Nuxt 3 and Vue 3 components
3. Uses pnpm for dependency management with security features
4. The design system is French government specific - some assets are only available for French public services
5. Uses various third-party libraries for rich text editing, maps, data visualization
6. The codebase has specific configurations for development vs production environments
7. Authentication is handled through the udata backend