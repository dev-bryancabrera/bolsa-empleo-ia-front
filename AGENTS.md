# AGENTS.md

This file contains project guidelines for agentic coding agents working in this bolsa-empleo-ia repository.

## Project Overview

This is a React 19 + TypeScript job board application with AI-powered features. The project uses:
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: Zustand
- **Routing**: React Router v7
- **HTTP Client**: Axios with interceptors
- **UI Components**: Radix UI primitives with custom shadcn/ui implementations

## Development Commands

### Essential Commands
- `npm run dev` - Start development server
- `npm run build` - Production build (runs TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint on the codebase
- `npm run preview` - Preview production build locally

### Running Tests
⚠️ **No test framework currently configured** - The project lacks Jest, Vitest, or any testing setup. Consider adding Vitest for React testing.

## Project Structure & Conventions

### File Organization
```
src/
├── core/           # Shared utilities and UI components
│   ├── api/       # Axios instances and API configurations
│   ├── components/ui/  # shadcn/ui components
│   ├── helpers/   # Utility functions
│   └── utils/     # Shared utilities
├── lib/           # External library configurations
├── modules/       # Feature-based modules
│   ├── auth/      # Authentication (pages, services, store)
│   ├── users/     # User management
│   ├── chat/      # Chat functionality
│   └── dashboard/ # Main dashboard
└── routes/        # App routing configuration
```

### Import Aliases
- `@/*` maps to `src/*` - Use this for all internal imports
- Examples: `@/core/components/ui/button`, `@/lib/utils`, `@/modules/auth/services/AuthService`

### Import Order (Convention observed in codebase)
1. React and React Router imports
2. Third-party library imports (@radix-ui, axios, zustand)
3. Internal imports with @ alias (grouped by proximity)
4. Type imports (if separate)

```typescript
// Example import order
import { useNavigate } from "react-router-dom"
import { create } from 'zustand'
import axios from 'axios'

import { Button } from "@/core/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuthStore } from "../services/AuthService"
```

## Code Style Guidelines

### TypeScript Conventions
- Use interfaces for object shapes, types for unions/primitives
- Prefer explicit return types for functions
- Use `React.ComponentProps<"div">` for extending HTML element props
- Use `unknown` instead of `any` for error handling

### Component Patterns
- Use function components with React 19 features
- Export components with descriptive names: `export function ComponentName()`
- Use `cn()` utility for conditional Tailwind classes
- Destructure props with `{ className, ...props }` pattern

### State Management
- Use Zustand for global state
- Follow the pattern: `interface State { ... }` then `create<State>((set) => ({ ... }))`
- Store authentication status as: `'checking' | 'authenticated' | 'not-authenticated'`

### Error Handling
- Use try-catch blocks with proper error typing
- Check for Axios errors: `if (axios.isAxiosError(error) && error.response)`
- Provide user-friendly error messages
- Log errors for debugging: `console.error("Error en operation:", error)`

### Styling Conventions
- Use Tailwind CSS classes exclusively
- Leverage shadcn/ui components for consistent UI
- Use semantic color tokens: `primary`, `secondary`, `destructive`, `muted-foreground`
- Apply responsive design with `md:`, `lg:` prefixes
- Use transitions for interactive elements: `transition-all`, `hover:`, `focus:`

### API Patterns
- Use the configured `bolsaEmpleoIA` axios instance from `@/core/api/bolsaEmpleoIA`
- Token authentication is handled automatically via interceptors
- Store JWT tokens in localStorage
- Handle 401 responses with user-friendly messages

### Naming Conventions
- Components: PascalCase with descriptive names (`LoginPage`, `DashboardHomePage`)
- Files: kebab-case for folders, PascalCase for components (`auth/services/AuthService.ts`)
- Functions: camelCase with descriptive verbs (`handleSubmit`, `checkAuth`)
- Variables: camelCase, be descriptive (`isLoading`, `errorMessage`)
- Constants: UPPER_SNAKE_CASE for env vars (`VITE_API_URL`)

## ESLint Configuration
The project uses ESLint with:
- TypeScript ESLint rules
- React Hooks plugin
- React Refresh for Vite
- Global ignores for `dist/` folder

## Build Process
- TypeScript compilation runs before Vite build
- Path aliases configured in both Vite and TypeScript
- SWC compiler used for faster React compilation

## Environment Variables
- Use `VITE_` prefix for client-side variables
- Access via `getEnvVariables()` helper from `@/core/helpers/getEnvVariable`
- Example: `VITE_API_URL` for backend API endpoint

## Important Notes
- No test framework configured - consider adding Vitest
- Project uses React 19 with latest features
- Authentication uses JWT stored in localStorage
- All API calls automatically include Bearer token via interceptors
- shadcn/ui components are built on Radix UI primitives