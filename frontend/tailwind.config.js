/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        brand: {
          DEFAULT: "hsl(var(--brand))",
          fg: "hsl(var(--brand-foreground))",
          muted: "hsl(var(--brand-muted))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          fg: "hsl(var(--surface-foreground))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
        },
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        success: "hsl(var(--success))",
        warn: "hsl(var(--warn))",
        danger: "hsl(var(--danger))",
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
      gridTemplateColumns: { 12: "repeat(12, minmax(0, 1fr))" },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwindcss-rtl"),
  ],
};
