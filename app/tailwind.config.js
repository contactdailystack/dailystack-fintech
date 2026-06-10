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
        'dark-border': 'var(--color-dark-border)',
        // v4.1 Calm Warning Protocol - Amber (NOT red)
        amber: {
          warm: '#D97706',
          soft: '#B45309',
          soft2: '#F59E0B',
          soft3: '#FBBF24',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Kanit', 'system-ui', 'sans-serif'],
      },
      animation: {
        // v4.1 Breathing Aura - 60 BPM
        'breathe-in': 'breatheIn 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathe-calm': 'breatheIn 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'calm-pulse': 'calmPulse 1s ease-in-out infinite',
        'calm-pulse-fast': 'calmPulse 0.8s ease-in-out infinite',
        // v4.1 Slide to Transform success
        'slide-success': 'slideSuccessGlow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        // Liquid data dissolve
        'particle-dissolve': 'particleDissolve 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        breatheIn: {
          '0%': { opacity: '0.3', transform: 'scale(0.97)' },
          '50%': { opacity: '0.7', transform: 'scale(1.02)' },
          '100%': { opacity: '0.3', transform: 'scale(0.97)' },
        },
        calmPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        slideSuccessGlow: {
          '0%': { boxShadow: '0 0 0 rgba(199, 255, 46, 0)' },
          '50%': { boxShadow: '0 0 60px rgba(199, 255, 46, 0.6), 0 0 120px rgba(199, 255, 46, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(199, 255, 46, 0.3)' },
        },
        particleDissolve: {
          '0%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0px)' },
          '40%': { opacity: '0.3', transform: 'scale(1.05)', filter: 'blur(1px)' },
          '70%': { opacity: '0.1', transform: 'scale(1.1)', filter: 'blur(2px)' },
          '100%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0px)' },
        },
      },
    },
  },
  plugins: [],
}