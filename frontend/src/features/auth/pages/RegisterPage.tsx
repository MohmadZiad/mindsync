"use client";

import React from "react";
import { motion } from "framer-motion";

import RegisterForm from "@/features/auth/components/RegisterForm";
import AuthLayout from "@/features/auth/components/AuthLayout";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10"
      >
        <RegisterForm />
      </motion.div>
    </AuthLayout>
  );
}