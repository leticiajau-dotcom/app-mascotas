/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Misma paleta azul/slate del MVP anterior.
        primary: {
          DEFAULT: "#0284C7",
          light: "#E0F2FE",
          dark: "#0369A1",
        },
        ink: "#0F172A",
        muted: "#64748B",
        surface: "#FFFFFF",
        bg: "#F8FAFC",
        border: "#E2E8F0",
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
        },
        success: "#16A34A",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
