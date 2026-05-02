/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          light: '#BDC7AD',
          DEFAULT: '#A3B18A',
          dark: '#8A9A73',
        },
        cream: {
          DEFAULT: '#F6F1EB',
        },
        terracotta: {
          light: '#E6D2C4',
          DEFAULT: '#DDBEA9',
          dark: '#C8A087',
        },
        primary: {
          DEFAULT: '#344E41',
        },
        secondary: {
          DEFAULT: '#6B705C',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -2px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
