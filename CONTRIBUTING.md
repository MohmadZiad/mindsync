# Contributing to MindSync

## Project Structure

This project follows a **feature-oriented architecture** for better maintainability and developer experience.

### Directory Overview

```
frontend/src/
├── app/                    # Next.js App Router (pages, layouts, API routes)
├── features/               # Feature-specific components and logic
│   ├── auth/              # Authentication components
│   ├── habits/            # Habit management
│   ├── entries/           # Journal entries and reflections
│   ├── reports/           # Analytics and reporting
│   └── dashboard/         # Dashboard-specific components
├── ui/                    # Pure presentational components
│   ├── addons/           # Optional UI enhancements
│   ├── effects/          # Visual effects and animations
│   ├── layout/           # Layout components
│   ├── mood/             # Mood system components
│   └── primitives/       # Base UI primitives
├── lib/                   # Shared utilities and configuration
├── hooks/                 # Shared React hooks
├── redux/                 # State management
└── services/              # API clients
```

### Component Placement Guidelines

#### `/ui/` - Pure UI Components
Place components here when they:
- Have no business logic or API calls
- Are reusable across multiple features
- Focus purely on presentation/interaction
- Examples: `Button`, `Card`, `Modal`, `BreathingRing`

#### `/features/` - Feature Components
Place components here when they:
- Contain business logic or API integration
- Are specific to one domain/feature
- Handle complex user flows
- Examples: `HabitForm`, `EntryEditor`, `ReportGenerator`

#### `/lib/` - Shared Utilities
Place utilities here when they:
- Are pure functions with no React dependencies
- Used across multiple features
- Handle configuration or data transformation
- Examples: date helpers, API configuration, contexts

### Import Conventions

Use the configured path aliases:
```typescript
// ✅ Good
import { Button } from "@/ui/Button";
import { HabitForm } from "@/features/habits/components/HabitForm";
import { dateUtils } from "@/lib/date";

// ❌ Avoid
import { Button } from "../../../ui/Button";
```

### Adding New Components

1. **Determine placement** using the guidelines above
2. **Create the component** in the appropriate directory
3. **Add proper TypeScript types** and JSDoc if complex
4. **Update imports** in consuming files
5. **Test** that everything still works

### File Naming

- **Files**: `kebab-case.tsx` (e.g., `habit-form.tsx`)
- **Components**: `PascalCase` (e.g., `HabitForm`)
- **Hooks**: `use` prefix (e.g., `useHabitForm`)
- **Utilities**: `camelCase` (e.g., `formatDate`)

### Development Workflow

1. **Start the dev server**: `npm run dev` in the frontend directory
2. **Start the backend**: `npm run dev` in the backend directory  
3. **Make changes** following the structure guidelines
4. **Test thoroughly** before committing

### Code Quality

- **TypeScript**: All new code must be properly typed
- **Accessibility**: Follow ARIA guidelines for interactive components
- **Performance**: Use React best practices (memo, useMemo, useCallback when needed)
- **Responsive**: All UI components should work on mobile and desktop

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install` in both `frontend/` and `backend/`
3. Set up environment variables (see `.env.example`)
4. Run database migrations: `npx prisma migrate dev`
5. Start both servers and begin developing!

## Questions?

Check the `REFACTOR_NOTES.md` for detailed architectural decisions, or open an issue for clarification.