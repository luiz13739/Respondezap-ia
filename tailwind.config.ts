import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EAFBF1",
          100: "#D1F6E0",
          400: "#3EDC7E",
          500: "#25D366", // verde principal (WhatsApp)
          600: "#1DA851",
          700: "#128C7E",
        },
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(17, 24, 39, 0.12)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
