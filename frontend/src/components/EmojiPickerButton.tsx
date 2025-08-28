"use client";
import React, { useEffect, useRef, useState } from "react";
import { EmojiPicker } from "frimousse";

type Props = {
  value?: string | null;
  onChange: (emoji: string) => void;
};

type OnEmojiSelectPayload = {
  emoji: string; 
  name?: string;
  shortcodes?: string;
};

type Category = {
  id: string;
  label: string;
};

export default function EmojiPickerButton({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        className="px-2 py-1 border rounded text-lg"
        onClick={() => setOpen((v) => !v)}
      >
        {value || "🙂"}
      </button>

      {open && (
        <div className="absolute z-50 mt-2">
          {/* Root بيدير البحث/القائمة */}
          <EmojiPicker.Root
            className="isolate flex h-[340px] w-fit flex-col bg-white dark:bg-neutral-900 rounded-md shadow"
            onEmojiSelect={(payload: OnEmojiSelectPayload) => {
              onChange(payload.emoji);
              setOpen(false);
            }}
          >
            <EmojiPicker.Search className="z-10 mx-2 mt-2 appearance-none rounded-md bg-neutral-100 px-2.5 py-2 text-sm dark:bg-neutral-800" />

            <EmojiPicker.Viewport className="relative flex-1 outline-hidden">
              <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
                Loading…
              </EmojiPicker.Loading>

              <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
                No emoji found.
              </EmojiPicker.Empty>

              <EmojiPicker.List
                className="select-none pb-1.5"
                components={{
                  CategoryHeader: ({
                    category,
                    ...props
                  }: {
                    category: Category;
                  } & React.HTMLAttributes<HTMLDivElement>) => (
                    <div
                      className="bg-white px-3 pt-3 pb-1.5 font-medium text-neutral-600 text-xs dark:bg-neutral-900 dark:text-neutral-400"
                      {...props}
                    >
                      {category.label}
                    </div>
                  ),

                  Row: ({
                    children,
                    ...props
                  }: {
                    children?: React.ReactNode;
                  } & React.HTMLAttributes<HTMLDivElement>) => (
                    <div className="scroll-my-1.5 px-1.5" {...props}>
                      {children}
                    </div>
                  ),

                  Emoji: ({
                    emoji,
                    ...props
                  }: {
                    emoji: { emoji: string };
                  } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
                    <button
                      className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-neutral-100 dark:data-[active]:bg-neutral-800"
                      {...props}
                    >
                      {emoji.emoji}
                    </button>
                  ),
                }}
              />
            </EmojiPicker.Viewport>
          </EmojiPicker.Root>
        </div>
      )}
    </div>
  );
}
