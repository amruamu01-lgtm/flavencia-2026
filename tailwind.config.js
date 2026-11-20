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
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#486581',
          500: '#1E3A5F',
          600: '#172E4D',
          700: '#10223A',
          800: '#0B1728',
          900: '#060D17',
          DEFAULT: '#1E3A5F',
        },
        income: {
          light: '#DCFCE7',
          DEFAULT: '#16A34A',
          dark: '#15803D',
        },
        expense: {
          light: '#FEE2E2',
          DEFAULT: '#DC2626',
          dark: '#B91C1C',
        },
        apptext: {
          DEFAULT: '#374151',
          muted: '#6B7280',
          dark: '#1F2937',
        },
        // Kept for backward compatibility mapping
        gold: {
          50: '#F0F4F8',
          100: '#E2E8F0',
          200: '#CBD5E1',
          300: '#94A3B8',
          400: '#1E3A5F',
          500: '#1E3A5F',
          600: '#172E4D',
          700: '#10223A',
          800: '#0B1728',
          900: '#060D17',
        },
        dark: {
          base: '#FFFFFF',
          card: '#FFFFFF',
          cardHover: '#F9FAFB',
          border: '#E5E7EB',
          muted: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
