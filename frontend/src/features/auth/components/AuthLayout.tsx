"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import SpotlightBG from "@/components/effects/SpotlightBG";
import { useI18n } from "@/components/ui/i18n";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useI18n();

  return (
    <SpotlightBG className="min-h-screen">
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="flex justify-center">
            <Image
              src="/logo.jpg"
              alt="MindSync"
              width={64}
              height={64}
              className="rounded-2xl shadow-lg"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            MindSync
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {lang === "ar" 
              ? "تابع عاداتك الذهنية وتقدم كل يوم"
              : "Track your mental habits and grow every day"
            }
          </p>
        </motion.div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-white/20 dark:border-gray-800/50">
            {children}
          </div>
        </div>
      </div>
    </SpotlightBG>
  );
}