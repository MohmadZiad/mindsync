/** @type {import('tailwindcss').Config} */
module.exports = {
  // نستخدم كلاس للتبديل الداكن
  darkMode: "class",

  // أماكن فحص المكوّنات/الصفحات
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

 
  safelist: [
    {
      // ألوان شائعة قد تُبنى ديناميكيًا
      pattern:
        /(text|bg|border|ring)-(indigo|purple|sky)-(50|100|200|300|400|500|600)/,
      variants: ["hover", "focus", "active"],
    },
    {
      // تدرجات مستعملة قديمًا
      pattern: /(from|to)-(indigo|purple|sky)-(300|400|500|600)/,
      variants: ["hover", "focus"],
    },
    // مزاج/جسم (كلاسات على عناصر خارج JSX utilities)
    "moodify-all",
    "mood-calm",
    "mood-focus",
    "mood-energy",
    "mood-soft",
  ],

  theme: {
    container: { center: true, padding: "1rem" },

    extend: {
      /**
       * ربط أسماء الألوان بمتغيّرات CSS لديك
       * (تقدر تستخدم var(...) أو hsl(var(...)) حسب ما ضابط متغيّراتك)
       */
      colors: {
        // باليتة ثابتة (للاحتياجات الثابتة)
        primary: {
          DEFAULT: "#6D5EF1",
          light: "#E9E4FF",
          dark: "#4C3BCF",
          fg: "#FFFFFF",
        },

        page: { DEFAULT: "#FFFFFF", dark: "#0B1020" },
        text: { DEFAULT: "#0F172A", muted: "#475569", invert: "#FFFFFF" },

        // المربوطة بمتغيّرات CSS من globals.css
        brand: { DEFAULT: "var(--brand)" }, // يمكن hsl(var(--brand)) لو متغيرك HSL
        surface: {
          DEFAULT: "var(--surface)",
          fg: "var(--surface-foreground)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        border: "var(--border)",
        ring: "var(--ring)",
        success: "var(--success)",
        warn: "var(--warn)",
        danger: "var(--danger)",
      },

      borderRadius: {
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },

      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,.06)",
        md: "0 2px 8px rgba(0,0,0,.08)",
        lg: "0 10px 20px rgba(0,0,0,.10)",
      },

      spacing: {
        1: "0.25rem",
        2: "0.5rem",
        3: "0.75rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        8: "2rem",
        10: "2.5rem",
        12: "3rem",
        16: "4rem",
      },

      fontSize: {
        h1: ["2.25rem", { lineHeight: "1.2", fontWeight: "800" }],
        h2: ["1.5rem", { lineHeight: "1.3", fontWeight: "700" }],
      },

      fontFamily: {
        sans: ["var(--app-font)", "ui-sans-serif", "system-ui"],
      },

      gridTemplateColumns: {
        12: "repeat(12, minmax(0, 1fr))",
      },
    },
  },

  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwindcss-rtl"),
  ],
};
