"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "./cn";

type Variant = "primary" | "muted" | "danger" | "success" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  children,
  disabled,
  ...props
}, ref) => {
  const base = "btn theme-smooth touch";
  const variants: Record<Variant, string> = {
    primary: "btn--primary",
    muted: "btn--ghost",
    ghost: "btn--ghost",
    outline: "border border-base bg-[var(--bg-1)]",
    danger: "bg-[hsl(var(--danger))] text-white hover:opacity-90",
    success: "bg-[hsl(var(--success))] text-white hover:opacity-90",
  };
  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-sm rounded-xl",
    md: "px-4 py-2 text-sm rounded-2xl",
    lg: "px-5 py-3 text-base rounded-2xl",
  };

  return (
    <motion.button
      ref={ref}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-60 pointer-events-none",
        className
      )}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      <span className="inline-flex items-center gap-2">
        {loading && (
          <span
            aria-hidden
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"
          />
        )}
        {!loading && leftIcon ? (
          <span className="inline-flex">{leftIcon}</span>
        ) : null}
        <span className="truncate">{children}</span>
        {rightIcon ? <span className="inline-flex">{rightIcon}</span> : null}
      </span>
    </motion.button>
  );
});

Button.displayName = "Button";
