"use client";
import * as Dialog from "@radix-ui/react-dialog";
import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useI18n } from "@/components/ui/i18n";
import { motion, AnimatePresence } from "framer-motion";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickHabit,
  onProHabit,
  onQuickLog,
  onProEntry,
}

export default function CommandPalette({
  open,
  onOpenChange,
  onQuickHabit: () => void;
  onProHabit: () => void;
  onQuickLog: () => void;
  onProEntry: () => void;
}: CommandPaletteProps) {
  const { t, lang } = useI18n();
  const F = t.flows;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 bg-black/30 z-[80]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  className="fixed left-1/2 top-24 z-[90] w-[min(92vw,680px)] -translate-x-1/2 rounded-2xl bg-[var(--bg-0)] p-2 border border-[var(--line)] shadow-2xl"
                  initial={{ opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 8 }}
                >
                  <Command label="Command Menu">
                    <Command.Input autoFocus placeholder={F.search} />
                    <Command.List className="max-h-[60vh] overflow-auto">
                      <Command.Empty>
                        {lang === "ar" ? "لا نتائج." : "No results."}
                      </Command.Empty>
                      <Command.Group heading={lang === "ar" ? "إضافة" : "Add"}>
                        <Command.Item
                          onSelect={() => {
                            onQuickHabit();
                            onOpenChange(false);
                          }}
                        >
                          {F.fabAddHabit}
                        </Command.Item>
                        <Command.Item
                          onSelect={() => {
                            onProHabit();
                            onOpenChange(false);
                          }}
                        >
                          {F.fabAddHabitPro}
                        </Command.Item>
                        <Command.Item
                          onSelect={() => {
                            onQuickLog();
                            onOpenChange(false);
                          }}
                        >
                          {F.fabQuickLog}
                        </Command.Item>
                        <Command.Item
                          onSelect={() => {
                            onProEntry();
                            onOpenChange(false);
                          }}
                        >
                          {F.fabFullEntry}
                        </Command.Item>
                      </Command.Group>
                    </Command.List>
                  </Command>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
