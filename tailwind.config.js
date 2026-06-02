/** @type {import('tailwindcss').Config} */
module.exports = {
  // เปิดใช้งานการสลับโหมดผ่าน class (Dark/Light Mode)
  darkMode: 'class',
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      // ── Brand Colours ──────────────────────────────────────────────────────
      colors: {
        primary: "#CCFF00", // Pilo Electric Green (Exact Spec)
        dark: {
          bg: "#0F0F0F",   // Pilo Black (Exact Spec)
          card: "#2C2C2C", // Pilo Charcoal (Exact Spec)
        },
        control: "#2C2C2C", // Pilo Charcoal (Exact Spec)
        emerald: "#CCFF00", // Mapped to Electric Green
        light: {
          bg: "#FFFFFF",   // Pure White
          card: "#2C2C2C", // Charcoal
        },
        gray: {
          mid: "#999999",  // Mid Gray
          dark: "#2C2C2C",
        }
      },

      // ── Brand Typography ───────────────────────────────────────────────────
      // EN copy → Space Grotesk (font-sans)
      // TH copy → Kanit (font-kanit)
      fontFamily: {
        sans: ['"Space Grotesk"', '"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        kanit: ['"DB Heavent"', 'Kanit', 'sans-serif'],
      },

      // ── Custom Box Shadows ────────────────────────────────────────────────
      boxShadow: {
        'glow-primary': '0 0 32px rgba(199, 255, 46, 0.3)',
      },
    },
  },
  
  plugins: [],
}