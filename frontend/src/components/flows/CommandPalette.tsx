"use client";

import * as Dialog from "@radix-ui/react-dialog";
import React, { useEffect } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Zap, Settings } from "lucide-react";

import { useI18n } from "@/components/ui/i18n";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickHabit: () => void;
  onProHabit: () => void;
  onQuickLog: () => void;
  onProEntry: () => void;
}

export default function CommandPalette({
  open,
  onOpenChange,
  onQuickHabit,
  onProHabit,
  onQuickLog,
  onProEntry,
}: CommandPaletteProps) {
  const { t, lang } = useI18n();
  const F = t.flows;

  // Ctrl/Cmd + K to open
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

  const commands = [
    {
      id: "quick-habit",
      label: F.fabAddHabit,
      icon: <Plus size={16} />,
      action: () => {
        onQuickHabit();
        onOpenChange(false);
      },
      shortcut: "⌘H",
    },
    {
      id: "pro-habit", 
      label: F.fabAddHabitPro,
      icon: <Settings size={16} />,
      action: () => {
        onProHabit();
        onOpenChange(false);
      },
      shortcut: "⌘⇧H",
    },
    {
      id: "quick-log",
      label: F.fabQuickLog,
      icon: <Zap size={16} />,
      action: () => {
        onQuickLog();
        onOpenChange(false);
      },
      shortcut: "⌘L",
    },
    {
      id: "full-entry",
      label: F.fabFullEntry,
      icon: <Search size={16} />,
      action: () => {
        onProEntry();
        onOpenChange(false);
      },
      shortcut: "⌘⇧L",
    },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
<<<<<<< HEAD
                  className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[80]"
=======
                  className="fixed inset-0 z-[80] bg-black/30"
>>>>>>> ceff6d8 (E)
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </Dialog.Overlay>

              <Dialog.Content asChild>
                <motion.div
                  className="fixed left-1/2 top-24 z-[90] w-[min(92vw,680px)] -translate-x-1/2 rounded-2xl bg-[var(--bg-0)] border border-[var(--line)] shadow-2xl overflow-hidden"
                  initial={{ opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Command label="Command Menu" className="w-full">
                    <div className="flex items-center border-b border-[var(--line)] px-3">
                      <Search size={16} className="text-gray-400 mr-2" />
                      <Command.Input 
                        autoFocus 
                        placeholder={F.search}
                        className="flex-1 bg-transparent border-0 outline-none py-4 text-sm placeholder:text-gray-400"
                      />
                    </div>
                    <Command.List className="max-h-[60vh] overflow-auto p-2">
                      <Command.Empty className="py-6 text-center text-sm text-gray-500">
                        {lang === "ar" ? "لا نتائج." : "No results."}
                      </Command.Empty>
<<<<<<< HEAD
                      
                      <Command.Group 
                        heading={lang === "ar" ? "إجراءات سريعة" : "Quick Actions"}
                        className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500"
                      >
                        {commands.map((cmd) => (
                          <Command.Item
                            key={cmd.id}
                            onSelect={cmd.action}
                            className="flex items-center justify-between px-2 py-2 text-sm rounded-lg cursor-pointer hover:bg-[var(--bg-1)] data-[selected]:bg-[var(--bg-2)] transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">{cmd.icon}</span>
                              <span>{cmd.label}</span>
                            </div>
                            <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 border rounded">
                              {cmd.shortcut}
                            </kbd>
                          </Command.Item>
                        ))}
=======

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
>>>>>>> ceff6d8 (E)
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