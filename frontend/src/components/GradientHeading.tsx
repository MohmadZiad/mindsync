"use client";
import * as React from "react";

export default function GradientHeading({
  children,
  as: Tag = "h2",
  className = "",
}: { children: React.ReactNode; as?: any; className?: string }) {
  return (
    <Tag
      className={
        "bg-gradient-to-r from-[#6D5EF1] to-[#F15ECC] bg-clip-text text-transparent font-semibold " +
        className
      }
    >
      {children}
    </Tag>
  );
}
