"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useI18n } from "@/components/ui/i18n";

export default function CommandPalette({
  onQuickHabit,
  onProHabit,
  onQuickLog,
  onProEntry,
}: any) {
  const { t, lang } = useI18n();
  const F = t.flows;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-[80]" />
        <Dialog.Content className="fixed left-1/2 top-24 z-[90] w-[600px] -translate-x-1/2 rounded-2xl bg-white p-2 shadow-2xl">
          <Command label="Command Menu">
            <Command.Input autoFocus placeholder={F.search} />
            <Command.List>
              <Command.Empty>
                {lang === "ar" ? "لا نتائج." : "No results."}
              </Command.Empty>
              <Command.Group heading={lang === "ar" ? "إضافة" : "Add"}>
                <Command.Item
                  onSelect={() => {
                    onQuickHabit();
                    setOpen(false);
                  }}
                >
                  {F.fabAddHabit}
                </Command.Item>
                <Command.Item
                  onSelect={() => {
                    onProHabit();
                    setOpen(false);
                  }}
                >
                  {F.fabAddHabitPro}
                </Command.Item>
                <Command.Item
                  onSelect={() => {
                    onQuickLog();
                    setOpen(false);
                  }}
                >
                  {F.fabQuickLog}
                </Command.Item>
                <Command.Item
                  onSelect={() => {
                    onProEntry();
                    setOpen(false);
                  }}
                >
                  {F.fabFullEntry}
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
