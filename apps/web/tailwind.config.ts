import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
      backgroundImage: {
        "mesh-glow":
          "radial-gradient(60% 50% at 20% 10%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(50% 40% at 85% 15%, rgba(56,189,248,0.30), transparent 60%), radial-gradient(60% 50% at 50% 100%, rgba(168,85,247,0.25), transparent 60%)",
        "sidebar-gradient":
          "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)",
        "card-hover":
          "0 4px 6px -1px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
