/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        bg: "#F8FAFC",
        surface: "#FFFFFF",
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
        },
        secondary: {
          500: "#4F46E5",
          600: "#4338CA",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        text: "#0F172A",
        muted: "#64748B",
        border: "#E2E8F0",
      },
      borderRadius: {
        xl: "18px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
        "card-hover": "0 10px 25px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.04)",
        soft: "0 2px 8px rgba(0,0,0,0.04)",
        "soft-lg": "0 4px 16px rgba(0,0,0,0.06)",
      },
      animation: {
        "progress": "progress 1s ease-out forwards",
      },
      keyframes: {
        progress: {
          "0%": { width: "0%" },
          "100%": { width: "var(--target-width)" },
        },
      },
    },
  },
  plugins: [],
};
