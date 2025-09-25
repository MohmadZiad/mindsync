"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

function CountUp({ 
  to, 
  duration = 1000 
}: { 
  to: number; 
  duration?: number; 
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    
    let start = 0;
    const increment = to / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [inView, to, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function AnimatedStatCard({
  title,
  value,
  sub,
  icon,
  lang = "en",
  delay = 0,
}: {
  title: string;
  value: number | string;
  sub?: string;
  icon?: React.ReactNode;
  lang?: "en" | "ar";
  delay?: number;
}) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const numericValue = typeof value === "number" ? value : 0;
  
  return (
    <motion.div
      dir={dir}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 20, 
        delay: delay * 0.1 
      }}
      className="group relative overflow-hidden card-elevated p-6 cursor-pointer"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-center gap-4">
        <motion.div 
          className="text-3xl p-3 rounded-2xl bg-[var(--bg-2)] group-hover:bg-[var(--brand)]/10 transition-colors duration-300"
          whileHover={{ rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon ?? "📈"}
        </motion.div>
        
        <div className="flex-1">
          <div className="text-sm font-medium text-[var(--ink-2)] mb-1 uppercase tracking-wide">
            {title}
          </div>
          <div className="text-3xl font-bold text-[var(--ink-1)] leading-none">
            {typeof value === "number" ? <CountUp to={numericValue} /> : value}
          </div>
          {sub && (
            <div className="text-sm text-[var(--ink-3)] mt-1 flex items-center gap-1">
              <span>{sub}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
    </motion.div>
  );
}
          {title}
        </div>
        <div className="text-3xl font-extrabold leading-none">{value}</div>
        {sub ? <div className="text-sm opacity-80 mt-0.5">{sub}</div> : null}
      </div>
    </motion.div>
  );
}
