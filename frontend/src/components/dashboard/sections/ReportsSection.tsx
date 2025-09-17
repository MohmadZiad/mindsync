"use client";
import dynamic from "next/dynamic";
import type { Lang } from "@/components/DashboardMain";

const ProgressLine   = dynamic(() => import("@/components/reports/ProgressLine"),   { ssr: false });
const EntriesHeatmap = dynamic(() => import("@/components/reports/EntriesHeatmap"), { ssr: false });
const NotesWordCloud = dynamic(() => import("@/components/reports/NotesWordCloud"), { ssr: false });
const ExportPdfButton= dynamic(() => import("@/components/reports/ExportPdfButton"),{ ssr: false });
const WeeklyGrouped  = dynamic(() => import("@/components/WeeklyGrouped"),          { ssr: false });
const MonthlySummary = dynamic(() => import("@/components/MonthlySummary"),         { ssr: false });

export default function ReportsSection({
  lang = "en" as Lang,
  t,
  entries,
  compute,
}: {
  lang?: Lang;
  t: any;
  entries: any[];
  compute: { line: any[]; heat: any[]; words: { text: string; value: number }[] };
}) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 180);

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <ExportPdfButton targetId="report-root" />
      </div>
      <div id="report-root" className="grid gap-4">
        <ProgressLine data={compute.line} title={t.reportTitles.line} />
        <EntriesHeatmap values={compute.heat} startDate={start} endDate={end} title={t.reportTitles.heat} />
        <NotesWordCloud words={compute.words} title={t.reportTitles.cloud} />
        <WeeklyGrouped />
        <MonthlySummary />
      </div>
    </div>
  );
}
