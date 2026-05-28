/** @type {import('tailwindcss').Config} */
module.exports = {
  // Class-based dark mode — required for feature-scoped dark tinting
  darkMode: 'class',
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      /* ============================================================
       * BRAND COLOR PALETTE — DailyStack Identity (v2.0)
       * ============================================================ */
      colors: {
        brand: {
          mint: 'var(--brand-500)',
          lime: 'var(--brand-500)',
          dark: 'var(--brand-600)',
          ink: 'var(--brand-ink)',
          bg: 'var(--brand-bg)',
          panel: 'var(--brand-panel)',
        },

        semantic: {
          bg: 'var(--semantic-bg)',
          'surface-2': 'var(--semantic-surface-2)',
          'surface-1': 'var(--semantic-surface-1)',
          panel: 'var(--semantic-panel)',
          text: 'var(--semantic-text)',
          muted: 'var(--semantic-muted)',
          inverse: 'var(--semantic-inverse)',
          border: 'var(--semantic-border)',
          success: 'var(--semantic-success)',
          'success-soft': 'var(--semantic-success-soft)',
          warning: 'var(--semantic-warning)',
          'warning-soft': 'var(--semantic-warning-soft)',
          error: 'var(--semantic-error)',
          'error-soft': 'var(--semantic-error-soft)',
          info: 'var(--semantic-info)',
          'info-soft': 'var(--semantic-info-soft)',
        },

        feature: {
          dating: {
            primary: 'var(--feature-dating-primary)',
            'on-primary': 'var(--feature-dating-on-primary)',
            hover: 'var(--feature-dating-primary-hover)',
            pressed: 'var(--feature-dating-primary-pressed)',
            accent: 'var(--feature-dating-accent)',
            'soft-bg': 'var(--feature-dating-soft-bg)',
            border: 'var(--feature-dating-border)',
            decorative: 'var(--feature-dating-decorative)',
            'dark-variant': 'var(--feature-dating-dark-variant)',
          },
          events: {
            primary: 'var(--feature-events-primary)',
            'on-primary': 'var(--feature-events-on-primary)',
            hover: 'var(--feature-events-primary-hover)',
            pressed: 'var(--feature-events-primary-pressed)',
            accent: 'var(--feature-events-accent)',
            'soft-bg': 'var(--feature-events-soft-bg)',
            border: 'var(--feature-events-border)',
            decorative: 'var(--feature-events-decorative)',
            'dark-variant': 'var(--feature-events-dark-variant)',
          },
          community: {
            primary: 'var(--feature-community-primary)',
            'on-primary': 'var(--feature-community-on-primary)',
            hover: 'var(--feature-community-primary-hover)',
            pressed: 'var(--feature-community-primary-pressed)',
            accent: 'var(--feature-community-accent)',
            'soft-bg': 'var(--feature-community-soft-bg)',
            border: 'var(--feature-community-border)',
            decorative: 'var(--feature-community-decorative)',
            'dark-variant': 'var(--feature-community-dark-variant)',
          },
          marketplace: {
            primary: 'var(--feature-marketplace-primary)',
            'on-primary': 'var(--feature-marketplace-on-primary)',
            hover: 'var(--feature-marketplace-primary-hover)',
            pressed: 'var(--feature-marketplace-primary-pressed)',
            accent: 'var(--feature-marketplace-accent)',
            'soft-bg': 'var(--feature-marketplace-soft-bg)',
            border: 'var(--feature-marketplace-border)',
            decorative: 'var(--feature-marketplace-decorative)',
            'dark-variant': 'var(--feature-marketplace-dark-variant)',
          },
          ai: {
            primary: 'var(--feature-ai-primary)',
            'on-primary': 'var(--feature-ai-on-primary)',
            hover: 'var(--feature-ai-primary-hover)',
            pressed: 'var(--feature-ai-primary-pressed)',
            accent: 'var(--feature-ai-accent)',
            'soft-bg': 'var(--feature-ai-soft-bg)',
            border: 'var(--feature-ai-border)',
            decorative: 'var(--feature-ai-decorative)',
            'dark-variant': 'var(--feature-ai-dark-variant)',
          },
          wallet: {
            primary: 'var(--feature-wallet-primary)',
            'on-primary': 'var(--feature-wallet-on-primary)',
            hover: 'var(--feature-wallet-primary-hover)',
            pressed: 'var(--feature-wallet-primary-pressed)',
            accent: 'var(--feature-wallet-accent)',
            'soft-bg': 'var(--feature-wallet-soft-bg)',
            border: 'var(--feature-wallet-border)',
            decorative: 'var(--feature-wallet-decorative)',
            'dark-variant': 'var(--feature-wallet-dark-variant)',
          },
          pet: {
            primary: 'var(--feature-pet-primary)',
            'on-primary': 'var(--feature-pet-on-primary)',
            hover: 'var(--feature-pet-primary-hover)',
            pressed: 'var(--feature-pet-primary-pressed)',
            accent: 'var(--feature-pet-accent)',
            'soft-bg': 'var(--feature-pet-soft-bg)',
            border: 'var(--feature-pet-border)',
            decorative: 'var(--feature-pet-decorative)',
            'dark-variant': 'var(--feature-pet-dark-variant)',
          },
        },

        theme: {
          primary: 'var(--theme-primary)',
          'on-primary': 'var(--theme-on-primary)',
          accent: 'var(--theme-accent)',
          'soft-bg': 'var(--theme-soft-bg)',
          border: 'var(--theme-border)',
          decoration: 'var(--theme-decoration)',
        },

        state: {
          hover: 'var(--state-hover-bg)',
          pressed: 'var(--state-pressed-shadow)',
          disabled: 'var(--state-disabled-bg)',
          error: 'var(--state-error)',
          success: 'var(--state-success)',
          warning: 'var(--state-warning)',
          info: 'var(--state-info)',
        },

        surface: {
          bg: 'var(--semantic-bg)',
          'surface-2': 'var(--semantic-surface-2)',
          'surface-1': 'var(--semantic-surface-1)',
          elevated: 'var(--semantic-panel)',
        },
      },
      
      /* ── Dark Mode Surfaces ─────────────────────────────────── */
      dark: {
        bg: '#0D1117',  // Modern fintech dark
        surface2: '#161B22',
        surface1: '#21262D',
        elevated: '#30363D',
      },
      light: {
        bg:       '#FAFBFC',
        surface2: '#F0F2F5',
        surface1: '#FFFFFF',
        elevated: '#FFFFFF',
      },
      
      /* ============================================================
       * BOX SHADOWS — Soft/Blurry (v2.0)
       * ============================================================
       * Updated from sharp brutalist to soft modern shadows
       */
      boxShadow: {
        /* Small — buttons, inputs */
        'soft-sm':  '0 2px 8px rgba(13, 17, 23, 0.08)',
        /* Medium — cards, small containers */
        'soft-md':  '0 4px 16px rgba(13, 17, 23, 0.12)',
        /* Large — major cards, modals */
        'soft-lg':  '0 8px 32px rgba(13, 17, 23, 0.16)',
        /* XL — elevated modals, dropdowns */
        'soft-xl':  '0 16px 48px rgba(13, 17, 23, 0.20)',
        
        /* Feature glow variants */
        'glow-brand':     '0 0 24px rgba(170, 255, 18, 0.30)',
        'glow-dating':     '0 0 24px rgba(255, 107, 129, 0.30)',
        'glow-events':     '0 0 24px rgba(255, 210, 77, 0.30)',
        'glow-community':  '0 0 24px rgba(92, 195, 255, 0.30)',
        'glow-marketplace':'0 0 24px rgba(170, 255, 18, 0.30)',
        'glow-ai':        '0 0 24px rgba(138, 76, 255, 0.30)',
        'glow-wallet':    '0 0 24px rgba(214, 69, 62, 0.30)',
        'glow-pet':       '0 0 24px rgba(159, 216, 168, 0.30)',
      },
      
      /* ============================================================
       * BORDER WIDTHS
       * ============================================================ */
      borderWidth: {
        '0':  '0',
        '1':  '1px',
        '2':  '2px',
        '3':  '3px',
        '4':  '4px',
      },
      
      /* ============================================================
       * RADIUS — Modern fintech (larger rounded corners)
       * ============================================================ */
      borderRadius: {
        'sm':  '8px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '24px',
        '2xl': '32px',
        '3xl': '40px',
        'full': '9999px',  // Full pill
      },
      
      /* ============================================================
       * TYPOGRAPHY — Brand Fonts
       * ============================================================ */
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        kanit: ['Kanit', 'sans-serif'],
      },
      
      /* ============================================================
       * TRANSITIONS — Smooth Modern Easing
       * ============================================================ */
      transitionDuration: {
        'fast':   '150ms',
        'normal': '200ms',
        'slow':   '250ms',
        'slower': '350ms',
      },
      
      transitionTimingFunction: {
        'retro':    'cubic-bezier(0.22, 1, 0.36, 1)',
        'smooth':   'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce':   'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      /* ============================================================
       * ANIMATION — Keyframes for micro-interactions
       * ============================================================ */
      animation: {
        'press':      'press 150ms cubic-bezier(0.22, 1, 0.36, 1)',
        'bounce-in':  'bounce-in 350ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'fade-in':    'fade-in 200ms ease-out',
        'slide-up':   'slide-up 250ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        press: {
          '0%':   { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(1px) scale(0.98)' },
        },
        'bounce-in': {
          '0%':   { transform: 'scale(0.9)', opacity: '0' },
          '50%':  { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  
  plugins: [],
}