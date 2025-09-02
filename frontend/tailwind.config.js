/** @type {import('tailwindcss').Config} */
module.exports = {
  // Dark mode controlled by a class on <html> or <body>
  darkMode: "class",

  // Scan your src tree (unchanged)
  content: ["./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    // Centered container with consistent padding
    container: { center: true, padding: "1rem" },

    extend: {
      // ---- New, friendly color aliases (added; nothing removed) ----
      colors: {
        /**
         * Modern Purple/White palette (safe additions).
         * Use:
         *  bg-primary / text-primary / hover:bg-primary-dark
         *  bg-primary-light / text-muted / bg-page / bg-page-dark
         */
        primary: {
          DEFAULT: "#6D5EF1",  // main purple
          light: "#E9E4FF",    // subtle backgrounds, badges
          dark: "#4C3BCF",     // hovers / active states
          fg: "#FFFFFF",       // on-primary text
        },
        page: {
          DEFAULT: "#FFFFFF",  // app background (light)
          dark: "#0B1020",     // app background (dark)
        },
        text: {
          DEFAULT: "#0F172A",  // main ink
          muted: "#475569",    // secondary ink
          invert: "#FFFFFF",   // on dark blocks
        },

        // ---- Your existing design tokens (kept intact) ----
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

      // Radii aliases (kept)
      borderRadius: {
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },

      // Shadow presets (kept)
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,.06)",
        md: "0 2px 8px rgba(0,0,0,.08)",
        lg: "0 10px 20px rgba(0,0,0,.10)",
      },

      // Spacing scale (kept)
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

      // Typographic shortcuts (kept)
      fontSize: {
        h1: ["2.25rem", { lineHeight: "1.2", fontWeight: "800" }],
        h2: ["1.5rem", { lineHeight: "1.3", fontWeight: "700" }],
      },

      // Grid helpers (kept)
      gridTemplateColumns: { 12: "repeat(12, minmax(0, 1fr))" },
    },
  },

  // Plugins (kept)
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwindcss-rtl"),
  ],
};
