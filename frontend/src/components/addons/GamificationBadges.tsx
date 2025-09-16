export default function GamificationBadges({ badges }: { badges: string[] }) {
    if (!badges.length) return null;
    return (
      <div className="flex gap-2 flex-wrap">
        {badges.map((b, i) => (
          <span key={i} className="chip" data-tip={b}>
            {b === "streak" && "🔥 Streak Master"}
            {b === "focused" && "🎯 Focused"}
            {b === "consistency" && "🌱 Consistency"}
          </span>
        ))}
      </div>
    );
  }
  