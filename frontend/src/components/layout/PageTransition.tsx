"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren } from "react";

/** انتقال ناعم بين الصفحات مع App Router */
export default function PageTransition({ children }: PropsWithChildren) {
  const key = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={key}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
