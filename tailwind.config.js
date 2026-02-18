/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './screens/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        foreground: 'rgba(255, 255, 255, 0.9)',
        muted: {
          DEFAULT: '#1a1a2e',
          foreground: 'rgba(255, 255, 255, 0.5)',
        },
        border: 'rgba(255, 255, 255, 0.12)',
        primary: {
          DEFAULT: '#a855f7',
          foreground: '#ffffff',
          background: 'rgba(168, 85, 247, 0.15)',
        },
        accent: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff',
          background: 'rgba(99, 102, 241, 0.15)',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.12)',
          highlight: 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },
  plugins: [],
};
