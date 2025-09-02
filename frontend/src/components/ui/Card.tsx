"use client";
import * as React from "react";
import { cn } from "./cn";

type Variant = "glass" | "solid" | "soft";


type NativeAttrs = Omit<React.HTMLAttributes<HTMLElement>, "title">;

interface CardProps extends NativeAttrs {
  /** Heading shown in the card header (can be string or any React node) */
  title?: React.ReactNode;
  /** Right-side header content (actions, buttons, etc.) */
  right?: React.ReactNode;
  /** Footer content rendered with a top border */
  footer?: React.ReactNode;
  /** Visual style of the card */
  variant?: Variant;
}

export const Card = React.forwardRef<HTMLElement, CardProps>(function Card(
  { title, children, right, footer, variant = "glass", className, ...props },
  ref
) {
  const variantClass =
    variant === "glass"
      ? "glass rounded-2xl"
      : variant === "soft"
      ? "cardish-2"
      : "cardish"; // solid

  return (
    <section
      ref={ref}
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
});

Card.displayName = "Card";
