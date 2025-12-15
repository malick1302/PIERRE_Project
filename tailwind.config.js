/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'roar-blue': '#3137FD',
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
        '950': '950',
      },
      // ✅ Marges personnalisées responsive
      spacing: {
        // Mobile
        'roar-x-mobile': '17.22px',
        'roar-y-mobile': '18px',
        // Desktop/Tablette (md et plus)
        'roar-x-desktop': '39.91px',
        'roar-y-desktop': '28px',
        // Logo mute/unmute
        'logo-mb-mobile': '4.13px',
        'logo-mb-desktop': '7.7px',
          // taille photo info mobile
          'picture-x-info-mobile' : '362px',
          'picture-y-info-mobile' : '201px',
        // Taille photo info
'picture-x-info-desk': '60vw',     // largeur = 60% du viewport width
'picture-y-info-desk': 'auto',     // hauteur s'adapte automatiquement

      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
}