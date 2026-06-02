"use strict";﻿/** @type {import('tailwindcss').Config} */
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
        primary: "#56be89", // DailyStack Brand Green
        // ใช้ชื่อสีแบบทั่วไปเพื่อให้รองรับทั้งโหมด Dark และ Light ได้ง่าย
        dark: {
          bg: "#1c232a",   // Deep Dark Background
          card: "#242d35", // Surface / Card
        },
        light: {
          bg: "#ffffff",
          card: "#f9fafb",
        },
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
        'glow-primary': '0 0 32px rgba(86, 190, 137, 0.3)',
      },
    },
  },
  
  plugins: [],
} /* v7-b61514ae9a96fdbc */