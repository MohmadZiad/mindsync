"use client";
import * as React from "react";
import { cn } from "./cn";

type Variant = "pulse" | "shine";

export function Skeleton({
  className,
  variant = "pulse",
  rounded = "rounded-xl",
}: {
  className?: string;
  variant?: Variant;
  rounded?: string;
}) {
  const anim =
    variant === "shine"
      ? "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"
      : "animate-pulse";
  return (
    <div
      className={cn(
        "bg-[var(--bg-2)]",
        "border border-base",
        rounded,
        anim,
        className
      )}
    />
  );
}
