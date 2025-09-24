# Migration Map

## Refactor Overview
This document tracks the structural reorganization of the MindSync codebase for improved maintainability and feature locality.

## Directory Structure Changes

### Before
```
frontend/src/
  components/          # Mixed UI and feature components
  redux/              # State management
  services/           # API clients
  app/                # Next.js routes
```

### After
```
frontend/src/
  features/           # Feature-specific components
    auth/
    habits/
    entries/
    reports/
  ui/                 # Pure presentational components
  lib/                # Shared utilities/config
  hooks/              # Shared hooks
  redux/              # State management (unchanged)
  services/           # API clients (unchanged)
  app/                # Next.js routes (unchanged)
```

## File Moves

### Batch 1: Pure UI Components
- `components/ui/AnimatedCard.tsx` → `ui/AnimatedCard.tsx`
- `components/ui/AnimatedStatCard.tsx` → `ui/AnimatedStatCard.tsx`
- `components/ui/BackgroundPicker.tsx` → `ui/BackgroundPicker.tsx`
- `components/ui/Button.tsx` → `ui/Button.tsx`
- `components/ui/Card.tsx` → `ui/Card.tsx`
- `components/ui/cn.ts` → `ui/cn.ts`
- `components/ui/i18n.tsx` → `ui/i18n.tsx`
- `components/ui/Input.tsx` → `ui/Input.tsx`
- `components/ui/PrettyModal.tsx` → `ui/PrettyModal.tsx`
- `components/ui/ProgressBarToday.tsx` → `ui/ProgressBarToday.tsx`
- `components/ui/Skeleton.tsx` → `ui/Skeleton.tsx`
- `components/ui/SmartSearchBar.tsx` → `ui/SmartSearchBar.tsx`
- `components/ui/ThemeToggle.tsx` → `ui/ThemeToggle.tsx`
- `components/ui/Toaster.tsx` → `ui/Toaster.tsx`

### Future Batches (Planned)
### Batch 2: Feature Components & Utilities
- `components/flows/` → `features/habits/flows/` (habit-related flows)
- `components/flows/EntrySheet.tsx` → `features/entries/flows/EntrySheet.tsx`
- `components/flows/QuickLogPopover.tsx` → `features/entries/flows/QuickLogPopover.tsx`
- `components/flows/EntryTemplates.tsx` → `features/entries/flows/EntryTemplates.tsx`
- `components/HabitFormExtra.tsx` → `features/habits/components/HabitFormExtra.tsx`
- `components/StreakMeCard.tsx` → `features/habits/components/StreakMeCard.tsx`
- `components/AiReflectionControls.tsx` → `features/entries/components/AiReflectionControls.tsx`
- `components/NoteModal.tsx` → `features/entries/components/NoteModal.tsx`
- `components/WeeklyGrouped.tsx` → `features/entries/components/WeeklyGrouped.tsx`
- `components/MonthlySummary.tsx` → `features/entries/components/MonthlySummary.tsx`
- `components/reports/` → `features/reports/components/`
- `components/hooks/` → `hooks/`
- `utils/` → `lib/`

### Future Batches (Planned)
- Batch 3: Remaining components and cleanup
- Batch 4: Documentation and final polish

## Rationale
- **UI components**: Pure presentational components with no business logic
- **Feature components**: Components tied to specific domain logic
- **Shared utilities**: Cross-cutting concerns and helpers

## Import Impact
All components moved will require import path updates in consuming files.