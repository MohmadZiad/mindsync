// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: "ms-theme",
  LANGUAGE: "ms_lang",
  FOCUS_MODE: "ms-focus",
  MOOD: "mindsync:mood",
  BACKGROUND: "__bg",
  ONBOARDED: "__ms.onboarded",
  INTENT: "__ms.intent",
  INTENT_COLLAPSED: "__ms.intent.collapsed",
  INSIGHTS_COLLAPSED: "__ms.insights.collapsed",
  LOGIN_THEME: "login_duo_theme",
  HABIT_DRAFT: "habit_draft",
} as const;

// UI Constants
export const UI_CONSTANTS = {
  HEADER_HEIGHT: 64,
  SIDEBAR_WIDTH: 256,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
} as const;

// Animation Durations (in ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800,
} as const;

// Color Palette
export const COLORS = {
  PRIMARY: "#6D5EF1",
  SECONDARY: "#F15ECC",
  SUCCESS: "#22C55E",
  WARNING: "#F59E0B",
  ERROR: "#EF4444",
  INFO: "#3B82F6",
} as const;

// Mood Colors
export const MOOD_COLORS = {
  CALM: "#6D5EF1",
  FOCUS: "#22C55E",
  ENERGY: "#F59E0B",
  SOFT: "#A78BFA",
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: "MMM d",
  MEDIUM: "MMM d, yyyy",
  LONG: "MMMM d, yyyy",
  TIME: "h:mm a",
  DATETIME: "MMM d, yyyy h:mm a",
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  REFLECTION_MAX_LENGTH: 1000,
  HABIT_NAME_MAX_LENGTH: 100,
} as const;

// Feature Flags
export const FEATURES = {
  AI_REFLECTION: true,
  VOICE_RECORDING: false,
  SOCIAL_LOGIN: true,
  EXPORT_PDF: true,
  DARK_MODE: true,
  RTL_SUPPORT: true,
} as const;