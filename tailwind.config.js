/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/views/**/*.blade.php',
    './resources/js/**/*.vue',
    './resources/js/**/*.ts',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        priority: {
          P1: '#ef4444',
          P2: '#f97316',
          P3: '#22c55e',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
