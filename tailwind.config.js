/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fdf2f4',
          100: '#fce7ea',
          200: '#f9d0d6',
          300: '#f4a8b5',
          400: '#ec7490',
          500: '#df3d65',
          600: '#c01e4a',
          700: '#8b1a2e',
          800: '#6b1423',
          900: '#4a0d18',
          950: '#2d0810',
        },
        wine: {
          50:  '#fdf2f4',
          100: '#fce7ea',
          200: '#f9d0d6',
          300: '#f4a8b5',
          400: '#ec7490',
          500: '#df3d65',
          600: '#c01e4a',
          700: '#8b1a2e',
          800: '#6b1423',
          900: '#4a0d18',
          950: '#2d0810',
        },
        dark: { 900: '#111111', 800: '#1f1f1f', 700: '#2d2d2d' },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
