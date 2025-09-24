"use client";
import * as Dialog from "@radix-ui/react-dialog";
import React, { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

function cn(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export type SideSheetProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  subtitle?: string;
  titleIcon?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  side?: "right" | "left" | "bottom";
  size?: "sm" | "md" | "lg" | "xl";
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  disableOutsideClose?: boolean;
  disableEscClose?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  className?: string;
  contentClassName?: string;
  zIndex?: number;
  autoCloseOnRouteChange?: boolean;
  onCloseAttempt?: (reason: "overlay" | "esc" | "button") => void;
};

export function SideSheet(props: SideSheetProps) {
  const {
    open,
    onOpenChange,
    title,
    subtitle,
    titleIcon,
    footer,
    children,
    side = "right",
    size = "md",
    stickyHeader = true,
    stickyFooter = true,
    disableOutsideClose = false,
    disableEscClose = false,
    initialFocusRef,
    contentClassName,
    zIndex = 70,
    autoCloseOnRouteChange = false,
    onCloseAttempt,
  } = props;

  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!autoCloseOnRouteChange) return;
    if (lastPath.current === null) {
      lastPath.current = pathname;
      return;
    }
    if (pathname !== lastPath.current && open) onOpenChange(false);
    lastPath.current = pathname;
  }, [pathname, autoCloseOnRouteChange, open, onOpenChange]);

  const sizeClass = useMemo(() => {
    const rightLeft = {
      sm: "w-[min(100vw,420px)]",
      md: "w-[min(100vw,560px)]",
      lg: "w-[min(100vw,720px)]",
      xl: "w-[min(100vw,880px)]",
    } as const;
    const bottom = {
      sm: "h-[min(80vh,320px)]",
      md: "h-[min(85vh,440px)]",
      lg: "h-[min(90vh,560px)]",
      xl: "h-[min(92vh,680px)]",
    } as const;
    return side === "bottom" ? bottom[size] : rightLeft[size];
  }, [side, size]);

  const sidePos = useMemo(() => {
    if (side === "left") return "left-0 top-0 h-full";
    if (side === "bottom") return "left-1/2 -translate-x-1/2 bottom-0";
    return "right-0 top-0 h-full";
  }, [side]);

  const slideAnim = useMemo(() => {
    if (side === "left")
      return "data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left";
    if (side === "bottom")
      return "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom";
    return "data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right";
  }, [side]);

  const handleAutoFocus = (e: Event) => {
    if (initialFocusRef?.current) {
      e.preventDefault();
      initialFocusRef.current.focus();
    }
  };

  const onEscDown = (e: KeyboardEvent) => {
    if (disableEscClose) {
      e.preventDefault();
      return;
    }
    onCloseAttempt?.("esc");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay (بدون onPointerDownOutside) */}
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 bg-black/40 backdrop-blur-[1px]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          )}
          style={{ zIndex }}
        />

        {/* Content */}
        <Dialog.Content
          onOpenAutoFocus={handleAutoFocus as any}
          onEscapeKeyDown={onEscDown as any}
          onPointerDownOutside={(e) => {
            // هذا مكان الحدث الصحيح
            if (disableOutsideClose) {
              e.preventDefault();
              return;
            }
            onCloseAttempt?.("overlay");
          }}
          className={cn(
            "fixed",
            sidePos,
            sizeClass,
            "bg-[var(--bg-1)] text-[var(--ink-1)] border border-[var(--line)] shadow-xl",
            "rounded-none md:rounded-l-2xl",
            "flex flex-col",
            "outline-none",
            slideAnim,
            "duration-300 ease-out",
            "motion-reduce:transition-none motion-reduce:animate-none",
            contentClassName
          )}
          style={{ zIndex: zIndex + 1 }}
        >
          {(title || props.titleIcon || subtitle) && (
            <div
              className={cn(
                "px-4 pt-4 pb-3 md:pt-5 md:pb-4",
                stickyHeader && "sticky top-0 z-[1] bg-[var(--bg-1)]",
                stickyHeader && "border-b border-[var(--line)]"
              )}
            >
              <div className="flex items-start gap-3">
                {titleIcon && (
                  <div className="mt-0.5 text-xl leading-none select-none">
                    {titleIcon}
                  </div>
                )}
                <div className="min-w-0">
                  {title && (
                    <Dialog.Title className="text-base md:text-lg font-semibold truncate">
                      {title}
                    </Dialog.Title>
                  )}
                  {subtitle && (
                    <Dialog.Description className="mt-0.5 text-sm text-[var(--ink-2)] line-clamp-2">
                      {subtitle}
                    </Dialog.Description>
                  )}
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="ml-auto rounded-lg p-2 hover:bg-[var(--bg-2)] focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    aria-label="Close"
                    onClick={() => props.onCloseAttempt?.("button")}
                    title="Close"
                  >
                    <span aria-hidden>✕</span>
                    <span className="sr-only">Close</span>
                  </button>
                </Dialog.Close>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-3 md:px-4">
            {children}
          </div>

          {footer && (
            <div
              className={cn(
                "px-4 py-3 md:px-4 md:py-4",
                stickyFooter && "sticky bottom-0 bg-[var(--bg-1)]",
                stickyFooter && "border-t border-[var(--line)]"
              )}
            >
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
