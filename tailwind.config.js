/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          black: "#0a0a0a",
          ink: "#171717",
          chrome: "#e5e5e5",
          mute: "#9ca3af",
          blue: "#3b82f6",
          green: "#22c55e",
          yellow: "#eab308",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(to right, #3b82f6, #22c55e, #eab308)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(59,130,246,0.35)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
