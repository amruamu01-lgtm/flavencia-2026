/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF7',
          100: '#F9F5EC',
          200: '#F1E5AC',
          300: '#E5C158',
          400: '#D4AF37',
          500: '#C5A059',
          600: '#A68238',
          700: '#7E6023',
          800: '#543F14',
          900: '#2E2207',
        },
        dark: {
          base: '#0B0B0E',
          card: '#131318',
          cardHover: '#1A1A22',
          border: '#262633',
          muted: '#8E8E9F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
