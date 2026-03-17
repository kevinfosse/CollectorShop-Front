# CollectorShop - AI Coding Instructions

## Project Overview

CollectorShop is an Angular 21 e-commerce application for collectibles. Built with standalone components (no NgModules), Vitest for testing, and SCSS styling.

## Architecture

### Folder Structure

```
src/app/
├── core/           # Singleton services, guards, interceptors, models
├── shared/         # Reusable components, directives, pipes, UI primitives
├── features/       # Lazy-loaded feature modules (home, catalog, cart, checkout, auth, user, admin)
├── state/          # Centralized state management (cart, auth, catalog)
```

### Key Patterns

- **Standalone Components**: All components use `imports: []` directly, no `.module.ts` files
- **Signal-based State**: Use Angular signals (`signal()`, `computed()`) for reactive state (see `app.ts`)
- **Feature Routes**: Each feature has its own `*.routes.ts` file for lazy loading
- **Component Prefix**: Use `app-` prefix for selectors (`selector: 'app-root'`)

## Code Conventions

### Component Structure

```typescript
// Use standalone components with inline imports
@Component({
  selector: 'app-component-name',
  imports: [RouterOutlet, CommonModule], // Import dependencies directly
  templateUrl: './component.html', // Separate template files
  styleUrl: './component.scss', // SCSS styling (singular styleUrl)
})
export class ComponentName {
  protected readonly mySignal = signal('value'); // Use signals for state
}
```

### File Naming

- Components: `feature-name.component.ts` or just `feature-name.ts` (root uses `app.ts`)
- Templates: `*.html` (not `.component.html` at root level)
- Services: `*.service.ts` in `core/services/` (centralized, single location for all services)
- Guards: `*.guard.ts` in `core/guards/`
- Interceptors: `*.interceptor.ts` in `core/interceptors/`

### Testing

- Framework: **Vitest** (not Jasmine/Karma)
- Test files: `*.spec.ts` colocated with source
- Run tests: `npm test` or `ng test`

### Styling

- Use **SCSS** for all styles
- Prettier config: 100 char width, single quotes, Angular HTML parser
- Component styles use `styleUrl` (singular) property

## Commands

| Command                                                               | Description                           |
| --------------------------------------------------------------------- | ------------------------------------- |
| `npm start`                                                           | Dev server at `http://localhost:4200` |
| `npm test`                                                            | Run Vitest unit tests                 |
| `npm run build`                                                       | Production build to `dist/`           |
| `ng generate component features/feature-name/components/my-component` | Generate new component                |

## Dependencies

- **@angular/cdk**: UI component primitives (use for overlays, accessibility, drag-drop)
- **rxjs**: Async operations and HTTP responses
- TypeScript strict mode enabled with all Angular strict options

## Feature Development Checklist

1. Create component in appropriate `features/*/components/` folder
2. Add route in feature's `*.routes.ts`
3. Register lazy route in `app.routes.ts`
4. Shared components go in `shared/components/` or `shared/ui/`
5. Business logic services in `core/services/` or feature-specific `services/`
