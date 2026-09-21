/**
 * Design tokens for the Soil Charger Technology revamp.
 * Colours are declared as CSS variables in src/styles/index.css and referenced
 * here through rgb(var(--…)), so the whole site can be recoloured from one file.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--c-primary) / <alpha-value>)',
        deep: 'rgb(var(--c-deep) / <alpha-value>)',
        leaf: 'rgb(var(--c-leaf) / <alpha-value>)',
        earth: 'rgb(var(--c-earth) / <alpha-value>)',
        soil: 'rgb(var(--c-soil) / <alpha-value>)',
        cream: 'rgb(var(--c-cream) / <alpha-value>)',
        canvas: 'rgb(var(--c-bg) / <alpha-value>)',
        sun: 'rgb(var(--c-accent) / <alpha-value>)',
        ink: 'rgb(var(--c-text) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
      },
      /*
        Tailwind only emits an opacity modifier (`bg-primary/8`) when the value
        exists in this scale — anything else is dropped silently, leaving the
        element unstyled. These are the fine-grained tints the design uses for
        washes, blobs and translucent bars; without them those surfaces render
        fully transparent.
      */
      opacity: {
        4: '0.04',
        6: '0.06',
        7: '0.07',
        8: '0.08',
        12: '0.12',
        15: '0.15',
        18: '0.18',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
        85: '0.85',
        88: '0.88',
        92: '0.92',
        96: '0.96',
        97: '0.97',
      },

      fontFamily: {
        // Fraunces carries the display weight; Plus Jakarta handles body copy and
        // keeps Devanagari readable through the Noto fallback.
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: [
          '"Plus Jakarta Sans"',
          '"Noto Sans Devanagari"',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      fontSize: {
        // Fluid ramp — no media queries needed for headline sizing.
        'fluid-xs': 'clamp(0.78rem, 0.74rem + 0.18vw, 0.86rem)',
        'fluid-sm': 'clamp(0.88rem, 0.84rem + 0.2vw, 0.96rem)',
        'fluid-base': 'clamp(1rem, 0.95rem + 0.25vw, 1.09rem)',
        'fluid-lg': 'clamp(1.13rem, 1.05rem + 0.4vw, 1.31rem)',
        'fluid-xl': 'clamp(1.35rem, 1.2rem + 0.7vw, 1.75rem)',
        'fluid-2xl': 'clamp(1.7rem, 1.4rem + 1.4vw, 2.6rem)',
        'fluid-3xl': 'clamp(2.1rem, 1.6rem + 2.3vw, 3.6rem)',
        'fluid-4xl': 'clamp(2.6rem, 1.8rem + 3.6vw, 5.2rem)',
      },
      spacing: {
        section: 'clamp(3.5rem, 2rem + 6vw, 8rem)',
        gutter: 'clamp(1.15rem, 0.6rem + 2.2vw, 3rem)',
      },
      maxWidth: {
        shell: '82rem',
        prose: '68ch',
      },
      borderRadius: {
        organic: '2.5rem 2.5rem 2.5rem 0.75rem',
        leaf: '3.5rem 0.75rem 3.5rem 0.75rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--c-soil) / 0.04), 0 8px 24px -12px rgb(var(--c-soil) / 0.16)',
        lift: '0 2px 4px rgb(var(--c-soil) / 0.05), 0 20px 48px -20px rgb(var(--c-soil) / 0.3)',
        inset: 'inset 0 1px 0 rgb(255 255 255 / 0.5)',
      },
      transitionTimingFunction: {
        organic: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0) rotate(0deg)' },
          '50%': { transform: 'translate3d(0,-14px,0) rotate(3deg)' },
        },
        grow: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        drift: 'drift 9s ease-in-out infinite',
        grow: 'grow 0.9s cubic-bezier(0.22,1,0.36,1) forwards',
      },
    },
  },
  plugins: [],
};
