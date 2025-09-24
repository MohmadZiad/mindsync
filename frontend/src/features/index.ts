/**
 * Features Barrel Export
 * 
 * Feature-specific components with business logic.
 * Import only what you need to avoid unnecessary dependencies.
 */

// Auth
export { default as AuthBootstrap } from "./auth/components/AuthBootstrap";

// Dashboard
export { default as ClientDashboard } from "./dashboard/ClientDashboard";

// Habits
export { default as HabitFormExtra } from "./habits/components/HabitFormExtra";
export { default as StreakMeCard } from "./habits/components/StreakMeCard";

// Entries
export { default as AiReflectionControls } from "./entries/components/AiReflectionControls";
export { default as NoteModal } from "./entries/components/NoteModal";
export { default as WeeklyGrouped } from "./entries/components/WeeklyGrouped";
export { default as MonthlySummary } from "./entries/components/MonthlySummary";

// Reports
export { default as EntriesHeatmap } from "./reports/components/EntriesHeatmap";
export { default as ExportPdfButton } from "./reports/components/ExportPdfButton";
export { default as NotesWordCloud } from "./reports/components/NotesWordCloud";
export { default as ProgressLine } from "./reports/components/ProgressLine";