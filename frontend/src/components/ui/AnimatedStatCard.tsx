"use client";
import { motion } from "framer-motion";

export default function AnimatedStatCard({
  title,
  value,
  sub,
  icon,
  lang = "en",
}: {
  title: string;
  value: number | string;
  sub?: string;
  icon?: React.ReactNode;
  lang?: "en" | "ar";
}) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  return (
    <motion.div
      dir={dir}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 160, damping: 18, mass: 0.6 }}
      className="flex items-center gap-4 border border-[var(--line)] rounded-2xl p-4 bg-[var(--bg-1)] shadow-soft"
    >
      <div className="text-2xl">{icon ?? "📈"}</div>
      <div>
        <div className="text-xs uppercase tracking-wider opacity-70">
          {title}
        </div>
        <div className="text-3xl font-extrabold leading-none">{value}</div>
        {sub ? <div className="text-sm opacity-80 mt-0.5">{sub}</div> : null}
      </div>
    </motion.div>
  );
}
