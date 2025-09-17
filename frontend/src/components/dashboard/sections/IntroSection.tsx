"use client";
import dynamic from "next/dynamic";
import AnimatedCard from "@/components/ui/AnimatedCard";
import type { Lang } from "@/components/DashboardMain";

const StreakMeCard = dynamic(() => import("@/components/StreakMeCard"));
const AiReflectionControls = dynamic(() => import("@/components/AiReflectionControls"), { ssr: false });

export default function IntroSection({
  lang,
  t,
  best,
  onOpenAi,
}: {
  lang: Lang;
  t: any;
  best: { habit: any; weekPoints: number[]; streak: number } | null;
  onOpenAi: () => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-4 auto-rows-min">
      <div className="col-span-12 lg:col-span-8">
        <AnimatedCard lang={lang} title="MindSync" subtitle={t.introCopy} icon="✨" gradient defaultOpen>
          <div className="mt-2 flex gap-2">
            <button className="btn-primary rounded-2xl" onClick={onOpenAi} title={t.aiGenerate}>
              ✨ {t.aiGenerate}
            </button>
          </div>
        </AnimatedCard>
      </div>
      <div className="col-span-12 lg:col-span-4">
        <div className="h-full"><StreakMeCard /></div>
      </div>
      <div className="col-span-12 xl:col-span-7">
        <AnimatedCard lang={lang} title={lang === "ar" ? "انعكاس ذكي" : "AI Reflection"} icon="🧠" gradient defaultOpen>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-1)] p-3">
            <AiReflectionControls />
          </div>
        </AnimatedCard>
      </div>
      {best?.habit && (
        <div className="col-span-12 xl:col-span-5">
          <AnimatedCard lang={lang} title={lang === "ar" ? "أفضل عادة هذا الأسبوع" : "Best Habit This Week"} icon="🏆" flip>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm">
                <div className="font-semibold">
                  {best.habit.icon ? `${best.habit.icon} ${best.habit.name}` : best.habit.name}
                </div>
                <div className="opacity-70">
                  {lang === "ar" ? `🔥 سلسلة: ${best.streak}` : `🔥 Streak: ${best.streak}`}
                </div>
              </div>
              <div className="flex gap-1 items-end w-40">
                {best.weekPoints.map((v, i) => (
                  <div key={i} className="flex-1 rounded-t bg-indigo-400/20" style={{ height: 6 + v * 10 }} />
                ))}
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
}
