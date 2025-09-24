"use client";

import React from "react";
import { motion } from "framer-motion";
import { Chrome, Github, Facebook } from "lucide-react";

import { authService } from "@/services/auth";
import { useI18n } from "@/components/ui/i18n";
import { Button } from "@/components/ui/Button";

export default function AuthProviders() {
  const { lang } = useI18n();

  const labels = {
    continueWith: lang === "ar" ? "أو تابع مع" : "Or continue with",
    google: lang === "ar" ? "جوجل" : "Google",
    github: lang === "ar" ? "جيت هاب" : "GitHub", 
    facebook: lang === "ar" ? "فيسبوك" : "Facebook",
  };

  const providers = [
    {
      name: "google",
      label: labels.google,
      icon: <Chrome size={18} />,
      onClick: () => authService.googleRedirect(),
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      name: "github", 
      label: labels.github,
      icon: <Github size={18} />,
      onClick: () => {
        // TODO: Implement GitHub OAuth
        console.log("GitHub OAuth not implemented yet");
      },
      color: "bg-gray-900 hover:bg-gray-800",
    },
    {
      name: "facebook",
      label: labels.facebook, 
      icon: <Facebook size={18} />,
      onClick: () => {
        // TODO: Implement Facebook OAuth
        console.log("Facebook OAuth not implemented yet");
      },
      color: "bg-blue-600 hover:bg-blue-700",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
            {labels.continueWith}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {providers.map((provider, index) => (
          <motion.div
            key={provider.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              fullWidth
              onClick={provider.onClick}
              leftIcon={provider.icon}
              className="justify-center"
            >
              {provider.label}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}