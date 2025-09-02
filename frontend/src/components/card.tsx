"use client";
import * as React from "react";
import { cn } from "./ui/cn";

type Variant = "glass" | "solid" | "soft";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  title?: React.ReactNode;
  right?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: Variant;
}

export function Card({
  title,
  children,
  right,
  footer,
  variant = "glass",
  className,
  ...props
}: CardProps) {
  // اختر الكلاس حسب الـ variant
  const variantClass =
    variant === "glass"
      ? "glass rounded-2xl"
      : variant === "soft"
      ? "cardish-2"
      : "cardish"; // solid

  return (
    <section
      className={cn("w-full p-4 theme-smooth", variantClass, className)}
      {...props}
    >
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between">
          {title ? (
            typeof title === "string" ? (
              <h3 className="text-base font-semibold">{title}</h3>
            ) : (
              title
            )
          ) : (
            <span />
          )}
          {right ?? null}
        </div>
      )}

      <div>{children}</div>

      {footer ? (
        <div className="mt-3 pt-3 border-t border-base">{footer}</div>
      ) : null}
    </section>
  );
}
