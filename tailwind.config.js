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
        'roar-blue': '#3137FD',
        //bg -->
        'roar-light': 'F8F8F8',
        'greyh': 'D1D1D1',
        'roar-dark': '#3137FD',
        'roar-accent': '#7C7C7C',
        'roar-bg': '#E0E0E0',
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
        Helvetica: ['Helvetica', 'sans-serif'],
        HelveticaNeue: ['HelveticaNeue', 'sans-serif'],
      },

      fontWeight: {
        '950': '950', // Poids personnalisé
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
}