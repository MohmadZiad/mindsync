/** @type {import('tailwindcss').Config} */
module.exports = {
  // Dark mode is toggled via a class on <html> or <body>
  darkMode: "class",

  // Scan all UI-bearing files to ensure proper tree-shaking (purge)
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  // Safelist classes that might be constructed dynamically at runtime
  safelist: [
    {
      pattern:
        /(text|bg|border|ring)-(indigo|purple|sky)-(50|100|200|300|400|500|600)/,
      variants: ['hover', 'focus', 'active'],
    },
    { 
      pattern: /(from|to)-(indigo|purple|sky)-(300|400|500|600)/, 
      variants: ['hover', 'focus'] 
    },
    // Mood/body classes (applied outside of JSX utility contexts)
    "moodify-all",
    "mood-calm",
    "mood-focus",
    "mood-energy",
    "mood-soft",
  ],

  theme: {
    container: { center: true, padding: "1rem" },

    extend: {
      // Bind Tailwind’s color aliases to your CSS variables where applicable
      colors: {
        // Fixed brand palette (fallbacks) — useful for charts or static assets
        primary: {
          DEFAULT: "#6D5EF1",
          light: "#E9E4FF",
          dark: "#4C3BCF",
          fg: "#FFFFFF",
        },
        page: {
          DEFAULT: "#FFFFFF",
          dark: "#0B1020",
        },
        text: {
          DEFAULT: "#0F172A",
          muted: "#475569",
          invert: "#FFFFFF",
        },

        // Variable-driven tokens (read from global.css)
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

      // Use your CSS variable radii (legacy aliases preserved in global.css)
      borderRadius: {
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },

      // Common soft shadows (match your global --shadow style)
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,.06)",
        md: "0 2px 8px rgba(0,0,0,.08)",
        lg: "0 10px 20px rgba(0,0,0,.10)",
      },

      // Consistent spacing scale
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

      // Typographic presets
      fontSize: {
        h1: ["2.25rem", { lineHeight: "1.2", fontWeight: "800" }],
        h2: ["1.5rem", { lineHeight: "1.3", fontWeight: "700" }],
      },

      // Bind the default sans to your CSS var (set in global.css)
      fontFamily: {
        sans: ["var(--app-font)", "ui-sans-serif", "system-ui"],
      },

      // Helpful grid preset
      gridTemplateColumns: {
        12: "repeat(12, minmax(0, 1fr))",
      },

      // Optional: expose keyframes used in CSS for @apply-able animations if desired
      // (You already define them in CSS; keeping here commented for future use)
      /*
      keyframes: {
        gradient: { "0%,100%": { "background-position": "0% 50%" }, "50%": { "background-position": "100% 50%" } },
        breath:  { "0%,100%": { transform: "scale(0.96)", opacity: "0.9" }, "50%": { transform: "scale(1.04)", opacity: "1" } },
      },
      animation: {
        gradient: "gradient 8s ease infinite",
        breath: "breath 6s ease-in-out infinite",
      },
      */
    },
  },

  // Official plugins + RTL
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwindcss-rtl"),
  ],
};
