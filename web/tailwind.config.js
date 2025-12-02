/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          300: '#86efac',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          300: '#7dd3fc',
          500: '#0284c7',
          600: '#0369a1',
          700: '#0369a1',
        },
        gradient: {
          start: '#16a34a',
          end: '#065f46',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'card-lg': '0 12px 30px rgba(2,6,23,0.08)',
      },
    },
  },
  plugins: [require('tailwindcss'), require('autoprefixer')],
};
