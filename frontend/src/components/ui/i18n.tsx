"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Lang = "ar" | "en";

type Dict = {
  prev: string;
  next: string;
  aiReflection: string;
  days: string;
  language: string;
  generate: string;
  overview: string;
  habits: string;
  entries: string;
  reports: string;
  flows: {
    addHabitTitle: string;
    quickAddHabit: string;
    habitName: string;
    description: string;
    emoji: string;
    category: string;
    frequency: string;
    daily: string;
    weekly: string;
    perWeek: string;
    daysOfWeek: string;
    monthly: string;
    timePref: string;
    targetType: string;
    binary: string;
    quantified: string;
    amount: string;
    unit: string;
    times: string;
    minutes: string;
    pages: string;
    reminders: string;
    review: string;
    create: string;
    cancel: string;
    save: string;
    addEntryTitle: string;
    addEntry: string;
    pickHabit: string;
    done: string;
    partial: string;
    skipped: string;
    note: string;
    quantity: string;
    saveLog: string;
    fabAddHabit: string;
    fabAddHabitPro: string;
    fabQuickLog: string;
    fabFullEntry: string;
    created: string;
    advanced: string;
    logged: string;
    search: string;
  };
  errors: { required: string; min1: string };
};

export const DICT: Record<Lang, Dict> = {
  en: {
    prev: "Previous",
    next: "Next",
    aiReflection: "AI Reflection (quick options)",
    days: "Days",
    language: "Language",
    generate: "Generate",
    overview: "Overview",
    habits: "Habits",
    entries: "Entries",
    reports: "Reports",
    flows: {
      addHabitTitle: "Add Habit (Pro)",
      quickAddHabit: "Quick Add Habit",
      habitName: "Habit name",
      description: "Description",
      emoji: "Emoji",
      category: "Category",
      frequency: "Frequency",
      daily: "Daily",
      weekly: "Weekly",
      perWeek: "Times/Week",
      daysOfWeek: "Specific days",
      monthly: "Monthly",
      timePref: "Preferred time",
      targetType: "Target type",
      binary: "Binary",
      quantified: "Quantified",
      amount: "Amount",
      unit: "Unit",
      times: "Times",
      minutes: "Minutes",
      pages: "Pages",
      reminders: "Reminders",
      review: "Review",
      create: "Create",
      cancel: "Cancel",
      save: "Save",
      addEntryTitle: "Add Entry (Full)",
      addEntry: "Add Entry",
      pickHabit: "Pick a habit",
      done: "Done",
      partial: "Partial",
      skipped: "Skipped",
      note: "Note",
      quantity: "Quantity",
      saveLog: "Save",
      fabAddHabit: "Add Habit",
      fabAddHabitPro: "Add Habit (Pro)",
      fabQuickLog: "Quick Log",
      fabFullEntry: "Add Entry (Full)",
      created: "Created",
      advanced: "Open Advanced",
      logged: "Logged successfully ✅",
      search: "Type a command…",
    },
    errors: { required: "Required", min1: "Minimum is 1" },
  },
  ar: {
    prev: "السابق",
    next: "التالي",
    aiReflection: "تلخيص بالذكاء (خيارات سريعة)",
    days: "الأيام",
    language: "اللغة",
    generate: "توليد",
    overview: "تعريف وملخص",
    habits: "العادات",
    entries: "الإدخالات",
    reports: "التقارير",
    flows: {
      addHabitTitle: "إضافة عادة (متقدم)",
      quickAddHabit: "إضافة عادة سريعة",
      habitName: "اسم العادة",
      description: "الوصف",
      emoji: "إيموجي",
      category: "الفئة",
      frequency: "التكرار",
      daily: "يومي",
      weekly: "أسبوعي",
      perWeek: "مرات/أسبوع",
      daysOfWeek: "أيام محددة",
      monthly: "شهري",
      timePref: "الوقت المفضل",
      targetType: "نوع الهدف",
      binary: "تم/لا",
      quantified: "كمي",
      amount: "الكمية",
      unit: "الوحدة",
      times: "مرات",
      minutes: "دقائق",
      pages: "صفحات",
      reminders: "التذكيرات",
      review: "مراجعة",
      create: "إنشاء",
      cancel: "إلغاء",
      save: "حفظ",
      addEntryTitle: "إضافة إدخال (متقدم)",
      addEntry: "إضافة إدخال",
      pickHabit: "اختر عادة",
      done: "تم",
      partial: "جزئي",
      skipped: "تجاوز",
      note: "ملاحظة",
      quantity: "الكمية",
      saveLog: "حفظ",
      fabAddHabit: "إضافة عادة",
      fabAddHabitPro: "إضافة عادة (متقدم)",
      fabQuickLog: "تسجيل سريع",
      fabFullEntry: "إضافة إدخال (كامل)",
      created: "تم الإنشاء",
      advanced: "فتح المتقدم",
      logged: "تم التسجيل بنجاح ✅",
      search: "اكتب أمرًا…",
    },
    errors: { required: "حقل مطلوب", min1: "الحد الأدنى 1" },
  },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: Dict; 
};

function detectLang(): Lang {
  if (typeof window === "undefined") return "en"; // SSR
  try {
    const ls = localStorage.getItem("ms_lang") as Lang | null;
    if (ls === "ar" || ls === "en") return ls;
    const html = (
      document.documentElement.getAttribute("lang") || ""
    ).toLowerCase();
    if (html.startsWith("ar")) return "ar";
    if (html.startsWith("en")) return "en";
    const nav = (navigator.language || "").toLowerCase();
    return nav.startsWith("ar") ? "ar" : "en";
  } catch {
    return "en";
  }
}

const I18nCtx = createContext<Ctx | undefined>(undefined);

/** Provider مركزي للّغة */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    typeof window === "undefined" ? "en" : detectLang()
  );

  // طبّق lang/dir على <html> وخزّن الاختيار
  useEffect(() => {
    try {
      localStorage.setItem("ms_lang", lang);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ms_lang" && (e.newValue === "ar" || e.newValue === "en")) {
        setLangState(e.newValue as Lang);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang: (l) => setLangState(l),
      toggleLang: () => setLangState((p) => (p === "ar" ? "en" : "ar")),
      t: DICT[lang],
    }),
    [lang]
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
