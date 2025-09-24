"use client";
import * as React from "react";

import { cn } from "@/ui/cn";

type Variant = "glass" | "solid" | "soft";
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
    ...props
  },
  ref
) {
  const headingId = React.useId();
  const subtitleId = React.useId();

  const variantClass =
    variant === "glass"
      ? "glass rounded-2xl"
      : variant === "soft"
      ? "cardish-2"
      : "cardish";

  const Tag = (as ?? "section") as React.ElementType;

  return (
    <Tag
      ref={ref as any}
      className={cn(
        "w-full p-4 theme-smooth",
        variantClass,
        clickable && "hover:shadow-xl cursor-pointer",
        className
      )}
      // A11y: علّم العنوان للي يحتاجه
      aria-labelledby={title ? headingId : undefined}
      aria-describedby={subtitle ? subtitleId : undefined}
      {...props}
    >
      {(title || right) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title ? (
              typeof title === "string" ? (
                <h3 id={headingId} className="text-base font-semibold truncate">
                  {title}
                </h3>
              ) : (
                // لو ReactNode، حاول تضيف id لو بدّك
                <div id={headingId}>{title}</div>
              )
            ) : null}

            {subtitle ? (
              <p id={subtitleId} className="mt-0.5 text-sm text-muted line-clamp-2">
                {subtitle}
              </p>
            ) : null}
          </div>

          {right ?? null}
        </div>
      )}

      <div>{children}</div>

      {footer ? (
        <div
          className={cn(
            "mt-3 border-t border-base pt-3",
            stickyFooter && "sticky bottom-0 bg-inherit"
          )}
        >
          {footer}
        </div>
      ) : null}
    </Tag>
  );
});

Card.displayName = "Card";
export default Card;
