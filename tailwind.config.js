/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#141B2E',
        parchment: '#F7F5EF',
        surface: '#FFFFFF',
        indigo: {
          DEFAULT: '#233A66',
          deep: '#16233F',
        },
        gold: {
          DEFAULT: '#B8912F',
          soft: '#E9DCB6',
        },
        'verified-green': '#1F6E52',
        'unknown-slate': '#5B6478',
        'error-rust': '#A23B2E',
        hairline: '#DEDACD',
        'muted-text': '#6B7280',
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        hero: ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'hero-mobile': ['2.25rem', { lineHeight: '1.15', fontWeight: '700' }],
        h2: ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'h2-mobile': ['1.75rem', { lineHeight: '1.25', fontWeight: '600' }],
        h3: ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3-mobile': ['1.25rem', { lineHeight: '1.35', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.6' }],
        small: ['0.875rem', { lineHeight: '1.5' }],
        micro: ['0.75rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        card: '10px',
        button: '8px',
        pill: '999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(20, 27, 46, 0.06)',
        card: '0 4px 16px rgba(20, 27, 46, 0.08)',
        elevated: '0 12px 32px rgba(20, 27, 46, 0.12)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '180ms',
        smooth: '220ms',
      },
    },
  },
  plugins: [],
}
