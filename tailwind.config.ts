import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Black & White Theme
        background: "#FFFFFF",
        foreground: "#000000",

        // Text colors
        primary: "#000000",
        "primary-dark": "#1F2937",
        secondary: "#6B7280",

        // Borders and dividers
        border: "#E5E7EB",
        "light-gray": "#F9FAFB",

        // Accent colors (use sparingly)
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",

        // Lorenzo Teal/Gold Theme - DEFINED IN globals.css @theme block for Tailwind v4
        // Using CSS-first approach: text-lorenzo-dark-teal, bg-lorenzo-teal, etc.

        // Marketing site colors (blue theme) - kept for backwards compatibility
        "brand-blue": "#22BBFF",
        "brand-blue-dark": "#12A4EA",
        "brand-blue-light": "#7FD8FF",
        "brand-blue-50": "#E6F7FF",
        "brand-blue-100": "#BAE7FF",
        "brand-blue-900": "#002766",

        // shadcn/ui compatible colors
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#F9FAFB",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#F9FAFB",
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        input: "#E5E7EB",
        ring: "#000000",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        "xs": "0.75rem",      // 12px
        "sm": "0.875rem",     // 14px
        "base": "1rem",       // 16px
        "lg": "1.125rem",     // 18px
        "xl": "1.25rem",      // 20px
        "2xl": "1.5rem",      // 24px
        "3xl": "1.875rem",    // 30px
        "4xl": "2.25rem",     // 36px
        "5xl": "3rem",        // 48px
        "6xl": "3.75rem",     // 60px - Marketing hero
        "7xl": "4.5rem",      // 72px - Marketing hero desktop
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
        "blue-gradient": "linear-gradient(135deg, #22BBFF, #7FD8FF)",
        "blue-gradient-radial": "radial-gradient(circle at top, #22BBFF, #12A4EA)",
        "teal-gradient": "linear-gradient(135deg, #0A2F2C 0%, #0F3D38 100%)",
        "teal-gradient-nav": "linear-gradient(90deg, #0A2F2C 0%, #0F3D38 50%, #0A2F2C 100%)",
        "gold-gradient": "linear-gradient(135deg, #C9A962 0%, #A68B4B 100%)",
      },
      backdropBlur: {
        "glass": "16px",
      },
      boxShadow: {
        "glass": "0 8px 32px rgba(0, 0, 0, 0.08)",
        "card": "0 12px 30px rgba(0, 0, 0, 0.12)",
        "lift": "0 16px 48px rgba(0, 0, 0, 0.15)",
        "glow-blue": "0 0 24px rgba(34, 187, 255, 0.4)",
        "glow-teal": "0 0 24px rgba(45, 212, 191, 0.4)",
        "glow-gold": "0 0 24px rgba(201, 169, 98, 0.4)",
        "card-teal": "0 12px 30px rgba(10, 47, 44, 0.12)",
        "inner-glass": "inset 0 1px 2px rgba(255, 255, 255, 0.25)",
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
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "fade-in-down": "fade-in-down 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
