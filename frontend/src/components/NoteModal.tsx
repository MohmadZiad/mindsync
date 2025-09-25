"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Dropzone from "react-dropzone";
import dynamic from "next/dynamic";
import React, { useRef, useState } from "react";

// Signature canvas: متصفح فقط
const SignatureCanvas = dynamic(() => import("react-signature-canvas"), {
  ssr: false,
});
import type SignatureCanvasType from "react-signature-canvas";

// قصّ الكانفس يدويًا بدل getTrimmedCanvas (اللي عامل مشكلة interop)
import tc from "trim-canvas"; 
const trim = (tc as any)?.default ?? (tc as any);

export type NotePayload = {
  text: string;
  imageDataUrl?: string | null;
  drawingDataUrl?: string | null;
};

type Lang = "en" | "ar";

const T = {
  en: {
    title: "Notes Space",
    write: "Write freely…",
    image: "Image",
    upload: "Upload",
    dragHere: "Drag & drop an image here, or click to upload",
    none: "No image yet.",
    draw: "Draw",
    clear: "Clear",
    download: "Download",
    audio: "Voice Recording",
    soon: "Coming soon",
    willAdd: "We’ll add voice recording later without breaking the API.",
    cancel: "Cancel",
    save: "Save",
    chars: (n: number) => `${n} chars`,
  },
  ar: {
    title: "مساحة الملاحظات",
    write: "اكتب بحرّية…",
    image: "صورة",
    upload: "رفع",
    dragHere: "اسحب وأسقط صورة هنا أو اضغط للرفع",
    none: "ما في صورة مرفوعة بعد.",
    draw: "رسم",
    clear: "مسح",
    download: "تنزيل",
    audio: "تسجيل صوتي",
    soon: "قريبًا",
    willAdd: "سنضيف التسجيل الصوتي لاحقًا بدون كسر الـ API.",
    cancel: "إلغاء",
    save: "حفظ",
    chars: (n: number) => `${n} حرف`,
  },
} as const;

export default function NoteModal({
  lang,
  defaultText,
  defaultImage,
  defaultDrawing,
  onSave,
  onCancel,
}: {
  lang?: Lang;
  defaultText?: string;
  defaultImage?: string | null;
  defaultDrawing?: string | null;
  onSave: (v: NotePayload) => void;
  onCancel: () => void;
}) {
  const resolvedLang: Lang =
    lang ||
    (typeof document !== "undefined" &&
    (document.documentElement.lang === "ar" ||
      document.documentElement.dir === "rtl")
      ? "ar"
      : "en");

  const t = T[resolvedLang];

  const [text, setText] = useState(defaultText || "");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(
    defaultImage || null
  );

  const sigRef = useRef<SignatureCanvasType | null>(null);

  function handleDrop(files: File[]) {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    const hasDrawing = !!sigRef.current && !sigRef.current.isEmpty();
    const canvas = hasDrawing ? sigRef.current!.getCanvas() : null;

    const drawing = canvas
      ? (trim(canvas) as HTMLCanvasElement).toDataURL("image/png")
      : defaultDrawing || null;

    onSave({
      text,
      imageDataUrl: imageDataUrl || null,
      drawingDataUrl: drawing || null,
    });
  }

  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content
          dir={resolvedLang === "ar" ? "rtl" : "ltr"}
          aria-describedby="note-desc"
          className="fixed top-1/2 left-1/2 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-gray-950 p-0 shadow-2xl focus:outline-none"
        >
          <Dialog.Description id="note-desc" className="sr-only">
            Write notes, upload an image, or draw, then save.
          </Dialog.Description>

          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-white/90 dark:bg-gray-950/90 px-4 py-3 backdrop-blur">
            <Dialog.Title className="text-base md:text-lg font-semibold">
              {t.title}
            </Dialog.Title>
            <div className="flex items-center gap-2 text-sm">
              <span className="opacity-70">{t.chars(text.length)}</span>
              <button
                onClick={onCancel}
                className="px-3 py-1.5 rounded-xl border hover:bg-[var(--bg-1)]"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {t.save}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            {/* Text */}
            <textarea
              className="w-full min-h-[140px] rounded-xl border p-3 bg-[var(--bg-1)] leading-7 focus:ring-2 focus:ring-indigo-300 outline-none"
              placeholder={t.write}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {/* Image */}
            <div className="border rounded-2xl p-3 bg-[var(--bg-1)]">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">
                  {t.image} <span className="align-middle">🖼️</span>
                </div>
                <span className="text-xs opacity-70">
                  {imageDataUrl ? "" : t.dragHere}
                </span>
              </div>
              <Dropzone
                accept={{ "image/*": [] }}
                multiple={false}
                onDrop={handleDrop}
              >
                {({ getRootProps, getInputProps, isDragActive }) => (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                      isDragActive
                        ? "border-indigo-400"
                        : "border-[var(--line)]"
                    }`}
                  >
                    <input {...getInputProps()} />
                    {imageDataUrl ? (
                      <div className="space-y-2">
                        <img
                          src={imageDataUrl}
                          alt="upload"
                          className="max-h-48 mx-auto rounded border"
                        />
                        <div className="flex justify-center gap-2">
                          <button
                            className="text-sm px-2 py-1 border rounded"
                            onClick={() => setImageDataUrl(null)}
                          >
                            ✕
                          </button>
                          <a
                            className="text-sm px-2 py-1 border rounded"
                            href={imageDataUrl}
                            download="image.png"
                          >
                            {t.download}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="opacity-70">{t.dragHere}</div>
                    )}
                  </div>
                )}
              </Dropzone>
            </div>

            {/* Drawing */}
            <div className="border rounded-2xl p-3 bg-[var(--bg-1)]">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">
                  {t.draw} <span className="align-middle">✏️</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-sm px-2 py-1 border rounded"
                    onClick={() => sigRef.current?.clear()}
                  >
                    {t.clear}
                  </button>
                </div>
              </div>

              <SignatureCanvas
                // @ts-expect-error dynamic typing
                ref={sigRef}
                penColor="indigo"
                canvasProps={{
                  width: 1000,
                  height: 260,
                  className:
                    "w-full h-[220px] border rounded-lg bg-white dark:bg-gray-900",
                }}
              />
            </div>

            {/* Audio (placeholder) */}
            <div className="border rounded-2xl p-3 bg-[var(--bg-1)]">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {t.audio} <span className="align-middle">🎙️</span>
                </div>
                <button
                  className="text-sm px-2 py-1 border rounded opacity-60 cursor-not-allowed"
                  title={t.soon}
                >
                  {t.soon}
                </button>
              </div>
              <p className="mt-1 text-sm opacity-70">{t.willAdd}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[var(--line)] bg-white dark:bg-gray-950 flex items-center justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded-xl border hover:bg-[var(--bg-1)]"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {t.save}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
