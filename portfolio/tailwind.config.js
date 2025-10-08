/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // couleurs personnalisées
        'roar-blue': '#1E40AF',
        'roar-light': '#003DFF',
        'roar-dark': '#3137FD',
        'roar-accent': '#7C7C7C',
        'roar-bg': '#E0E0E0',
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
        'source-sans-3-light-300': ['Source sans 3', 'sans-serif'],
      },
    },
  },
  plugins: [],
}