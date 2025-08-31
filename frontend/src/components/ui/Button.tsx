"use client";
import * as React from "react";
import { cn } from "./cn";

type Variant = "primary" | "muted" | "danger" | "success";
export function Button(
  { className, variant="primary", ...props }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?:Variant}
) {
  const styles = {
    primary: "btn btn-primary",
    muted: "btn btn-muted",
    danger: "btn bg-danger text-white hover:opacity-90",
    success: "btn bg-success text-white hover:opacity-90",
  }[variant];
  return <button className={cn(styles, className)} {...props} />;
}
