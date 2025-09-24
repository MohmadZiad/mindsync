"use client";

import React from "react";
import { motion } from "framer-motion";

import LoginForm from "@/features/auth/components/LoginForm";
import AuthLayout from "@/features/auth/components/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10"
      >
        <LoginForm />
      </motion.div>
    </AuthLayout>
  );
}