"use strict";/** @type {import('tailwindcss').Config} */
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
        primary: "#C7FF2E", // Pilo Lime Green
        // ใช้ชื่อสีแบบทั่วไปเพื่อให้รองรับทั้งโหมด Dark และ Light ได้ง่าย
        dark: {
          bg: "#0F0F0F",   // Pilo Cockpit Black
          card: "#2E2E2E", // Pilo Charcoal
        },
        light: {
          bg: "#ffffff",
          card: "#f9fafb",
        },
        gray: {
          mid: "#808080",  // Pilo Mid Gray
        }
      },

      // ── Brand Typography ───────────────────────────────────────────────────
      // EN copy → Space Grotesk (font-sans)
      // TH copy → Kanit (font-kanit)
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        kanit: ['Kanit', 'sans-serif'],
      },

      // ── Custom Box Shadows ────────────────────────────────────────────────
      boxShadow: {
        'glow-primary': '0 0 32px rgba(199, 255, 46, 0.3)',
      },
    },
  },
  
  plugins: [],
} /* v7-079af1ce0e9b29f7 */