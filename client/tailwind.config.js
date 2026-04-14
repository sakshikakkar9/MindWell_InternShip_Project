/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mindwell: {
          primary: '#4F46E5', // A calming indigo for wellness
          bg: '#F9FAFB'
        }
      }
    },
  },
  plugins: [],
}