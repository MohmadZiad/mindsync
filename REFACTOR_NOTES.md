# Refactor Notes

## New Directory Structure

### `/features/` - Feature-Oriented Architecture
Each feature has its own directory with:
- `components/` - Feature-specific UI components
- `flows/` - Complex user flows and multi-step processes
- `hooks/` - Feature-specific hooks (future)
- `types/` - Feature-specific types (future)

### `/ui/` - Pure Presentational Components
Reusable UI components with no business logic:
- Form controls (Button, Input, etc.)
- Layout components (Card, Modal, etc.)
- Visual effects (SpotlightBG, BreathingRing, etc.)
- Utility components (FAQ, Counter, etc.)

### `/lib/` - Shared Utilities
Cross-cutting concerns:
- Date utilities
- Reporting helpers
- Configuration
- Contexts

### `/hooks/` - Shared Hooks
Hooks used across multiple features:
- Form schemas
- API hooks (future)
- UI state hooks (future)

## Naming Conventions

### Files
- `kebab-case.ts(x)` for all files
- Components use `PascalCase` for the component name
- Hooks start with `use`

### Directories
- `kebab-case` for all directories
- Feature directories match domain concepts
- UI directories match component categories

## Import Guidelines

### Path Aliases
- `@/features/` - Feature components
- `@/ui/` - Pure UI components  
- `@/lib/` - Shared utilities
- `@/hooks/` - Shared hooks
- `@/redux/` - State management
- `@/services/` - API clients

### Import Order (Recommended)
1. React/Next.js imports
2. Third-party libraries
3. Internal features (`@/features/`)
4. Internal UI (`@/ui/`)
5. Internal utilities (`@/lib/`, `@/hooks/`)
6. Redux/services
7. Relative imports

## Component Placement Rules

### When to put in `/ui/`
- No business logic or API calls
- Reusable across features
- Pure presentation/interaction
- Examples: Button, Card, Modal, animations

### When to put in `/features/`
- Contains business logic
- Feature-specific behavior
- API integration
- Examples: HabitForm, EntryEditor, ReportGenerator

### When to put in `/lib/`
- Pure functions
- Configuration
- Utilities used across features
- No React dependencies (usually)

## Migration Benefits

1. **Clearer boundaries** between UI and business logic
2. **Easier testing** - features can be tested in isolation
3. **Better code reuse** - UI components are clearly reusable
4. **Reduced coupling** - features don't accidentally depend on each other
5. **Onboarding friendly** - new developers can understand the structure quickly

## Future Improvements

1. Add feature-specific hooks directories
2. Add feature-specific types directories  
3. Consider barrel exports for frequently imported features
4. Add Storybook stories for UI components
5. Add unit tests co-located with components