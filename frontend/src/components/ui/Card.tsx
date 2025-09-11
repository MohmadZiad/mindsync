"use client";
import * as React from "react";
import { cn } from "./cn";

type Variant = "glass" | "solid" | "soft";
type NativeAttrs = Omit<React.HTMLAttributes<HTMLElement>, "title">;

interface CardProps extends NativeAttrs {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: Variant;
  clickable?: boolean;
  as?: React.ElementType;
  stickyFooter?: boolean;
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
    as,
    stickyFooter = false,
    ...props
  },
  ref
) {
  const variantClass =
    variant === "glass"
      ? "glass rounded-2xl"
      : variant === "soft"
      ? "cardish-2"
      : "cardish";

  // اختر العنصر (افتراض section) ثم استعمله كـ ElementType
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
      {...props}
    >
      {(title || right) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {typeof title === "string" ? (
              <h3 className="text-base font-semibold truncate">{title}</h3>
            ) : (
              title
            )}
            {subtitle ? (
              <p className="mt-0.5 text-sm text-muted line-clamp-2">
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
            "mt-3 pt-3 border-t border-base",
            stickyFooter && "sticky bottom-0 bg-[var(--bg-1)]"
          )}
        >
          {footer}
        </div>
      ) : null}
    </Tag>
  );
});

Card.displayName = "Card";
