/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pilo: {
          DEFAULT: '#CCFF00',
          light: '#C7FF2E',
        },
        emerald: {
          brand: '#10B981',
          dark: '#059669',
        },
        // Theme-backed semantic tokens (read from CSS variables)
        brand: 'var(--color-brand)',
        'brand-muted': 'var(--color-brand-muted)',
        'dark-bg': 'var(--color-dark-bg)',
        'dark-card': 'var(--color-dark-card)',
        'dark-border': 'var(--color-dark-border)'
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Kanit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
