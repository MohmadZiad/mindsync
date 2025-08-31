"use client";
import * as Dialog from "@radix-ui/react-dialog";
import React from "react";

export type SideSheetProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export function SideSheet({
  open,
  onOpenChange,
  title,
  footer,
  children,
}: SideSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-[min(100vw,560px)] bg-white dark:bg-gray-950 shadow-2xl border-l p-4 overflow-y-auto">
          {title && <div className="text-lg font-semibold mb-3">{title}</div>}
          {children}
          {footer && <div className="mt-4">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
