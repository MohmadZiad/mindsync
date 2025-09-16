"use client";
import AnimatedCard from "@/components/ui/AnimatedCard";

export default function AIInsightsCard({
  lang="en",
  weeklyAvg=0,
  missedDays=0,
}: {
  lang?: "en"|"ar";
  weeklyAvg?: number;
  missedDays?: number;
}) {
  const dir = lang==="ar"?"rtl":"ltr";
  const lines =
    lang==="ar"
      ? [
          weeklyAvg < 3 ? "جرّب عادة مدتها 5 دقائق لتثبيت الرتم." : "استمر بنفس الوتيرة وارفَع الهدف قليلًا.",
          missedDays > 2 ? "عيّن تذكير مرن في وقت أسهل لك." : "رائع! الاستمرارية ممتازة 👏",
        ]
      : [
          weeklyAvg < 3 ? "Try a 5-minute habit to build momentum." : "Keep pace and raise the bar slightly.",
          missedDays > 2 ? "Set a flexible reminder at an easier time." : "Great consistency 👏",
        ];

  return (
    <AnimatedCard
      lang={lang}
      title={lang==="ar" ? "💡 اقتراحات ذكية" : "💡 Smart suggestions"}
      subtitle={lang==="ar" ? "مبنية على نشاطك الأخير" : "Based on recent activity"}
      icon="🤖"
      defaultOpen
      flip
      gradient
    >
      <div dir={dir} className="space-y-2">
        {lines.map((l, i) => (
          <div key={i} className="menu-card">{l}</div>
        ))}
      </div>
    </AnimatedCard>
  );
}
