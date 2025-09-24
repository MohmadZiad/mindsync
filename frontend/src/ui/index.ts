/**
 * UI Components Barrel Export
 * 
 * Pure presentational components with no business logic.
 * Safe to import across all features.
 */

// Core UI primitives
export { Button } from "./Button";
export { Input } from "./Input";
export { Card } from "./Card";
export { Skeleton } from "./Skeleton";

// Layout & Structure
export { default as PageTransition } from "./layout/PageTransition";

// Visual Effects
export { default as SpotlightBG } from "./effects/SpotlightBG";
export { default as BreathingRing } from "./BreathingRing";

// Interactive Components
export { default as FAQ } from "./FAQ";
export { default as PricingToggle } from "./PricingToggle";
export { default as TestimonialMarquee } from "./TestimonialMarquee";

// Utilities
export { useToast } from "./Toaster";
export { useI18n } from "./i18n";
export { cn } from "./cn";