"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "danger" | "success" | "ghost" | "outline" | "gradient";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  animated?: boolean;
  pulse?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  animated = true,
  pulse = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30 disabled:opacity-60 disabled:cursor-not-allowed";
  
  const variants: Record<Variant, string> = {
    primary: "bg-[var(--brand)] text-white shadow-md hover:bg-[var(--brand-600)] hover:shadow-lg hover:-translate-y-0.5",
    secondary: "border border-[var(--line)] bg-[var(--bg-1)] text-[var(--ink-1)] hover:bg-[var(--bg-2)] hover:border-[var(--line-strong)] hover:-translate-y-0.5",
    ghost: "text-[var(--ink-1)] hover:bg-[var(--bg-2)]",
    outline: "border border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white",
    danger: "bg-[var(--error)] text-white shadow-md hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5",
    success: "bg-[var(--success)] text-white shadow-md hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5",
    gradient: "bg-gradient-to-r from-[var(--brand)] to-[var(--brand-accent)] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
  };
  
  const sizes: Record<Size, string> = {
    sm: "px-4 py-2 text-sm rounded-lg min-h-[36px]",
    md: "px-6 py-3 text-sm rounded-xl min-h-[44px]",
    lg: "px-8 py-4 text-base rounded-xl min-h-[52px]",
  };

  const ButtonComponent = animated ? motion.button : "button";
  const motionProps = animated ? {
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 25 }
  } : {};

  return (
    <ButtonComponent
      {...motionProps}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        pulse && "animate-pulse",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      <span className="relative inline-flex items-center gap-2">
        {loading && (
          <motion.span
            aria-hidden
            className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {!loading && leftIcon ? (
          <motion.span 
            className="inline-flex"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {leftIcon}
          </motion.span>
        ) : null}
        <span className="truncate">{children}</span>
        {rightIcon ? (
          <motion.span 
            className="inline-flex"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {rightIcon}
          </motion.span>
        ) : null}
      </span>
    </ButtonComponent>
  );
}
