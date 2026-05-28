/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#56be89",
        "dark-bg": "#1c232a",
        "dark-card": "#242d35",
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        kanit: ['Kanit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
