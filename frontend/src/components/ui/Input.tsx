"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "./cn";

type Size = "sm" | "md" | "lg";

type Native = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">;

type InputProps = Native & {
  size?: Size; 
  error?: string | boolean;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const {
      className,
      size: uiSize = "md",
      error,
      hint,
      leftIcon,
      rightIcon,
      ...rest
    } = props;

    const sizes: Record<Size, string> = {
      sm: "h-9 text-sm rounded-xl",
      md: "h-10 text-sm rounded-xl",
      lg: "h-11 text-base rounded-2xl",
    };

    const sz: Size = uiSize;
    const withIcons = Boolean(leftIcon || rightIcon);
    const hasError = Boolean(error);

    const inputEl = (
      <motion.input
        ref={ref}
        className={cn(
          "input w-full bg-[var(--bg-0)] border border-base theme-smooth",
          sizes[sz],
          leftIcon && "pl-9",
          rightIcon && "pr-9",
          hasError && "border-[hsl(var(--danger))] focus:ring-0",
          className
        )}
        aria-invalid={hasError || undefined}
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...rest}
      />
    );

    if (!withIcons && !hint && !error) return inputEl;

    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <span className="absolute inset-y-0 left-2 grid place-items-center text-muted">
              {leftIcon}
            </span>
          )}
          {inputEl}
          {rightIcon && (
            <span className="absolute inset-y-0 right-2 grid place-items-center text-muted">
              {rightIcon}
            </span>
          )}
        </div>
        {(hint || error) && (
          <div
            className={cn(
              "mt-1 text-xs",
              hasError ? "text-[hsl(var(--danger))]" : "text-muted"
            )}
          >
            {typeof error === "string" ? error : hint}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";