"use client";
import * as React from "react";
import { cn } from "./ui/cn";

type Variant = "glass" | "solid" | "soft";

/**
 * ملاحظة: عملنا Omit لـ `title` من خصائص HTML الافتراضيّة
 * عشان ما تتعارض مع `title?: React.ReactNode` تبعت الكارد.
 */
interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** عنوان الكارد (string أو أي ReactNode) */
  title?: React.ReactNode;
  /** محتوى يمين الهيدر (أزرار/أكشن) */
  right?: React.ReactNode;
  /** فوتر اختياري */
  footer?: React.ReactNode;
  /** شكل الكارد */
  variant?: Variant;
  /** جعل الكارد قابل للنقر (ستايل هوفر فقط) */
  clickable?: boolean;
  /** اجعل الفوتر ثابت بأسفل الكارد */
  stickyFooter?: boolean;
  /** العنصر الأساسي: section/div/article ...الخ */
  as?: keyof React.JSX.IntrinsicElements;
}

export function Card({
  title,
  children,
  right,
  footer,
  variant = "glass",
  className,
  clickable = false,
  stickyFooter = false,
  as = "section",
  ...props
}: CardProps) {
  const Tag = as as any;

  const variantClass =
    variant === "glass"
      ? "glass rounded-2xl"
      : variant === "soft"
      ? "cardish-2"
      : "cardish"; // solid

  return (
    <Tag
      className={cn(
        "w-full p-4 theme-smooth",
        variantClass,
        clickable && "hover:shadow-xl cursor-pointer",
        className
      )}
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
        <div
          className={cn(
            "mt-3 pt-3 border-t border-base",
            stickyFooter && "sticky bottom-0 bg-inherit"
          )}
        >
          {footer}
        </div>
      ) : null}
    </Tag>
  );
}
