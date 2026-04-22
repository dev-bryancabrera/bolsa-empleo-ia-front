# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server
npm run build      # TypeScript check + production build
npm run lint       # ESLint validation
npm run preview    # Preview production build
```

No test runner is configured.

## Architecture

**Stack:** React 19, TypeScript, Vite (SWC), Zustand, React Router v7, Axios, Tailwind CSS v4, shadcn/ui (Radix UI + new-york style)

**Backend API:** Configured via `VITE_API_URL` in `.env` (default: `http://localhost:5132/api`). All HTTP calls go through `src/core/api/bolsaEmpleoIA.ts` — an Axios instance with a request interceptor that automatically injects `Authorization: Bearer {token}` from localStorage.

**Module structure:** Features live under `src/modules/{feature}/` with consistent subdirectories: `pages/`, `components/`, `services/`, `types/`, and sometimes `layout/`.

```
src/
  core/api/          # Axios instance with JWT interceptor
  core/components/ui/ # shadcn/ui components
  modules/auth/      # Login, register, Google OAuth, password recovery
  modules/chat/      # AI chat interface
  modules/cv/        # CV builder
  modules/users/     # User profile and admin CRUD
  modules/dashboard/ # Main layout, home, navigation
  routes/AppRouter.tsx
```

**Routing:** `AppRouter.tsx` uses React Router v7. Public routes are under `/auth/*`. Protected routes are under `/dashboard/*` and wrapped with `PrivateRoute`. The `DashboardLayout` is lazy-loaded. Any unmatched path redirects to `/auth/login`.

**Auth state:** Managed by a Zustand store with `persist` middleware in `src/modules/auth/services/AuthService.ts`. Token and user data are stored in localStorage. `checkAuth()` calls `GET /auth/verificar-token` on load.

**Dashboard layout:** `DashBoardLayout.tsx` renders a sidebar + header. The `/dashboard/chat` route gets special treatment — it bypasses normal padding and renders full-width. Menu items are filtered by user role.

**Services pattern:** Service files export plain object literals grouping related API calls. Each method returns `response.data` directly. Error handling is done at the call site.

## Conventions

**Import order:**
1. React and React Router
2. Third-party libraries
3. Internal imports (`@/` alias — maps to `src/`)
4. Type imports

**TypeScript:** Use `interface` for object shapes, `type` for unions. Strict mode is enabled (`noUnusedLocals`, `noUnusedParameters`).

**Styling:** Tailwind classes only. Use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) to merge conditional classes. Use semantic tokens (`primary`, `muted-foreground`, `destructive`) over raw colors.

**Naming:**
- Components/pages: PascalCase
- Functions/variables: camelCase verbs (`handleSubmit`, `isLoading`)
- Constants / env vars: UPPER_SNAKE_CASE

**Profile images** arrive from the backend as buffer arrays and must be converted to base64 before rendering (see `DashBoardLayout.tsx` for the pattern).
