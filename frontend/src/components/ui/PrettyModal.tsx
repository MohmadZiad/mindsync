"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

export default function PrettyModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  dir = "ltr",
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  dir?: "ltr" | "rtl";
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl", 
    lg: "max-w-4xl",
    xl: "max-w-6xl"
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <div
            dir={dir}
            className="absolute inset-0 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className={`relative w-full ${sizeClasses[size]} rounded-3xl border border-[var(--line)]/50 bg-[var(--bg-1)]/95 backdrop-blur-xl shadow-2xl overflow-hidden`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.4 
              }}
            >
              {/* Ambient glow effects */}
              <div className="pointer-events-none absolute -top-20 -end-20 h-40 w-40 rounded-full bg-[var(--brand)]/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -start-16 h-36 w-36 rounded-full bg-[var(--brand-accent)]/20 blur-3xl" />
              
              <div className="relative p-6 md:p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <motion.h3 
                      className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[var(--brand)] to-[var(--brand-accent)] bg-clip-text text-transparent"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {title}
                    </motion.h3>
                    {subtitle && (
                      <motion.p 
                        className="mt-2 text-[var(--ink-2)] leading-relaxed"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {subtitle}
                      </motion.p>
                    )}
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="btn-ghost p-2 rounded-xl"
                    aria-label="Close"
                    title="Close"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <span className="text-lg">✕</span>
                  </motion.button>
                </div>
                
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {children}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
            </div>
            <div className="mt-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
