/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* ── PILO ACCENT — Primary Brand Color ─────────────────────
         #D1FF3B — Electric Lime
         Used sparingly: 5-10% of screen (Rule of 10%)
      ─────────────────────────────────────────────────────────── */
      colors: {
        pilo: {
          DEFAULT: '#D1FF3B',
          light:   '#E8FF7A',
          dark:    '#B8E600',
          glow:    'rgba(209, 255, 59, 0.40)',
          'glow-sm': 'rgba(209, 255, 59, 0.20)',
          surface: 'rgba(209, 255, 59, 0.08)',
          muted:   'rgba(209, 255, 59, 0.15)',
          text:    '#111111',
        },

        /* ── ACCENT ALIASES ─────────────────────────────────── */
        neon: {
          DEFAULT: 'var(--pilo)',
          light:   'var(--pilo-light)',
          dark:    'var(--pilo-dark)',
          glow:    'var(--pilo-glow)',
          surface: 'var(--pilo-surface)',
          text:    'var(--pilo-text)',
        },

        lime: {
          DEFAULT: '#D1FF3B',
          light:   '#E8FF7A',
          dark:    '#B8E600',
          glow:    'rgba(209, 255, 59, 0.40)',
          'glow-sm': 'rgba(209, 255, 59, 0.20)',
          surface: 'rgba(209, 255, 59, 0.08)',
          soft:    'rgba(209, 255, 59, 0.06)',
          text:    '#111111',
        },

        /* ── LIFE DIMENSIONS ACCENTS ────────────────────────── */
        work:       '#D1FF3B',  /* Pilo Lime */
        learning:   '#5BE89C',  /* Mint */
        social:     '#FF7EAD',  /* Coral Pink */
        passion:   '#A78BFA',  /* Purple */
        wellbeing: '#FBBF24',  /* Gold */

        /* ── SURFACE BLACK — Pilo Signature Cards ──────────── */
        'surface-black': '#111111',
        'surface-dark': '#0D0D0D',

        /* ── SEMANTIC COLORS ───────────────────────────────── */
        success: {
          DEFAULT: '#22C55E',
          surface: 'rgba(34, 197, 94, 0.12)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          surface: 'rgba(245, 158, 11, 0.12)',
        },
        error: {
          DEFAULT: '#EF4444',
          surface: 'rgba(239, 68, 68, 0.12)',
        },
        info: {
          DEFAULT: '#3B82F6',
          surface: 'rgba(59, 130, 246, 0.12)',
        },

        /* ── SURFACE TOKENS ───────────────────────────────── */
        surface: {
          0: 'var(--surface-0)',
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
          4: 'var(--surface-4)',
        },

        /* ── TEXT TOKENS ──────────────────────────────────── */
        text: {
          primary:     'var(--text-primary)',
          secondary:   'var(--text-secondary)',
          muted:       'var(--text-muted)',
          disabled:    'var(--text-disabled)',
          inverse:     'var(--text-inverse)',
        },

        /* ── BORDER TOKENS ───────────────────────────────── */
        border: {
          subtle: 'var(--border-subtle)',
          mid:    'var(--border-mid)',
          strong: 'var(--border-strong)',
        },

        /* ── CHART COLORS ─────────────────────────────────── */
        chart: {
          1: '#D1FF3B',
          2: '#5BE89C',
          3: '#FF7EAD',
          4: '#A78BFA',
          5: '#FBBF24',
        },
      },

      /* ── SHADOWS — Pilo Soft Depth ──────────────────────────── */
      boxShadow: {
        /* Pilo Light Shadows */
        'xs':      '0 1px 2px rgba(17, 17, 17, 0.04)',
        'sm':      '0 2px 8px rgba(17, 17, 17, 0.06)',
        'md':      '0 4px 16px rgba(17, 17, 17, 0.08)',
        'lg':      '0 8px 32px rgba(17, 17, 17, 0.10)',
        'xl':      '0 16px 48px rgba(17, 17, 17, 0.12)',
        
        /* Card Shadows */
        'card':    '0 4px 20px rgba(17, 17, 17, 0.08)',
        'lifted':  '0 12px 40px rgba(17, 17, 17, 0.12)',
        'float':   '0 20px 60px rgba(17, 17, 17, 0.14)',
        'nav':     '0 8px 32px rgba(17, 17, 17, 0.10)',

        /* Pilo Glow */
        'pilo':    '0 0 28px rgba(209, 255, 59, 0.40)',
        'pilo-sm': '0 0 16px rgba(209, 255, 59, 0.20)',
        'pilo-lg': '0 0 48px rgba(209, 255, 59, 0.50)',

        /* Dark Shadows */
        'dark-sm': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'dark-md': '0 8px 24px rgba(0, 0, 0, 0.35)',
        'dark-lg': '0 16px 48px rgba(0, 0, 0, 0.40)',
      },

      /* ── BORDER RADIUS — Pilo Extreme Rounded ──────────────── */
      borderRadius: {
        'xs':   '8px',
        'sm':   '12px',
        'md':   '16px',
        'lg':   '24px',
        'xl':   '32px',
        '2xl':  '40px',
        'pill': '9999px',
        'card': '28px',
        'nav':  '32px',
        'full': '9999px',
      },

      /* ── FONT FAMILIES ─────────────────────────────────────── */
      fontFamily: {
        sans:     ['Space Grotesk', 'Prompt', 'system-ui', 'sans-serif'],
        mono:     ['JetBrains Mono', 'monospace'],
        kanit:    ['Prompt', 'sans-serif'],
        display:  ['Space Grotesk', 'system-ui'],
      },

      /* ── ANIMATION TIMING ───────────────────────────────────── */
      transitionTimingFunction: {
        'smooth':  'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring':  'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'out':     'cubic-bezier(0, 0, 0.2, 1)',
        'in':      'cubic-bezier(0.4, 0, 1, 1)',
      },

      transitionDuration: {
        'instant': '50ms',
        'fast':    '100ms',
        'normal':  '200ms',
        'slow':    '300ms',
        'slower':  '400ms',
        'slowest': '600ms',
      },

      /* ── ANIMATIONS ────────────────────────────────────────── */
      animation: {
        /* Entrance */
        'fade-up':       'fadeUp 300ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in':       'fadeIn 200ms cubic-bezier(0, 0, 0.2, 1) both',
        'scale-in':      'scaleIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-up':      'slideUp 300ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-down':    'slideDown 200ms cubic-bezier(0, 0, 0.2, 1) both',
        'slide-right':   'slideRight 200ms cubic-bezier(0.22, 1, 0.36, 1) both',

        /* Loop */
        'pulse-soft':    'pulseSoft 2.5s ease-in-out infinite',
        'pulse-glow':    'pulseGlow 2s ease-in-out infinite',
        'float':         'float 4s ease-in-out infinite',
        'float-slow':    'floatSlow 6s ease-in-out infinite',
        'spin':          'spin 1s linear infinite',
        'shimmer':       'shimmer 1.5s ease-in-out infinite',
      },

      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.7', transform: 'scale(0.95)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(209, 255, 59, 0.20)' },
          '50%':      { opacity: '0.85', boxShadow: '0 0 40px rgba(209, 255, 59, 0.40)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-15px) rotate(3deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },

      /* ── SPACING ────────────────────────────────────────────── */
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      /* ── Z-INDEX ────────────────────────────────────────────── */
      zIndex: {
        'base':     '0',
        'dropdown': '10',
        'sticky':   '20',
        'overlay':  '30',
        'modal':    '40',
        'popover':  '50',
        'tooltip':  '60',
        'toast':    '70',
      },
    },
  },
  plugins: [],
}
