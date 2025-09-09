"use client";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useState } from "react";

type Lang = "en" | "ar";

const T = {
  en: { export: "Export PDF", exporting: "Exporting…" },
  ar: { export: "تصدير PDF", exporting: "جارٍ التصدير…" },
} as const;

export default function ExportPdfButton({
  targetId,
  filename = "mindsync-report.pdf",
  lang = "en",
}: {
  targetId: string;
  filename?: string;
  lang?: Lang;
}) {
  const [busy, setBusy] = useState(false);
  const t = T[lang];

  async function handleExport() {
    const el = document.getElementById(targetId);
    if (!el) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const ratio = canvas.width / canvas.height;
      const imgWidth = pageWidth - 48;
      const imgHeight = imgWidth / ratio;
      pdf.addImage(imgData, "PNG", 24, 24, imgWidth, imgHeight);
      pdf.save(filename);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      className="px-3 py-2 rounded-xl border bg-[var(--bg-1)] hover:bg-[var(--bg-0)]"
    >
      {busy ? t.exporting : t.export}
    </button>
  );
}
