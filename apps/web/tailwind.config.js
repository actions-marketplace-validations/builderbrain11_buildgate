/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        buildgate: {
          bg: '#040711',
          surface: '#090e1c',
          card: '#0f172a',
          cardBorder: '#1f293d',
          cyan: '#38bdf8',
          emerald: '#10b981',
          violet: '#a855f7',
          amber: '#f59e0b',
          rose: '#f43f5e',
          slate: '#94a3b8'
        },
        verity: {
          bg: '#040711',
          surface: '#090e1c',
          card: '#0f172a',
          cardBorder: '#1f293d',
          cyan: '#38bdf8',
          emerald: '#10b981',
          violet: '#a855f7',
          amber: '#f59e0b',
          rose: '#f43f5e',
          slate: '#94a3b8'
        }
      }
    },
  },
  plugins: [],
}
