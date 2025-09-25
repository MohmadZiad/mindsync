"use client";
import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/components/ui/cn";

type Variant = "glass" | "solid" | "soft" | "elevated" | "gradient";
type NativeAttrs = Omit<React.HTMLAttributes<HTMLElement>, "title">;

export interface CardProps extends NativeAttrs {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: Variant;
  clickable?: boolean;
  stickyFooter?: boolean;
  as?: React.ElementType;
  animated?: boolean;
  delay?: number;
}

export const Card = React.forwardRef<HTMLElement, CardProps>(function Card(
  {
    title,
    subtitle,
    right,
    footer,
    variant = "glass",
    className,
    children,
    clickable = false,
    stickyFooter = false,
    as,
    animated = true,
    delay = 0,
    ...props
  },
  ref
) {
  const headingId = React.useId();
  const subtitleId = React.useId();

  const variantClass =
    variant === "glass"
      ? "glass-enhanced rounded-2xl"
      : variant === "soft"
      ? "card-gradient"
      : variant === "elevated"
      ? "card-elevated"
      : variant === "gradient"
      ? "gradient-border rounded-2xl"
      : "card-interactive";

  const Tag = (as ?? "section") as React.ElementType;
  
  const MotionTag = animated ? motion(Tag) : Tag;
  const motionProps = animated ? {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { 
      duration: 0.4, 
      ease: "easeOut",
      delay: delay * 0.1 
    },
    ...(clickable && {
      whileHover: { 
        y: -4, 
        scale: 1.02,
        transition: { duration: 0.2 }
      },
      whileTap: { scale: 0.98 }
    })
  } : {};

  return (
    <MotionTag
      ref={ref as any}
      {...motionProps}
      className={cn(
        "relative w-full p-6 theme-smooth group",
        variantClass,
        clickable && "cursor-pointer",
        className
      )}
      // A11y: علّم العنوان للي يحتاجه
      aria-labelledby={title ? headingId : undefined}
      aria-describedby={subtitle ? subtitleId : undefined}
      {...props}
    >
      {/* Hover glow effect */}
      {clickable && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--brand)]/10 via-transparent to-[var(--brand-accent)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      {(title || right) && (
        <div className="relative mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title ? (
              typeof title === "string" ? (
                <h3 id={headingId} className="text-lg font-bold text-[var(--ink-1)] truncate">
                  {title}
                </h3>
              ) : (
                // لو ReactNode، حاول تضيف id لو بدّك
                <div id={headingId}>{title}</div>
              )
            ) : null}

            {subtitle ? (
              <p id={subtitleId} className="mt-1 text-sm text-[var(--ink-2)] line-clamp-2 leading-relaxed">
                {subtitle}
              </p>
            ) : null}
          </div>

          {right && (
            <div className="flex-shrink-0">
              {right}
            </div>
          )}
        </div>
      )}

      <div className="relative">{children}</div>

      {footer ? (
        <div
          className={cn(
            "relative mt-6 border-t border-[var(--line)] pt-4",
            stickyFooter && "sticky bottom-0 bg-inherit backdrop-blur-sm"
          )}
        >
          {footer}
        </div>
      ) : null}
    </MotionTag>
  );
});

Card.displayName = "Card";
export default Card;
