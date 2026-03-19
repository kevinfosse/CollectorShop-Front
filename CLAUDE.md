# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CollectorShop is an Angular 21 e-commerce SPA for collectible items. It communicates with a .NET 9 ASP.NET Core backend API. Both deploy to Azure VM (`maalsikube.dev`) and a school K8s cluster.

## Repositories

- **Frontend** (`CollectorShop/`): This repo — Angular 21 SPA
- **Backend** (`CollectorShop.Back/`): .NET 9 API at `../CollectorShop.Back`

## Commands

```bash
# Dev server (http://localhost:4200)
npm start

# Build for production
npm run build

# Run Vitest unit tests
npm test

# Lint (ESLint + Angular ESLint)
npm run lint

# Generate a component
ng generate component features/<feature>/components/<name>
```

## Architecture

Angular 21 standalone app (no NgModules). All components use `imports: []` directly.

```
src/app/
├── core/        # Singleton services, guards, interceptors, models
├── shared/      # Reusable components (layout, navbar, footer, product-card), pipes, directives
├── features/    # Lazy-loaded feature routes: home, auth, catalog, product-detail, cart, checkout, user, admin
└── state/       # Placeholder for centralized state (currently unused)
```

- **Routing**: Standalone `Routes` arrays per feature (`*.routes.ts`), lazy-loaded via `loadChildren`. Public routes wrapped in `LayoutComponent` (header/footer). Admin routes are separate (no shared layout).
- **Guards**: `authGuard` (authenticated), `adminGuard` (Admin role), `guestGuard` (unauthenticated only).

## Key Patterns

- **Signals for state**: All services use Angular signals (`signal()`, `computed()`, `asReadonly()`) — no NgRx or external state library.
- **Standalone components only**: No `.module.ts` files. Import dependencies directly in `@Component({ imports: [...] })`.
- **Component prefix**: `app-` selector prefix.
- **Styling**: SCSS + Tailwind CSS 4. Use `styleUrl` (singular) in components.
- **i18n**: `@ngx-translate` with translation JSON files in `src/assets/i18n/` (en, fr, de, it).
- **Testing**: Vitest (not Jasmine/Karma). Test files colocated as `*.spec.ts`.

## API Integration

- **Base URL** configured per environment in `src/environments/`:
  - Dev: `http://localhost:5000/api`
  - Prod: `https://api.maalsikube.dev/api`
  - VM: `http://172.16.47.13/api`
- **Auth interceptor**: Adds `Authorization: Bearer <token>` to all requests.
- **Error interceptor**: Global HTTP error handling — extracts ASP.NET `ValidationProblemDetails`, auto-logouts on 401.
- **Token storage**: `localStorage` (accessToken, refreshToken, user JSON).
- **Backend roles**: `Admin`, `Customer`, `Manager`. Admin guard checks `isAdmin()` computed from user roles signal.

## CI/CD

Both GitHub Actions (`.github/workflows/ci-cd.yml`) and GitLab CI (`.gitlab-ci.yml`): lint → build → test → security (npm audit) → SonarCloud → Docker (multi-stage Node + Nginx) → Trivy scan → deploy. Dockerized with Nginx for SPA routing (`nginx.conf`).

## Code Conventions

- File naming: `feature-name.component.ts` (or just `feature-name.ts` for root)
- Services: all in `core/services/`, `providedIn: 'root'`
- Models/interfaces: all in `core/models/`
- Barrel exports: each core subfolder has `index.ts`
- New features: create component in `features/*/components/`, add route in `*.routes.ts`, register lazy route in `app.routes.ts`
- Shared/reusable components go in `shared/components/` or `shared/ui/`
