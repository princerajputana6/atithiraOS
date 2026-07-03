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
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      backgroundImage: {
        "mesh-glow":
          "radial-gradient(60% 50% at 20% 10%, rgba(37,99,235,0.16), transparent 60%), radial-gradient(50% 40% at 85% 15%, rgba(14,165,233,0.14), transparent 60%), radial-gradient(60% 50% at 50% 100%, rgba(191,219,254,0.22), transparent 60%)",
        "sidebar-gradient":
          "linear-gradient(180deg, #1d4ed8 0%, #1e40af 55%, #1e3a8a 100%)",
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
