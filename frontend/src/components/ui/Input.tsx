"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./cn";

type Size = "sm" | "md" | "lg";

type Native = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">;

type InputProps = Native & {
  size?: Size; 
  error?: string | boolean;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  animated?: boolean;
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
      label,
      animated = true,
      ...rest
    } = props;
    
    const [focused, setFocused] = React.useState(false);
    const inputId = React.useId();

    const sizes: Record<Size, string> = {
      sm: "h-10 text-sm rounded-lg px-3",
      md: "h-12 text-sm rounded-xl px-4",
      lg: "h-14 text-base rounded-xl px-5",
    };

    // ثبّت النوع بعد إزالة التضارب
    const sz: Size = uiSize;
    const withIcons = Boolean(leftIcon || rightIcon);
    const hasError = Boolean(error);

    const inputEl = (
      <motion.input
        id={inputId}
        ref={ref}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "w-full bg-[var(--bg-1)] border transition-all duration-200 outline-none",
          "placeholder:text-[var(--ink-3)]",
          sizes[sz],
          withIcons && (sz === "sm" ? "pl-10 pr-10" : sz === "lg" ? "pl-12 pr-12" : "pl-11 pr-11"),
          hasError 
            ? "border-[var(--error)] focus:ring-2 focus:ring-[var(--error)]/20" 
            : "border-[var(--line)] focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)] hover:border-[var(--line-strong)]",
          className
        )}
        aria-invalid={hasError || undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        whileFocus={animated ? { scale: 1.01 } : undefined}
        {...rest}
      />
    );

    if (!withIcons && !hint && !error && !label) return inputEl;

    return (
      <div className="w-full space-y-2">
        {label && (
          <motion.label 
            htmlFor={inputId}
            className="label"
            initial={animated ? { opacity: 0, y: -10 } : undefined}
            animate={animated ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative group">
          {leftIcon && (
            <motion.span 
              className={cn(
                "absolute inset-y-0 grid place-items-center text-[var(--ink-3)] transition-colors duration-200",
                sz === "sm" ? "left-3" : sz === "lg" ? "left-4" : "left-3.5"
              )}
              animate={focused ? { color: "var(--brand)", scale: 1.1 } : {}}
              transition={{ duration: 0.2 }}
            >
              {leftIcon}
            </motion.span>
          )}
          {inputEl}
          {rightIcon && (
            <motion.span 
              className={cn(
                "absolute inset-y-0 grid place-items-center text-[var(--ink-3)] transition-colors duration-200",
                sz === "sm" ? "right-3" : sz === "lg" ? "right-4" : "right-3.5"
              )}
              animate={focused ? { color: "var(--brand)", scale: 1.1 } : {}}
              transition={{ duration: 0.2 }}
            >
              {rightIcon}
            </motion.span>
          )}
          
          {/* Focus ring enhancement */}
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-[var(--brand)] pointer-events-none"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={focused ? { opacity: 0.3, scale: 1 } : { opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </div>
        
        <AnimatePresence>
          {(hint || error) && (
            <motion.div
              id={error ? `${inputId}-error` : `${inputId}-hint`}
              className={cn(
                "text-sm flex items-center gap-2",
                hasError ? "text-[var(--error)]" : "text-[var(--ink-2)]"
              )}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {hasError && <span className="text-base">⚠️</span>}
              {!hasError && hint && <span className="text-base">💡</span>}
              <span>{typeof error === "string" ? error : hint}</span>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
