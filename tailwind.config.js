const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        organic: {
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
          text: "var(--color-text)",
          accent: {
            DEFAULT: "var(--color-accent)",
            100: "var(--color-accent-100)",
            200: "var(--color-accent-200)",
            300: "var(--color-accent-300)",
            400: "var(--color-accent-400)",
            500: "var(--color-accent-500)",
            600: "var(--color-accent-600)",
            700: "var(--color-accent-700)",
            800: "var(--color-accent-800)",
            900: "var(--color-accent-900)",
          },
          accent2: {
            DEFAULT: "var(--color-accent-2)",
            100: "var(--color-accent-2-100)",
            200: "var(--color-accent-2-200)",
            300: "var(--color-accent-2-300)",
            400: "var(--color-accent-2-400)",
            500: "var(--color-accent-2-500)",
            600: "var(--color-accent-2-600)",
            700: "var(--color-accent-2-700)",
            800: "var(--color-accent-2-800)",
            900: "var(--color-accent-2-900)",
          },
          neutral: {
            100: "var(--color-neutral-100)",
            200: "var(--color-neutral-200)",
            300: "var(--color-neutral-300)",
            400: "var(--color-neutral-400)",
            500: "var(--color-neutral-500)",
            600: "var(--color-neutral-600)",
            700: "var(--color-neutral-700)",
            800: "var(--color-neutral-800)",
            900: "var(--color-neutral-900)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      fontFamily: {
        sans: ["var(--font-body)", ...fontFamily.sans],
        heading: ["var(--font-heading)", ...fontFamily.sans],
      },
      boxShadow: {
        "organic-sm": "var(--shadow-sm)",
        "organic-md": "var(--shadow-md)",
        "organic-lg": "var(--shadow-lg)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

module.exports = config;
